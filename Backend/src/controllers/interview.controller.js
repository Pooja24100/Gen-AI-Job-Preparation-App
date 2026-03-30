global.DOMMatrix = require('@thednp/dommatrix');

const pdf = require('pdf-parse/lib/pdf-parse.js');
const {generateInterviewReport , generateResumePdf} = require('../services/ai.service');
const interviewReportModel = require('../models/interviewReport.model');

async function generateInterviewReportController(req, res) {
    try {
        const resumeFile = req.file;

        if (!resumeFile) {
            return res.status(400).json({
                success: false,
                message: "Resume file is required"
            });
        }

        // ✅ FIXED PDF parsing
        const data = await pdf(resumeFile.buffer);
        const resumeText = data.text;

        const { selfDescription, jobDescription } = req.body;

        const interviewReportByAi = await generateInterviewReport({
            resume: resumeText,
            selfDescription,
            jobDescription
        });

        const interviewReport = await interviewReportModel.create({
            user: req.user.id,
            resume: resumeText,
            selfDescription,
            jobDescription,
            ...interviewReportByAi
        });

        res.status(201).json({
            message: "Interview report generated successfully",
            success: true,
            data: interviewReport
        });

    } catch (error) {
        console.error("ERROR:", error);

        const statusCode = error.statusCode || error.status || 500;
        const message = statusCode === 503
            ? "AI service is temporarily unavailable. Please try again shortly."
            : "Something went wrong";

        res.status(statusCode).json({
            success: false,
            message
        });
    }
}

async function getInterviewReportByIdController(req, res) {
    const { InterviewId } = req.params;

    const interviewReport = await interviewReportModel.findOne({ _id: InterviewId, user: req.user.id });

    if (!interviewReport) {
        return res.status(404).json({
            success: false,
            message: "Interview report not found"
        });
    }

    res.status(200).json({
        success: true,
        message: "Interview report fetched successfully",
        data: interviewReport
    });
}

async function getAllInterviewReportsController(req, res) {
    const interviewReports = await interviewReportModel.find({ user: req.user.id }).sort({ createdAt: -1 }).select("-resume -selfDescription -jobDescription -__v -technicalQuestions -behavioralQuestions -skillGaps -preparationPlan");
    res.status(200).json({
        success: true,
        message: "Interview reports fetched successfully",
        data: interviewReports
    });
}

async function generateResumePdfController(req, res) {
    try {
        const { interviewReportId } = req.params;

        const interviewReport = await interviewReportModel.findOne({
            _id: interviewReportId,
            user: req.user.id
        });

        if (!interviewReport) {
            return res.status(404).json({
                success: false,
                message: "Interview report not found"
            });
        }

        const { resume, jobDescription, selfDescription } = interviewReport;

        const pdfBuffer = await generateResumePdf({ resume, jobDescription, selfDescription });

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=resume_${interviewReportId}.pdf`,
            'Content-Length': pdfBuffer.length
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error("ERROR:", error);

        const statusCode = error.statusCode || error.status || 500;
        const message = statusCode === 503
            ? "AI service is temporarily unavailable. Please try again shortly."
            : "Failed to generate resume PDF";

        res.status(statusCode).json({
            success: false,
            message
        });
    }
}

module.exports = { generateInterviewReportController, getInterviewReportByIdController, getAllInterviewReportsController ,generateResumePdfController};
