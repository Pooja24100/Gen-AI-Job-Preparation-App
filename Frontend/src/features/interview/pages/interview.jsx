import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";
import "../style/interview.scss";

const QuestionCard = ({ item, index, isOpen, onToggle }) => (
    <article className={`question-card ${isOpen ? "question-card--open" : ""}`}>
        <button type="button" className="question-card__header" onClick={onToggle}>
            <div className="question-card__top">
                <span className="question-card__index">{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.question}</h3>
            </div>
            <span className={`question-card__chevron ${isOpen ? "question-card__chevron--open" : ""}`}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m6 9 6 6 6-6" />
                </svg>
            </span>
        </button>

        {isOpen && (
            <div className="question-card__meta">
                <div className="question-card__column">
                    <p>Interviewer intention</p>
                    <span>{item.intention}</span>
                </div>
                <div className="question-card__column">
                    <p>Suggested answer</p>
                    <span>{item.answer}</span>
                </div>
            </div>
        )}
    </article>
);

const QuestionSection = ({ title, items }) => {
    const [openIndex, setOpenIndex] = useState(0);

    useEffect(() => {
        setOpenIndex(items.length ? 0 : -1);
    }, [items]);

    return (
        <section className="detail-section">
            <div className="detail-section__header">
                <h2>{title}</h2>
                <span>{items.length} items</span>
            </div>

            <div className="question-grid">
                {items.map((item, index) => (
                    <QuestionCard
                        key={`${title}-${index}`}
                        item={item}
                        index={index}
                        isOpen={openIndex === index}
                        onToggle={() => setOpenIndex((prev) => (prev === index ? -1 : index))}
                    />
                ))}
            </div>
        </section>
    );
};

const Interview = () => {
    const { interviewId } = useParams();
    const { report, loading, getReportById, getResumePdf } = useInterview();

    useEffect(() => {
        if (interviewId) {
            getReportById(interviewId);
        }
    }, [interviewId]);

    if (loading || !report) {
        return (
            <div className="detail-loading">
                <h1>Loading interview report...</h1>
            </div>
        );
    }

    return (
        <div className="interview-detail-page">
            <section className="detail-hero">
                <div>
                    <p className="section-eyebrow">Interview detail</p>
                    <h1>{report.title || "Interview Report"}</h1>
                    <p>Structured review of technical depth, behavioral readiness, skill gaps, and daily preparation work.</p>
                </div>

                <div className="detail-hero__actions">
                    <div className="score-card">
                        <span>Match Score</span>
                        <strong>{report.matchScore}%</strong>
                    </div>
                    <button type="button" className="primary-link primary-link--button" onClick={() => getResumePdf(interviewId)}>
                        Download Resume PDF
                    </button>
                </div>
            </section>

            <section className="detail-grid">
                <div className="detail-main">
                    <QuestionSection title="Technical Questions" items={report.technicalQuestions || []} />
                    <QuestionSection title="Behavioral Questions" items={report.behavioralQuestions || []} />

                    <section className="detail-section">
                        <div className="detail-section__header">
                            <h2>Preparation Plan</h2>
                            <span>{report.preparationPlan?.length || 0} day roadmap</span>
                        </div>

                        <div className="plan-grid">
                            {(report.preparationPlan || []).map((day) => (
                                <article key={day.day} className="plan-card">
                                    <span className="plan-card__day">Day {day.day}</span>
                                    <h3>{day.focus}</h3>
                                    <ul>
                                        {(day.task || day.tasks || []).map((task, index) => (
                                            <li key={`${day.day}-${index}`}>{task}</li>
                                        ))}
                                    </ul>
                                </article>
                            ))}
                        </div>
                    </section>
                </div>

                <aside className="detail-sidebar">
                    <section className="sidebar-card">
                        <p className="sidebar-card__eyebrow">Skill gaps</p>
                        <div className="skill-list">
                            {(report.skillGaps || []).map((gap, index) => (
                                <span key={`${gap.skill}-${index}`} className={`skill-pill skill-pill--${gap.severity}`}>
                                    {gap.skill}
                                </span>
                            ))}
                        </div>
                    </section>

                    <section className="sidebar-card">
                        <p className="sidebar-card__eyebrow">Report summary</p>
                        <ul className="summary-list">
                            <li>Technical Questions: {report.technicalQuestions?.length || 0}</li>
                            <li>Behavioral Questions: {report.behavioralQuestions?.length || 0}</li>
                            <li>Preparation Days: {report.preparationPlan?.length || 0}</li>
                        </ul>
                    </section>
                </aside>
            </section>
        </div>
    );
};

export default Interview;
