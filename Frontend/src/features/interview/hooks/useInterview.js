import {getAllInterviewReports , generateInterviewReport , getInterviewReportById,generateResumePdf} from "../services/interview.api"
import { useContext } from "react"
import { InterviewContext } from "../interview.context"

export const useInterview = () => {

    const context = useContext(InterviewContext)

    if (!context) {
        throw new Error("useInterview must be used within an InterviewProvider")
    }

    const { loading, setLoading, report, setReport, reports, setReports } = context

    const generateReport = async({jobDescription, selfDescription, resumeFile}) => {
        try {
            setLoading(true)
            const response = await generateInterviewReport({jobDescription, selfDescription, resumeFile})
            setReport(response.data)
            setReports((prevReports) => [response.data, ...prevReports])
            setLoading(false)
            return response.data
        } catch (error) {
            console.error("Error generating interview report:", error)
            setLoading(false)
            return null
        }
    }

    const getReportById = async (interviewId) => {
        try {
            setLoading(true)
            const response = await getInterviewReportById(interviewId)
            setReport(response.data)
            setLoading(false)
        } catch (error) {
            console.error("Error fetching interview report:", error)
            setLoading(false)
        }
    }

    const getReports = async () => {
        try {
            setLoading(true)
            const response = await getAllInterviewReports()
            setReports(response.data)
            setLoading(false)
            return response.data
        } catch (error) {
            console.error("Error fetching interview reports:", error)
            setLoading(false)
            return []
        }
    }

    const getResumePdf = async (interviewReportId) => {
         setLoading(true)
         let response = null
        try {
            response = await generateResumePdf({interviewReportId})
            const url = window.URL.createObjectURL(new Blob([response], { type: "application/pdf" }))
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", `resume_${interviewReportId}.pdf`)
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
        } catch (error) {
            console.error("Error generating resume PDF:", error)
        } finally {
            setLoading(false)
        }
    }
           

    return { loading, report, reports, generateReport, getReportById, getReports, getResumePdf }
}
