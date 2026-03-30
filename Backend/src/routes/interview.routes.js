const express = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const interviewController = require('../controllers/interview.controller');
const upload = require('../middlewares/file.middleware');

const interviewRouter = express.Router();

/**
 * @route POST /api/interview/
 * @desc Generate interview report for a candidate based on resume pdf, self description and job description
 * @access Private
 */
interviewRouter.post("/",authMiddleware.authUser ,upload.single('resume'), interviewController.generateInterviewReportController)

/**
 * @route GET /api/interview/report/:InterviewId
 * @desc Get interview report for a specific interview
 * @access Private
 */
interviewRouter.get("/report/:InterviewId", authMiddleware.authUser, interviewController.getInterviewReportByIdController);

/**
 * @description Get all interview reports for the authenticated user
 * @route GET /api/interview/reports
 * @access Private
 */
interviewRouter.get("/", authMiddleware.authUser, interviewController.getAllInterviewReportsController);

/**
 * @description Generate a PDF of the candidate's resume based on the interview report
 * @route GET /api/interview/resume/:interviewReportId
 * @access Private
 */
interviewRouter.post("/resume/pdf/:interviewReportId", authMiddleware.authUser, interviewController.generateResumePdfController);

module.exports = interviewRouter;