const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer");

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})

const MODEL_CANDIDATES = [
    process.env.GOOGLE_GENAI_MODEL,
    "gemini-2.5-flash",
    "gemini-2.0-flash",
    "gemini-1.5-flash"
].filter(Boolean);

class AIServiceError extends Error {
    constructor(message, statusCode = 500, cause = null) {
        super(message);
        this.name = "AIServiceError";
        this.statusCode = statusCode;
        this.cause = cause;
    }
}

const interviewReportSchema = z.object({
    matchScore: z.number().describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description, based on the analysis of resume, self description and job description"),
    technicalQuestions: z.array(z.object({
        question: z.string().describe("The technical question can be asked in the interview"),
        answer: z.string().describe("How to answer the question, what points to cover, what approach to take etc."),
        intention: z.string().describe("The intention of interviewer behind asking the question")
    })).describe("technical questions that can be asked in the interview along with their answers and intentions"),
    behavioralQuestions: z.array(z.object({
        question: z.string().describe("The behavioral question can be asked in the interview"),
        answer: z.string().describe("How to answer the question, what points to cover, what approach to take etc."),
        intention: z.string().describe("The intention of interviewer behind asking the question")
    })).describe("behavioral questions that can be asked in the interview along with their answers and intentions"),
    skillGaps: z.array(z.object({
        skill: z.string().describe("The skill in which candidate is lacking"),
        severity: z.enum(["low", "medium", "high"]).describe("How severe is the skill gap"),
    })).describe("List of skill gaps in the candidate's profile along with their severity"),
    preparationPlan: z.array(z.object({
        day: z.number().describe("The day number in the preparation plan, starting from 1"),
        focus: z.string().describe("The main focus of that day in the preparation plan, e.g. data structures, system design, mock interviews etc."),
        task: z.array(z.string()).describe("List of tasks to be done on that day to prepare for the interview, e.g. solve 3 easy, 2 medium and 1 hard problem on leetcode, read system design primer, do mock interview with a friend etc.")
    })).describe("A day-wise preparation plan for the candidate to prepare for the interview"),
    title: z.string().describe("The title of the job for which the interview report is generated")
})

function parseJsonResponse(text) {
    if (!text) return {};

    const cleaned = text
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

    return JSON.parse(cleaned);
}

function clampMatchScore(value) {
    const parsedScore = Number(value);

    if (Number.isFinite(parsedScore)) {
        return Math.max(0, Math.min(100, parsedScore));
    }

    return 50;
}

function normalizeQuestionItem(item, fallbackIntention) {
    if (typeof item === "string") {
        return {
            question: item,
            answer: "Explain the reasoning clearly, cover the core concepts, and support the answer with one relevant example.",
            intention: fallbackIntention
        };
    }

    return {
        question: item?.question || "Question not provided",
        answer: item?.answer || "Explain the reasoning clearly, cover the core concepts, and support the answer with one relevant example.",
        intention: item?.intention || fallbackIntention
    };
}

function normalizeSkillGapItem(item) {
    if (typeof item === "string") {
        return {
            skill: item,
            severity: "medium"
        };
    }

    const severity = ["low", "medium", "high"].includes(item?.severity) ? item.severity : "medium";

    return {
        skill: item?.skill || "Unspecified skill gap",
        severity
    };
}

function normalizePreparationPlanItem(item, index) {
    if (typeof item === "string") {
        return {
            day: index + 1,
            focus: item,
            task: [item]
        };
    }

    const rawTasks = Array.isArray(item?.task)
        ? item.task.filter(task => typeof task === "string" && task.trim())
        : typeof item?.task === "string"
            ? [item.task]
            : [];

    return {
        day: Number.isFinite(Number(item?.day)) ? Number(item.day) : index + 1,
        focus: item?.focus || `Preparation Day ${index + 1}`,
        task: rawTasks.length ? rawTasks : [`Complete the main focus for day ${index + 1}`]
    };
}

function deriveTitle(rawTitle, jobDescription) {
    if (typeof rawTitle === "string" && rawTitle.trim()) {
        return rawTitle.trim();
    }

    if (typeof jobDescription === "string" && jobDescription.trim()) {
        const firstLine = jobDescription
            .split("\n")
            .map(line => line.trim())
            .find(Boolean);

        if (firstLine) {
            return firstLine.slice(0, 120);
        }
    }

    return "Interview Report";
}

