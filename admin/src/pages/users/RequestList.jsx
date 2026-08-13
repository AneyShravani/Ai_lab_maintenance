// ============================================================
// PAGE: RequestList  (Module 3.7 — Users, Section 4 workflow)
// ------------------------------------------------------------
// All pending user requests for a system. A "pending" request
// is a LabUser with no Assignment yet — so it has NO project
// name or duration (those live on Assignment, created later,
// during Assign System). Only show fields that actually exist
// on LabUser at this stage: name, rollNumber, department,
// hodLetterPath. Click a row -> RequestDetail / AssignSystem.
// Calls assignmentService.getRequests().
// ============================================================

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import assignmentService from "../../services/assignmentService";
import api from "../../services/api"; // needed for authenticated HOD letter fetch

function RequestList() {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openingId, setOpeningId] = useState(null); // tracks which row's letter is loading

    const navigate = useNavigate();

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await assignmentService.getRequests();
                setRequests(response.data);
            } catch (err) {
                console.error(err);
                setError("Could not load requests. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchRequests();
    }, []);

    const handleRowClick = (request) => {
        navigate(`/requests/${request._id}`, {
            state: { request },
        });
    };

    // Fetches the HOD letter as an authenticated blob — direct <a href>
    // can't work here because the route requires a JWT auth header,
    // which plain browser navigation can't send.
    const handleViewLetter = async (e, req) => {
        e.stopPropagation(); // don't trigger the row's navigate()
        const filename = req.hodLetterPath.split("/").pop();
        setOpeningId(req._id);
        try {
            const response = await api.get(`/assignments/uploads/${filename}`, {
                responseType: "blob",
            });
            const blobUrl = URL.createObjectURL(response.data);
            window.open(blobUrl, "_blank");
        } catch (err) {
            console.error(err);
            alert("Could not open HOD letter.");
        } finally {
            setOpeningId(null);
        }
    };

    if (loading) {
        return <p>Loading requests...</p>;
    }

    if (error) {
        return <p style={{ color: "red" }}>{error}</p>;
    }

    if (requests.length === 0) {
        return <p>No pending requests.</p>;
    }

    return (
        <div>
            <h2>Pending User Requests</h2>

            <table
                border="1"
                cellPadding="8"
                style={{
                    borderCollapse: "collapse",
                    width: "100%",
                }}
            >
                <thead>
                    <tr>
                        <th>Name</th>
                        <th>Roll No</th>
                        <th>Department</th>
                        <th>User Type</th>
                        <th>HOD Letter</th>
                    </tr>
                </thead>

                <tbody>
                    {requests.map((req) => (
                        <tr
                            key={req._id}
                            onClick={() => handleRowClick(req)}
                            style={{ cursor: "pointer" }}
                        >
                            <td>{req.name}</td>
                            <td>{req.rollNumber}</td>
                            <td>{req.department}</td>
                            <td>{req.userType}</td>

                            <td>
                                {req.hodLetterPath ? (
                                    <button
                                        onClick={(e) => handleViewLetter(e, req)}
                                        disabled={openingId === req._id}
                                    >
                                        {openingId === req._id ? "Opening..." : "View"}
                                    </button>
                                ) : (
                                    "Not Uploaded"
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default RequestList;