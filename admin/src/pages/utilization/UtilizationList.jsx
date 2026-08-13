// ============================================================
// PAGE: UtilizationList  (Module 3.6 — Utilization)
// ------------------------------------------------------------
// Table: student, tool, project, status, live URL, active flag,
// total uses, history view, inline actions.
// Inline Edit/Save/Cancel per row. Save always sends
// status+liveUrl+isActive together (backend has no partial-
// merge logic). liveUrl validated before save AND before
// render — Copilot flagged that a stored javascript: URL would
// still render as a clickable link if only validated on save.
// ============================================================
import React, { useEffect, useState } from 'react'; // React + hooks for state and lifecycle
import utilizationService from '../../services/utilizationService'; // API calls: getAll, create, update
import UtilizationForm from './UtilizationForm'; // add-record form shown beside the table

// checks if a string is a well-formed http/https URL; returns true for empty string (URL is optional)
const isValidUrl = (value) => {
    if (!value.trim()) return true; // empty is allowed — liveUrl is optional
    try {
        const parsed = new URL(value); // throws if the string isn't a valid URL at all
        return parsed.protocol === 'http:' || parsed.protocol === 'https:'; // only accept http/https
    } catch {
        return false; // new URL() threw — not a URL at all
    }
};

export default function UtilizationList() {
    const [records, setRecords] = useState([]); // holds all fetched utilization rows for this org
    const [loading, setLoading] = useState(true); // true while the initial GET is in flight
    const [error, setError] = useState(''); // holds fetch/save error message, shown to user

    const [editingId, setEditingId] = useState(null); // _id of the row currently in edit mode; null = no row editing
    const [editForm, setEditForm] = useState({ status: 'not_done', liveUrl: '', isActive: true }); // draft values for the row being edited
    const [savingId, setSavingId] = useState(null); // _id currently being saved; disables that row's Save button only

    // Modal state for history
    const [showHistory, setShowHistory] = useState(false);
    const [historyRecords, setHistoryRecords] = useState([]);
    const [historyStudent, setHistoryStudent] = useState('');

    const fetchRecords = async () => { // pulls the latest records from the backend
        setLoading(true); // show loading state while request runs
        setError(''); // clear any old error before retrying
        try {
            const res = await utilizationService.getAll(); // GET /api/utilization, org-filtered by backend via JWT
            setRecords(res.data); // backend returns { success, count, data: [...] }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load utilization records.'); // fallback message if backend gives none
        } finally {
            setLoading(false); // hide loading state whether it succeeded or failed
        }
    };

    useEffect(() => { fetchRecords(); }, []); // run once on mount to load the table

    const handleRecordAdded = () => fetchRecords(); // callback passed to UtilizationForm, refreshes table after a new record is added

    const startEdit = (record) => { // enters edit mode for one specific row
        setEditingId(record._id); // mark this row's _id as the one being edited
        setEditForm({ // pre-fill the edit form with this row's current values
            status: record.status, // current done/not_done value
            liveUrl: record.liveUrl || '', // current URL, or blank if none set
            isActive: record.isActive, // current active/inactive flag
        });
        setError(''); // clear any leftover error from a previous action
    };

    const cancelEdit = () => { // exits edit mode without saving anything
        setEditingId(null); // no row is being edited anymore
        setEditForm({ status: 'not_done', liveUrl: '', isActive: true }); // reset draft back to defaults
    };

    const handleEditChange = (e) => { // generic handler for text/select inputs in the edit row
        const { name, value } = e.target; // field name ("status" or "liveUrl") and its new value
        setEditForm((prev) => ({ ...prev, [name]: value })); // update only that one field, keep the rest
    };

    const handleEditCheckbox = (e) => { // separate handler because checkboxes use 'checked', not 'value'
        setEditForm((prev) => ({ ...prev, isActive: e.target.checked })); // update isActive flag from the checkbox state
    };

    const saveEdit = async (id) => { // sends the edited row to the backend
        if (!isValidUrl(editForm.liveUrl)) { // reject junk text or unsafe protocols before calling the API
            setError('Live URL must be a valid http:// or https:// link, or left blank.'); // show validation message
            return; // stop here, don't call the API
        }

        setSavingId(id); // lock this row's Save button while the request is in flight
        setError(''); // clear old error before this attempt
        try {
            await utilizationService.update(id, { // PUT /api/utilization/:id
                status: editForm.status, // always sent — backend has no partial-merge logic
                liveUrl: editForm.liveUrl, // always sent, even if unchanged
                isActive: editForm.isActive, // always sent, even if unchanged
            });
            setEditingId(null); // exit edit mode on success
            await fetchRecords(); // reload the table so it reflects the saved values
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to update record.'); // fallback message if backend gives none
        } finally {
            setSavingId(null); // unlock the Save button either way
        }
    };

    // derived summary counts for the stat cards — computed from records already in state, no extra API call needed
    const totalRecords = records.length; // count of every row currently loaded
    const doneCount = records.filter((r) => r.status === 'done').length; // count where status is "done"
    const activeCount = records.filter((r) => r.isActive).length; // count where isActive is true

    // Group records by student ID to ensure 1 row per student in the main table
    const studentMap = {};
    records.forEach((r) => {
        const id = r.labUserId?._id;
        if (!id) return;

        if (!studentMap[id]) {
            studentMap[id] = {
                student: r.labUserId,
                latest: r,
                history: [],
            };
        }

        studentMap[id].history.push(r);

        if (new Date(r.createdAt) > new Date(studentMap[id].latest.createdAt)) {
            studentMap[id].latest = r;
        }
    });

    return (
        <div style={{ padding: 24 }}> {/* page wrapper */}
            <h2 style={{ color: 'var(--color-heading)', marginBottom: 20 }}>Utilization</h2> {/* page title */}

            {/* summary cards row */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
                <SummaryCard label="Total Records" value={totalRecords} color="var(--color-info)" />
                <SummaryCard label="Completed" value={doneCount} color="var(--color-success)" />
                <SummaryCard label="Active Deployments" value={activeCount} color="var(--color-primary)" />
            </div>

            <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                <UtilizationForm onRecordAdded={handleRecordAdded} />

                <div style={{ flex: 1, minWidth: 320, overflowX: 'auto' }}>
                    {error && (
                        <p style={{ color: 'var(--color-white)', background: 'var(--color-danger)', padding: '8px 12px', borderRadius: 6, fontSize: 14 }}>
                            {error}
                        </p>
                    )}

                    {loading ? (
                        <p style={{ color: 'var(--color-text)' }}>Loading utilization records...</p>
                    ) : records.length === 0 ? (
                        <p style={{ color: 'var(--color-text)' }}>No utilization records added yet.</p>
                    ) : (
                        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: 'var(--color-light-bg)' }}>
                                        <Th>Student</Th>
                                        <Th>Tool</Th>
                                        <Th>Project</Th>
                                        <Th style={{ textAlign: 'center' }}>Status</Th>
                                        <Th>Live URL</Th>
                                        <Th>Active</Th>
                                        <Th>Total Uses</Th>
                                        <Th style={{ textAlign: 'center' }}>History</Th>
                                        <Th style={{ textAlign: 'center' }}>Actions</Th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.values(studentMap).map((group) => {
                                        const r = group.latest;
                                        const isEditing = editingId === r._id;
                                        const isSaving = savingId === r._id;

                                        return (
                                            <tr key={r._id} style={{ borderBottom: '1px solid var(--color-border)' }}>
                                                <Td>{r.labUserId?.name || 'N/A'}</Td>
                                                <Td>{r.toolName}</Td>
                                                <Td>{r.projectName}</Td>

                                                <Td style={{ textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <select name="status" value={editForm.status} onChange={handleEditChange} style={editInputStyle}>
                                                            <option value="not_done">Not Done</option>
                                                            <option value="done">Done</option>
                                                        </select>
                                                    ) : (
                                                        <span style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            padding: '4px 10px',
                                                            borderRadius: 6,
                                                            fontSize: 13,
                                                            fontWeight: 600,
                                                            whiteSpace: 'nowrap',
                                                            background: r.status === 'done' ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                                                            color: r.status === 'done' ? 'var(--color-success)' : 'var(--color-warning)',
                                                        }}>
                                                            {r.status === 'not_done' ? 'Not Done' : 'Done'}
                                                        </span>
                                                    )}
                                                </Td>

                                                <Td>
                                                    {isEditing ? (
                                                        <input type="text" name="liveUrl" value={editForm.liveUrl} onChange={handleEditChange} style={editInputStyle} />
                                                    ) : r.liveUrl && isValidUrl(r.liveUrl) ? (
                                                        <a href={r.liveUrl} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)' }}>Link</a>
                                                    ) : (
                                                        '-'
                                                    )}
                                                </Td>

                                                <Td>
                                                    {isEditing ? (
                                                        <input type="checkbox" checked={editForm.isActive} onChange={handleEditCheckbox} />
                                                    ) : (
                                                        r.isActive ? 'Yes' : 'No'
                                                    )}
                                                </Td>

                                                <Td>{group.history.length}</Td>

                                                <Td style={{ textAlign: 'center' }}>
                                                    <button
                                                        style={viewBtnStyle}
                                                        onClick={() => {
                                                            const sortedHistory = [...group.history].sort(
                                                                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
                                                            );
                                                            setHistoryRecords(sortedHistory);
                                                            setHistoryStudent(r.labUserId?.name || '');
                                                            setShowHistory(true);
                                                        }}
                                                    >
                                                        View
                                                    </button>
                                                </Td>

                                                <Td style={{ textAlign: 'center' }}>
                                                    {isEditing ? (
                                                        <div style={{ display: 'inline-flex', gap: 8, justifyContent: 'center' }}>
                                                            <button style={saveBtnStyle} onClick={() => saveEdit(r._id)} disabled={isSaving}>
                                                                {isSaving ? 'Saving...' : 'Save'}
                                                            </button>
                                                            <button style={cancelBtnStyle} onClick={cancelEdit} disabled={isSaving}>Cancel</button>
                                                        </div>
                                                    ) : (
                                                        <button style={editBtnStyle} onClick={() => startEdit(r)}>Edit</button>
                                                    )}
                                                </Td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal overlay for View History */}
            {showHistory && (
                <div style={{
                    position: 'fixed',
                    inset: 0,
                    background: 'rgba(0, 0, 0, 0.5)',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: '#ffffff',
                        width: '700px',
                        maxHeight: '80vh',
                        overflowY: 'auto',
                        borderRadius: '10px',
                        padding: '24px',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.2)'
                    }}>
                        <h3 style={{ color: '#111827', marginTop: 0, marginBottom: 20, fontSize: 18, fontWeight: 700 }}>
                            {historyStudent} - Utilization History
                        </h3>

                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ background: '#f3f4f6' }}>
                                    <Th style={{ color: '#374151', fontWeight: 600 }}>Date</Th>
                                    <Th style={{ color: '#374151', fontWeight: 600 }}>Tool</Th>
                                    <Th style={{ color: '#374151', fontWeight: 600 }}>Project</Th>
                                    <Th style={{ color: '#374151', fontWeight: 600, textAlign: 'center' }}>Status</Th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyRecords.map(item => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                                        <Td style={{ color: '#374151' }}>{new Date(item.createdAt).toLocaleDateString('en-GB')}</Td>
                                        <Td style={{ color: '#374151' }}>{item.toolName}</Td>
                                        <Td style={{ color: '#374151' }}>{item.projectName}</Td>
                                        <Td style={{ color: '#374151', textAlign: 'center' }}>
                                            <span style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                padding: '3px 8px',
                                                borderRadius: 4,
                                                fontSize: 12,
                                                fontWeight: 600,
                                                background: item.status === 'done' ? '#dcfce7' : '#fef3c7',
                                                color: item.status === 'done' ? '#15803d' : '#b45309',
                                            }}>
                                                {item.status === 'not_done' ? 'Not Done' : 'Done'}
                                            </span>
                                        </Td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-start' }}>
                            <button style={closeBtnStyle} onClick={() => setShowHistory(false)}>
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// reused from ExpenseList's SummaryCard pattern — small stat card with label + colored value
function SummaryCard({ label, value, color }) {
    return (
        <div style={{ background: 'var(--color-card-bg)', border: '1px solid var(--color-border)', borderRadius: 8, padding: '14px 20px', minWidth: 140 }}>
            <div style={{ color: 'var(--color-text)', fontSize: 13 }}>{label}</div> {/* card title */}
            <div style={{ color, fontSize: 22, fontWeight: 700 }}>{value}</div> {/* card number */}
        </div>
    );
}

function Th({ children, style }) { // shared table header cell wrapper
    return <th style={{ textAlign: 'left', padding: '10px 14px', fontSize: 13, color: 'var(--color-heading)', fontWeight: 600, ...style }}>{children}</th>;
}

function Td({ children, style }) { // shared table body cell wrapper
    return <td style={{ padding: '10px 14px', fontSize: 14, color: 'var(--color-text)', verticalAlign: 'middle', ...style }}>{children}</td>;
}

const editInputStyle = { width: '100%', padding: '6px 8px', border: '1px solid var(--color-border)', borderRadius: 4, fontSize: 13, color: 'var(--color-text)' };
const viewBtnStyle = { background: '#0284c7', color: '#ffffff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const editBtnStyle = { background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const saveBtnStyle = { background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const cancelBtnStyle = { background: '#6b7280', color: '#ffffff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 13, fontWeight: 500, cursor: 'pointer' };
const closeBtnStyle = { background: '#16a34a', color: '#ffffff', border: 'none', borderRadius: 6, padding: '8px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' };