function normalizeInterviewReport(raw, jobDescription) {
    const technicalQuestions = Array.isArray(raw?.technicalQuestions)
        ? raw.technicalQuestions.map(item => normalizeQuestionItem(item, "Assess technical depth and problem-solving ability"))
        : [];

    const behavioralQuestions = Array.isArray(raw?.behavioralQuestions)
        ? raw.behavioralQuestions.map(item => normalizeQuestionItem(item, "Assess communication, ownership, and collaboration"))
        : [];

    const skillGaps = Array.isArray(raw?.skillGaps)
        ? raw.skillGaps.map(normalizeSkillGapItem)
        : [];

    const preparationPlan = Array.isArray(raw?.preparationPlan)
        ? raw.preparationPlan.map(normalizePreparationPlanItem)
        : [];

    return {
        title: deriveTitle(raw?.title, jobDescription),
        matchScore: clampMatchScore(raw?.matchScore),
        technicalQuestions: technicalQuestions.length ? technicalQuestions : [{
            question: "Explain event loop in Node.js",
            answer: "Discuss the call stack, event loop phases, microtasks, and how asynchronous callbacks are scheduled.",
            intention: "Check backend fundamentals"
        }],
        behavioralQuestions: behavioralQuestions.length ? behavioralQuestions : [{
            question: "Tell me about a challenge you faced in a project",
            answer: "Answer in STAR format and focus on your specific actions, tradeoffs, and measurable outcome.",
            intention: "Evaluate problem-solving and ownership"
        }],
        skillGaps: skillGaps.length ? skillGaps : [{
            skill: "System Design",
            severity: "medium"
        }],
        preparationPlan: preparationPlan.length ? preparationPlan : [{
            day: 1,
            focus: "DSA",
            task: ["Solve 3 problems and review tradeoffs for each solution"]
        }]
    };
}

function isRetryableModelError(error) {
    const status = error?.status || error?.error?.code;
    return status === 429 || status === 500 || status === 503;
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function generateWithRetry({ prompt, responseSchema }) {
    let lastError = null;

    for (const model of MODEL_CANDIDATES) {
        for (let attempt = 1; attempt <= 3; attempt += 1) {
            try {
                return await ai.models.generateContent({
                    model,
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema
                    }
                });
            } catch (error) {
                lastError = error;

                if (!isRetryableModelError(error)) {
                    throw error;
                }

                if (attempt < 3) {
                    await sleep(400 * (2 ** (attempt - 1)));
                    continue;
                }
            }
        }
    }

    throw new AIServiceError(
        "AI service is temporarily unavailable. Please try again in a moment.",
        503,
        lastError
    );
}

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {
    const prompt = `
You MUST return a STRICT JSON response.

Rules:
- Do NOT skip any field
- Do NOT return empty arrays
- title must be a short job title for this report
- Generate at least:
  - 5 technicalQuestions
  - 3 behavioralQuestions
  - 3 skillGaps
  - 5 days preparationPlan
- matchScore must be between 0-100

Return ONLY valid JSON.

Data:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}
`;
    const response = await generateWithRetry({
        prompt,
        responseSchema: zodToJsonSchema(interviewReportSchema)
    });

    const rawResponse = parseJsonResponse(response.text);
    const normalizedResponse = normalizeInterviewReport(rawResponse, jobDescription);

    return interviewReportSchema.parse(normalizedResponse);

}

async function generatePdfFromHtml(htmlContent) {
  const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setContent(htmlContent , { waitUntil: 'networkidle0' });
    const pdfBuffer = await page.pdf({format: 'A4' ,margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }});
    await browser.close();
    return pdfBuffer;
}
 
async function generateResumePdf({resume, selfDescription, jobDescription}) {
    const resumepdfSchema = z.object({
        html: z.string().describe("The Html content of the resume which can be converted to pdf using any library like puppeteer")
    });

    const prompt = `Generate a resume for a candidate based on the following information. Return ONLY valid JSON with the HTML content of the resume.

Rules:
- The resume should be concise and well-structured, highlighting the candidate's relevant skills, experience, and achievements.
- Use bullet points for easy readability.
- Include sections such as Summary, Skills, Experience, and Education.
- The HTML must contain the complete resume from top to bottom and must not omit header details.
- The design should remain professional, clean, and ATS friendly.
- Return a full HTML document inside the "html" field.

Data:
Resume: ${resume}
Self Description: ${selfDescription}
Job Description: ${jobDescription}

the response should be Json object with a single field "html" containing the HTML content of the resume.
the resume should be tailored to the job description, emphasizing the most relevant aspects of the candidate's background and how they align with the requirements of the position.
the content of resume should be not sound like its generated by AI and should be suitable for sharing with recruiters and hiring managers.
you can highlight the content using some colors but the overall design should be professional and clean.
the content should be ATS friendly, avoiding complex formatting that might not be parsed correctly by applicant tracking systems.
the content should be optimized for both human readers and ATS, ensuring that key information is easily accessible and stands out appropriately.
the resume should not be so lengthy , it should ideally be 1-2 pages long when converted to PDF. Focus on quality and relevance of information rather than quantity and make sure to include all the revelant information that can increase the chances of candidate getting an interview call.
`;

    const response = await generateWithRetry({
        prompt,
        responseSchema: zodToJsonSchema(resumepdfSchema)
    });

    const jsonContent = resumepdfSchema.parse(parseJsonResponse(response.text));

    return generatePdfFromHtml(jsonContent.html);
}

module.exports = {generateInterviewReport , generateResumePdf};
