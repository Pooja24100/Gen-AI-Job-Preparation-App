import React from "react";
import { useNavigate } from "react-router";

const getScoreClassName = (score) => {
    if (score >= 80) return "score-pill score-pill--high";
    if (score >= 60) return "score-pill score-pill--medium";
    return "score-pill score-pill--low";
};

const formatDate = (value) => new Date(value).toLocaleDateString();

const candidateNameFromReport = (report) => report?.candidateName || "Candidate";

const ReportTable = ({ reports = [], emptyMessage = "No interviews found yet." }) => {
    const navigate = useNavigate();

    if (!reports.length) {
        return (
            <div className="empty-state">
                <h3>No interview reports yet</h3>
                <p>{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="data-table-wrap">
            <table className="data-table">
                <thead>
                    <tr>
                        <th>Candidate Name</th>
                        <th>Job Role</th>
                        <th>Match Score</th>
                        <th>Date</th>
                    </tr>
                </thead>
                <tbody>
                    {reports.map((report) => (
                        <tr key={report._id} onClick={() => navigate(`/interview/${report._id}`)}>
                            <td>{candidateNameFromReport(report)}</td>
                            <td>{report.title || "Untitled Role"}</td>
                            <td>
                                <span className={getScoreClassName(report.matchScore || 0)}>
                                    {report.matchScore || 0}%
                                </span>
                            </td>
                            <td>{formatDate(report.createdAt)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default ReportTable;
