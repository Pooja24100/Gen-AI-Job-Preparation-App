import React, { useEffect, useMemo } from "react";
import { Link } from "react-router";
import { useInterview } from "../hooks/useInterview";
import ReportTable from "../components/ReportTable";
import "../style/home.scss";

const Home = () => {
    const { reports, getReports, loading } = useInterview();

    useEffect(() => {
        getReports();
    }, []);

    const metrics = useMemo(() => {
        const totalReports = reports.length;
        const averageScore = totalReports
            ? Math.round(reports.reduce((sum, report) => sum + (report.matchScore || 0), 0) / totalReports)
            : 0;
        const strongMatches = reports.filter((report) => (report.matchScore || 0) >= 80).length;

        return [
            { label: "Total Interviews", value: totalReports, accent: "blue" },
            { label: "Average Match", value: `${averageScore}%`, accent: "teal" },
            { label: "Strong Matches", value: strongMatches, accent: "amber" },
        ];
    }, [reports]);

    return (
        <div className="workspace-page">
            <section className="hero-card">
                <div>
                    <p className="hero-card__eyebrow">Interview command center</p>
                    <h1>Track every candidate submission and move from upload to interview prep quickly.</h1>
                    <p className="hero-card__copy">
                        Review match quality, inspect generated plans, and jump straight into a detailed interview report.
                    </p>
                </div>
                <div className="hero-card__actions">
                    <Link to="/upload" className="primary-link">Upload New Resume</Link>
                    <Link to="/interviews" className="secondary-link">Open Interview List</Link>
                </div>
            </section>

            <section className="metrics-grid">
                {metrics.map((metric) => (
                    <article key={metric.label} className={`metric-card metric-card--${metric.accent}`}>
                        <span>{metric.label}</span>
                        <strong>{metric.value}</strong>
                    </article>
                ))}
            </section>

            <section className="section-card">
                <div className="section-card__header">
                    <div>
                        <p className="section-eyebrow">Recent interview projects</p>
                        <h2>Latest uploads and generated reports</h2>
                    </div>
                    {loading ? <span className="section-status">Refreshing...</span> : <span className="section-status">Live data</span>}
                </div>

                <ReportTable
                    reports={reports.slice(0, 6)}
                    emptyMessage="Upload a resume and generate your first interview plan to populate this dashboard."
                />
            </section>
        </div>
    );
};

export default Home;
