import React, { useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useInterview } from "../hooks/useInterview";
import "../style/home.scss";

const Upload = () => {
    const { generateReport, loading } = useInterview();
    const [jobDescription, setJobDescription] = useState("");
    const [selfDescription, setSelfDescription] = useState("");
    const resumeInputRef = useRef(null);
    const navigate = useNavigate();

    const handleSubmit = async (event) => {
        event.preventDefault();

        const resumeFile = resumeInputRef.current?.files?.[0];
        const data = await generateReport({ jobDescription, selfDescription, resumeFile });

        if (data?._id) {
            navigate(`/interview/${data._id}`);
        }
    };

    return (
        <div className="workspace-page">
            <section className="upload-card">
                <div className="section-card__header">
                    <div>
                        <p className="section-eyebrow">Upload workflow</p>
                        <h1>Create a new interview project</h1>
                    </div>
                    <span className="section-status">{loading ? "Generating..." : "Ready"}</span>
                </div>

                <form className="upload-form" onSubmit={handleSubmit}>
                    <label className="field-card field-card--upload" htmlFor="resume">
                        <span className="field-card__label">Resume Upload</span>
                        <strong>Drop a PDF or DOCX file</strong>
                        <p>The existing upload API remains unchanged. This form only improves the UI.</p>
                        <input ref={resumeInputRef} type="file" id="resume" name="resume" accept=".pdf,.docx" />
                    </label>

                    <div className="field-grid">
                        <label className="field-card">
                            <span className="field-card__label">Self Description</span>
                            <textarea
                                value={selfDescription}
                                onChange={(event) => setSelfDescription(event.target.value)}
                                placeholder="Summarize experience, strengths, domain focus, and achievements."
                                rows={8}
                            />
                        </label>

                        <label className="field-card">
                            <span className="field-card__label">Job Description</span>
                            <textarea
                                value={jobDescription}
                                onChange={(event) => setJobDescription(event.target.value)}
                                placeholder="Paste the target job description here."
                                rows={8}
                            />
                        </label>
                    </div>

                    <div className="form-footer">
                        <p>After success, the app redirects automatically to the interview detail page.</p>
                        <button type="submit" className="primary-link primary-link--button">
                            {loading ? "Generating Interview Plan..." : "Generate Interview Report"}
                        </button>
                    </div>
                </form>
            </section>
        </div>
    );
};

export default Upload;
