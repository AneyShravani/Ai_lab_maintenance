// ============================================================
// PAGE: UtilizationForm  (Module 3.6 — Utilization)
// ------------------------------------------------------------
// Adds one utilization record: student, tool, project, status.
// labUserId now comes from a real dropdown, populated from
// assignmentService.getAll() — replaces the old TEMP text input.
// Selecting a student auto-fills Project Name from their
// Assignment, but the field stays editable (Option B).
// UPDATED: added liveUrl validation — must be a real URL if
// filled in, blank is allowed.
// ============================================================
import React, { useState, useEffect } from 'react';
import utilizationService from '../../services/utilizationService';
import assignmentService from '../../services/assignmentService';

// checks if a string is a well-formed http/https URL; returns true for empty string (URL is optional)
const isValidUrl = (value) => {
    if (!value.trim()) return true;
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

export default function UtilizationForm({ onRecordAdded }) {
    const [form, setForm] = useState({
        labUserId: '',
        toolName: '',
        projectName: '',
        status: 'not_done',
        liveUrl: '',
        isActive: true,
    });
    const [assignments, setAssignments] = useState([]);
    const [loadingAssignments, setLoadingAssignments] = useState(true);
    const [error, setError] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadAssignments = async () => {
            try {
                const res = await assignmentService.getAll();

                // Handles { success: true, data: [...] }, { data: [...] }, or raw [...]
                const list = Array.isArray(res) 
                    ? res 
                    : Array.isArray(res?.data) 
                        ? res.data 
                        : Array.isArray(res?.assignments) 
                            ? res.assignments 
                            : [];

                setAssignments(list);
            } catch (err) {
                console.error("Failed to load assignments:", err);
                setError("Failed to load student list.");
                setAssignments([]);
            } finally {
                setLoadingAssignments(false);
            }
        };

        loadAssignments();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleStudentSelect = (e) => {
        const selectedLabUserId = e.target.value;
        const list = Array.isArray(assignments) ? assignments : [];
        const matched = list.find(
            (a) => a.labUserId?._id === selectedLabUserId || a.labUserId === selectedLabUserId
        );

        setForm((prev) => ({
            ...prev,
            labUserId: selectedLabUserId,
            projectName: matched ? (matched.projectName || prev.projectName) : prev.projectName,
        }));
    };

    const handleCheckbox = (e) => {
        setForm((prev) => ({ ...prev, isActive: e.target.checked }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.labUserId || !form.toolName || !form.projectName) {
            setError('Student, tool name, and project name are required.');
            return;
        }

        if (!isValidUrl(form.liveUrl)) {
            setError('Live URL must be a valid http:// or https:// link, or left blank.');
            return;
        }

        setSaving(true);
        setError('');
        try {
            await utilizationService.create(form);
            setForm({
                labUserId: '',
                toolName: '',
                projectName: '',
                status: 'not_done',
                liveUrl: '',
                isActive: true,
            });
            onRecordAdded();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to add record.');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: 20, width: 280 }}>
            <h3 style={{ color: 'var(--color-heading)', marginBottom: 16 }}>Add Utilization Record</h3>

            <label style={labelStyle}>Student</label>
            <select
                name="labUserId"
                value={form.labUserId}
                onChange={handleStudentSelect}
                style={inputStyle}
                disabled={loadingAssignments}
            >
                <option value="">{loadingAssignments ? 'Loading students...' : 'Select a student'}</option>
                {Array.isArray(assignments) && assignments.map((a) => {
                    const studentObj = typeof a.labUserId === 'object' ? a.labUserId : null;
                    const studentId = studentObj?._id || a.labUserId;
                    const studentName = studentObj?.name || a.name || 'Unknown Student';
                    const rollNumber = studentObj?.rollNumber || a.rollNumber || '';

                    return (
                        <option key={a._id} value={studentId}>
                            {studentName} {rollNumber ? `(${rollNumber})` : ''}
                        </option>
                    );
                })}
            </select>

            <label style={labelStyle}>Tool / Model Name</label>
            <input
                type="text"
                name="toolName"
                value={form.toolName}
                onChange={handleChange}
                style={inputStyle}
            />

            <label style={labelStyle}>Project Name</label>
            <input
                type="text"
                name="projectName"
                value={form.projectName}
                onChange={handleChange}
                style={inputStyle}
            />

            <label style={labelStyle}>Status</label>
            <select
                name="status"
                value={form.status}
                onChange={handleChange}
                style={inputStyle}
            >
                <option value="not_done">Not Done</option>
                <option value="done">Done</option>
            </select>

            <label style={labelStyle}>Live URL (only if done)</label>
            <input
                type="text"
                name="liveUrl"
                value={form.liveUrl}
                onChange={handleChange}
                placeholder="https://your-project.example.com"
                style={inputStyle}
            />

            <label style={{ ...labelStyle, display: 'flex', alignItems: 'center', gap: 8 }}>
                <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={handleCheckbox}
                />
                Deployment Active
            </label>

            {error && (
                <p style={{ color: 'var(--color-white)', background: 'var(--color-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 13, marginTop: 8 }}>
                    {error}
                </p>
            )}

            <button type="submit" disabled={saving} style={submitBtnStyle}>
                {saving ? 'Saving...' : 'Add Record'}
            </button>
        </form>
    );
}

const labelStyle = { display: 'block', fontSize: 13, color: 'var(--color-text)', marginTop: 12, marginBottom: 4 };
const inputStyle = { width: '100%', padding: '8px 10px', border: '1px solid var(--color-border)', borderRadius: 6, fontSize: 13, color: 'var(--color-heading)' };
const submitBtnStyle = { marginTop: 16, background: 'var(--color-primary)', color: 'var(--color-white)', border: 'none', borderRadius: 6, padding: '10px 16px', fontSize: 14, cursor: 'pointer' };