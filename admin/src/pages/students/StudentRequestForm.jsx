import React, { useState, useEffect, useCallback } from "react";
import assignmentService from "../../services/assignmentService";
import { useAuth } from "../../context/AuthContext";
import "./StudentRequestForm.css";

export default function StudentDashboard() {
    const { user } = useAuth() || {};

    const studentInfo = {
        name: user?.name || "Student",
        rollNumber: user?.rollNumber || user?.rollNo || "--",
        department: user?.department || "Computer Technology",
        organization: user?.organizationName || user?.orgName || "Institution",
        lastLogin: new Date().toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        }),
    };

    const [form, setForm] = useState({
        projectName: "",
        startDate: "",
        endDate: "",
        hodLetter: null,
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");
    const [successModalData, setSuccessModalData] = useState(null);
    const [requests, setRequests] = useState([]);

    const loadRequests = useCallback(async () => {
        try {
            setLoading(true);
            const res = await assignmentService.getMyRequests();
            const data = res?.data || res || [];
            setRequests(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Failed to load requests:", err);
            setError("Unable to load access requests from server.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadRequests();
    }, [loadRequests]);

    const pendingRequest = requests.find((r) => r.status === "PENDING");
    const hasPendingRequest = Boolean(pendingRequest);

    const stats = {
        total: requests.length,
        pending: requests.filter((r) => r.status === "PENDING").length,
        approved: requests.filter((r) => r.status === "APPROVED" || r.status === "ACTIVE").length,
        rejected: requests.filter((r) => r.status === "REJECTED" || r.status === "EXPIRED").length,
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        if (error) setError("");
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setForm((prev) => ({ ...prev, hodLetter: e.target.files[0] }));
            if (error) setError("");
        }
    };

    const handleRemoveFile = () => {
        setForm((prev) => ({ ...prev, hodLetter: null }));
        if (document.getElementById("hodLetterInput")) {
            document.getElementById("hodLetterInput").value = "";
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        // 1. Context-Aware Field Validation
        const missingFields = [];
        if (!form.projectName.trim()) missingFields.push("Project Name");
        if (!form.startDate) missingFields.push("Start Date");
        if (!form.endDate) missingFields.push("End Date");
        if (!form.hodLetter) missingFields.push("Signed HOD Letter");

        if (missingFields.length > 0) {
            setError(`Please fill in the following required field(s): ${missingFields.join(", ")}.`);
            return;
        }

        // 2. Date Criteria Logic Validation
        const start = new Date(form.startDate);
        const end = new Date(form.endDate);

        if (end <= start) {
            setError("End Date must be after the Start Date.");
            return;
        }

        const formData = new FormData();
        formData.append("projectName", form.projectName);
        formData.append("startDate", form.startDate);
        formData.append("endDate", form.endDate);
        formData.append("hodLetter", form.hodLetter);

        try {
            setSaving(true);
            await assignmentService.submitRequest(formData);

            setSuccessModalData({
                projectName: form.projectName,
            });

            setForm({
                projectName: "",
                startDate: "",
                endDate: "",
                hodLetter: null,
            });

            if (document.getElementById("hodLetterInput")) {
                document.getElementById("hodLetterInput").value = "";
            }

            await loadRequests();
        } catch (err) {
            console.error("Submission failed:", err);
            setError(err.response?.data?.message || "Failed to submit request to server.");
        } finally {
            setSaving(false);
        }
    };

    const latestRequest = requests[0];

    return (
        <div className="student-dashboard-wrapper">
            <header className="student-navbar">
                <div className="brand-title">
                    <span className="brand-icon">⚡</span>
                    <h2>AI LAB MAINTENANCE</h2>
                    <span className="portal-badge">Student Portal</span>
                </div>
                <div className="user-profile-badge">
                    <div className="user-details-brief">
                        <span className="user-name">{studentInfo.name}</span>
                        <span className="user-role">Student</span>
                    </div>
                    <div className="avatar-circle">{studentInfo.name.charAt(0)}</div>
                </div>
            </header>

            <main className="student-dashboard-container">
                <section className="dashboard-welcome-banner">
                    <div className="banner-main-text">
                        <h1>👋 Welcome back, {studentInfo.name}</h1>
                        <p>Manage your AI Lab system requests, track approvals, and check assigned computer configurations.</p>
                    </div>
                    <div className="banner-meta">
                        <div className="meta-pill">
                            <span className="meta-label">Organization:</span>
                            <span className="meta-value">{studentInfo.organization}</span>
                        </div>
                        <div className="meta-pill">
                            <span className="meta-label">Last Login:</span>
                            <span className="meta-value">{studentInfo.lastLogin}</span>
                        </div>
                    </div>
                </section>

                <section className="profile-cards-grid">
                    <div className="profile-card">
                        <span className="card-icon">👤</span>
                        <div className="card-info">
                            <span className="card-label">Student Name</span>
                            <span className="card-value">{studentInfo.name}</span>
                        </div>
                    </div>
                    <div className="profile-card">
                        <span className="card-icon">🎓</span>
                        <div className="card-info">
                            <span className="card-label">Roll Number</span>
                            <span className="card-value">{studentInfo.rollNumber}</span>
                        </div>
                    </div>
                    <div className="profile-card">
                        <span className="card-icon">📚</span>
                        <div className="card-info">
                            <span className="card-label">Department</span>
                            <span className="card-value">{studentInfo.department}</span>
                        </div>
                    </div>
                    <div className="profile-card">
                        <span className="card-icon">🏛️</span>
                        <div className="card-info">
                            <span className="card-label">Institution</span>
                            <span className="card-value">{studentInfo.organization}</span>
                        </div>
                    </div>
                </section>

                <div className="dashboard-grid">
                    <section className="dashboard-panel requests-panel">
                        <div className="panel-header">
                            <div>
                                <h3>📋 My System Requests</h3>
                                <p className="subtext">View history, approval statuses, and assigned hardware</p>
                            </div>
                        </div>

                        <div className="table-responsive">
                            <table className="my-requests-table">
                                <thead>
                                    <tr>
                                        <th>Project Name</th>
                                        <th>Duration</th>
                                        <th>HOD Letter</th>
                                        <th>Status</th>
                                        <th>Reference ID</th>
                                        <th>Assigned System</th>
                                        <th>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan="7" style={{ textAlign: "center", padding: "24px" }}>
                                                Loading system requests...
                                            </td>
                                        </tr>
                                    ) : requests.length === 0 ? (
                                        <tr>
                                            <td colSpan="7">
                                                <div className="empty-state">
                                                    <span className="empty-icon">📄</span>
                                                    <h4>No Requests Yet</h4>
                                                    <p>Submit your first request below to gain access to laboratory systems.</p>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : (
                                        requests.map((req) => (
                                            <tr key={req.id}>
                                                <td className="project-name-cell">{req.projectName}</td>
                                                <td className="duration-cell">
                                                    {req.startDate && req.endDate ? `${req.startDate} to ${req.endDate}` : "--"}
                                                </td>
                                                <td className="file-cell">
                                                    {req.hodLetterPath ? (
                                                        <a
                                                            href={`http://localhost:5000${req.hodLetterPath}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: "#2563eb", fontWeight: "600", textDecoration: "underline" }}
                                                        >
                                                            📄 View Letter
                                                        </a>
                                                    ) : (
                                                        <span className="text-muted">--</span>
                                                    )}
                                                </td>
                                                <td>
                                                    <span className={`status-pill status-${(req.status || "pending").toLowerCase()}`}>
                                                        {req.status === "PENDING" && "🟡 "}
                                                        {(req.status === "APPROVED" || req.status === "ACTIVE") && "🟢 "}
                                                        {(req.status === "REJECTED" || req.status === "EXPIRED") && "🔴 "}
                                                        {req.status}
                                                    </span>
                                                </td>
                                                <td className="ref-id-cell">
                                                    {req.referenceId && req.referenceId !== "--" ? (
                                                        <span className="ref-id-badge">{req.referenceId}</span>
                                                    ) : (
                                                        <span className="text-muted">--</span>
                                                    )}
                                                </td>
                                                <td className="system-cell">{req.assignedSystem || "Unassigned"}</td>
                                                <td className="date-cell">{req.submittedOn}</td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <aside className="dashboard-sidebar">
                        <div className="dashboard-panel sidebar-panel">
                            <h3>📊 Quick Status</h3>
                            <div className="metrics-grid">
                                <div className="metric-card yellow">
                                    <span className="metric-number">{stats.pending}</span>
                                    <span className="metric-title">🟡 Pending</span>
                                </div>
                                <div className="metric-card green">
                                    <span className="metric-number">{stats.approved}</span>
                                    <span className="metric-title">🟢 Approved</span>
                                </div>
                                <div className="metric-card red">
                                    <span className="metric-number">{stats.rejected}</span>
                                    <span className="metric-title">🔴 Rejected</span>
                                </div>
                                <div className="metric-card blue">
                                    <span className="metric-number">{stats.total}</span>
                                    <span className="metric-title">🔵 Total</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-panel sidebar-panel">
                            <h3>🔔 Request Activity</h3>
                            <div className="timeline-wrapper">
                                {latestRequest ? (
                                    <>
                                        <div className="timeline-item done">
                                            <div className="timeline-icon">✓</div>
                                            <div className="timeline-content">
                                                <h4>Request Submitted</h4>
                                                <p>{latestRequest.submittedOn} • {latestRequest.projectName}</p>
                                            </div>
                                        </div>
                                        <div className={`timeline-item ${latestRequest.status === "PENDING" ? "active" : "done"}`}>
                                            <div className="timeline-icon">{latestRequest.status === "PENDING" ? "⏳" : "✓"}</div>
                                            <div className="timeline-content">
                                                <h4>Under Review</h4>
                                                <p>{latestRequest.status === "PENDING" ? "Admin processing" : "Review complete"}</p>
                                            </div>
                                        </div>
                                        <div className={`timeline-item ${latestRequest.status === "APPROVED" || latestRequest.status === "ACTIVE" ? "done" : ""}`}>
                                            <div className="timeline-icon">💻</div>
                                            <div className="timeline-content">
                                                <h4>System Allocation</h4>
                                                <p>{latestRequest.assignedSystem !== "Unassigned" ? latestRequest.assignedSystem : "Pending allocation"}</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <p className="text-muted" style={{ padding: "12px 0" }}>No recent activity to show.</p>
                                )}
                            </div>
                        </div>
                    </aside>
                </div>

                <section className="dashboard-panel form-panel">
                    <div className="form-panel-header">
                        <h3>📤 Submit New System Request</h3>
                        <p>Fill in details and upload your approved HOD permission document.</p>
                    </div>

                    <div className="form-panel-body">
                        {hasPendingRequest && (
                            <div className="active-warning-card">
                                <span className="warning-icon">⚠</span>
                                <div>
                                    <h4>Active Request Pending</h4>
                                    <p>You currently have a request awaiting review. Please wait until your active request is finalized before submitting a new one.</p>
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="student-form-grid">
                            <div className="form-group full-width">
                                <label className="form-label">Project Name *</label>
                                <input
                                    type="text"
                                    name="projectName"
                                    className="form-input"
                                    placeholder="e.g. Fine-Tuning LLMs on Edge Infrastructure"
                                    value={form.projectName}
                                    onChange={handleChange}
                                    disabled={hasPendingRequest || saving}
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label className="form-label">Start Date *</label>
                                    <input
                                        type="date"
                                        name="startDate"
                                        className="form-input"
                                        value={form.startDate}
                                        onChange={handleChange}
                                        disabled={hasPendingRequest || saving}
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">End Date *</label>
                                    <input
                                        type="date"
                                        name="endDate"
                                        className="form-input"
                                        value={form.endDate}
                                        onChange={handleChange}
                                        disabled={hasPendingRequest || saving}
                                    />
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label className="form-label">Upload Signed HOD Letter (PDF or Image) *</label>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                                    <input
                                        id="hodLetterInput"
                                        type="file"
                                        accept=".pdf,.jpg,.jpeg,.png"
                                        className="form-input file-input"
                                        onChange={handleFileChange}
                                        disabled={hasPendingRequest || saving}
                                        style={{ maxWidth: "280px" }}
                                    />
                                    {form.hodLetter && (
                                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", backgroundColor: "#eff6ff", padding: "6px 12px", borderRadius: "6px", border: "1px solid #bfdbfe" }}>
                                            <span style={{ fontSize: "13px", color: "#1e40af", fontWeight: "500" }}>Selected:</span>
                                            <a
                                                href={URL.createObjectURL(form.hodLetter)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                style={{ color: "#2563eb", fontWeight: "600", fontSize: "13px", textDecoration: "underline" }}
                                            >
                                                {form.hodLetter.name}
                                            </a>
                                            <button
                                                type="button"
                                                onClick={handleRemoveFile}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    color: "#ef4444",
                                                    fontWeight: "bold",
                                                    cursor: "pointer",
                                                    marginLeft: "4px",
                                                    fontSize: "14px",
                                                    lineHeight: 1
                                                }}
                                                title="Remove file"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {error && <div className="alert-box danger">{error}</div>}

                            <button
                                type="submit"
                                className="submit-request-btn"
                                disabled={hasPendingRequest || saving}
                            >
                                {saving ? "Submitting Request..." : "Submit Request"}
                            </button>
                        </form>
                    </div>
                </section>
            </main>

            {/* Submission Success Dialog */}
{successModalData && (
    <div className="modal-overlay">
        <div className="modal-card">
            <div className="modal-icon">✅</div>
            <h3>Request Submitted Successfully</h3>
            <p>Your laboratory access request has been received.</p>

            <div className="modal-details" style={{ display: "flex", flexDirection: "column", gap: "12px", margin: "20px 0", textAlign: "left" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#64748b", fontWeight: "500", minWidth: "110px" }}>Project Name:</span>
                    <strong style={{ color: "#1e293b", fontSize: "15px" }}>{successModalData.projectName}</strong>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <span style={{ color: "#64748b", fontWeight: "500", minWidth: "110px" }}>Status:</span>
                    <span className="status-pill status-pending" style={{ margin: 0 }}>🟡 Pending</span>
                </div>
            </div>

            <p className="modal-note">
                Your Reference ID and System Allocation will be generated once your request is approved by the administrator.
            </p>

            <button className="modal-close-btn" onClick={() => setSuccessModalData(null)}>
                Back to Dashboard
            </button>
        </div>
    </div>
)}
        </div>
    );
}