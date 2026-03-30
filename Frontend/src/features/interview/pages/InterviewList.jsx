import React, { useEffect } from "react";
import { useInterview } from "../hooks/useInterview";
import ReportTable from "../components/ReportTable";
import "../style/home.scss";

const InterviewList = () => {
    const { reports, getReports, loading } = useInterview();

    useEffect(() => {
        getReports();
    }, []);

    return (
        <div className="workspace-page">
            <section className="section-card">
                <div className="section-card__header">
                    <div>
                        <p className="section-eyebrow">Interview list</p>
                        <h1>All uploaded interview projects</h1>
                    </div>
                    <span className="section-status">{loading ? "Loading..." : `${reports.length} records`}</span>
                </div>

                <ReportTable
                    reports={reports}
                    emptyMessage="No interview reports are available. Generate one from the upload section."
                />
            </section>
        </div>
    );
};

export default InterviewList;
