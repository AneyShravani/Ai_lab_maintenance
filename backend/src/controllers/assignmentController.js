// ============================================================
// CONTROLLER: assignmentController (core workflow, Sec 4)
// ============================================================

const LabUser = require("../models/LabUser");
const AdminUser = require("../models/AdminUser");
const System = require("../models/System");
const Assignment = require("../models/Assignment");
const { generateReferenceId, getStatus } = require("../services/referenceIdService");
const { sendApprovalEmail } = require("../services/emailService");
const { createNotification } = require("../services/notificationService");

// Helper to strictly format dates as YYYY-MM-DD
function formatDate(dateVal) {
    if (!dateVal) return "--";
    const d = new Date(dateVal);
    return isNaN(d.getTime()) ? "--" : d.toISOString().split("T")[0];
}

// POST /api/assignments/request (STUDENT) or /requests (ADMIN)
async function createRequest(req, res, next) {
    try {
        const isStudent = req.user.role === "STUDENT";
        const orgId = req.user.orgId; // NEVER trust req.body for orgId

        if (!req.file) {
            return res.status(400).json({ message: "HOD letter file is required." });
        }

        const { projectName, startDate, endDate } = req.body;

        let labUserData;
        if (isStudent) {
            const student = await AdminUser.findById(req.user.id);
            labUserData = {
                name: student.name,
                rollNumber: student.rollNumber || student.rollNo,
                department: student.department,
                userType: student.userType || "student",
                studentId: student._id,
                projectName,
                startDate,
                endDate,
            };
        } else {
            const { name, rollNumber, department, userType } = req.body;
            labUserData = { 
                name, 
                rollNumber, 
                department, 
                userType: userType || "student",
                projectName,
                startDate,
                endDate,
            };
        }

        const labUser = await LabUser.create({
            ...labUserData,
            hodLetterPath: `/uploads/${req.file.filename}`,
            orgId,
        });

        res.status(201).json({ success: true, data: labUser });
    } catch (err) {
        next(err);
    }
}

// GET /api/assignments/requests (ADMIN ONLY) — pending = no Assignment yet
async function listRequests(req, res, next) {
    try {
        const orgId = req.user.orgId;

        const allLabUsers = await LabUser.find({ orgId });
        const assignedLabUserIds = await Assignment.find({ orgId }).distinct("labUserId");
        const assignedIdSet = new Set(assignedLabUserIds.map((id) => id.toString()));

        const pending = allLabUsers.filter((u) => !assignedIdSet.has(u._id.toString()));

        res.json({ success: true, data: pending });
    } catch (err) {
        next(err);
    }
}

// POST /api/assignments/assign (ADMIN ONLY)
async function assignSystem(req, res, next) {
    try {
        const orgId = req.user.orgId;
        const { labUserId, systemId, projectName, startDate, endDate } = req.body;

        if (!labUserId || !systemId || !projectName || !startDate || !endDate) {
            return res.status(400).json({
                message: "labUserId, systemId, projectName, startDate, and endDate are all required.",
            });
        }
        if (new Date(endDate) <= new Date(startDate)) {
            return res.status(400).json({ message: "endDate must be after startDate." });
        }

        // atomically claim an AVAILABLE system (race-condition safe)
        const claimedSystem = await System.findOneAndUpdate(
            { _id: systemId, orgId, status: "AVAILABLE" },
            { $set: { status: "OCCUPIED" } },
            { new: true }
        );

        if (!claimedSystem) {
            return res.status(409).json({
                message: "System is no longer available. It may have just been assigned to another user.",
            });
        }

        const labUser = await LabUser.findOne({ _id: labUserId, orgId });
        if (!labUser) {
            await System.findOneAndUpdate({ _id: systemId, orgId }, { status: "AVAILABLE" });
            return res.status(404).json({ message: "LabUser not found in this organization." });
        }

        const referenceId = generateReferenceId(orgId);

        const assignment = await Assignment.create({
            labUserId,
            systemId,
            projectName,
            startDate,
            endDate,
            referenceId,
            status: "ACTIVE",
            orgId,
        });

        // student's login email lives on AdminUser, not LabUser
        try {
            let studentEmail = null;
            if (labUser.studentId) {
                const student = await AdminUser.findById(labUser.studentId);
                studentEmail = student?.email;
            }
            if (studentEmail) {
                await sendApprovalEmail({
                    studentEmail,
                    studentName: labUser.name,
                    projectName: assignment.projectName,
                    systemName: claimedSystem.name,
                    referenceId: assignment.referenceId,
                    startDate: assignment.startDate,
                    endDate: assignment.endDate,
                });
            }
        } catch (emailErr) {
            console.error("Failed to send approval email:", emailErr);
        }

        try {
            await createNotification(
                labUser._id,
                orgId,
                assignment._id,
                "Request Approved",
                `Your request for "${projectName}" has been approved. Reference ID: ${assignment.referenceId}`
            );
        } catch (notifErr) {
            console.error("Failed to save student notification:", notifErr);
        }

        res.status(201).json({
            message: "System assigned successfully.",
            referenceId: assignment.referenceId,
            assignment,
        });
    } catch (err) {
        next(err);
    }
}

// GET /api/assignments (ADMIN ONLY)
// GET /api/assignments (ADMIN ONLY)
async function listAssignments(req, res, next) {
    try {
        const orgId = req.user.orgId;

        const assignments = await Assignment.find({ orgId })
            .populate("labUserId", "name rollNumber department")
            .populate({
                path: "systemId",
                select: "name labId",
                populate: { path: "labId", select: "name" },
            });

        const withLiveStatus = assignments.map((a) => {
            const obj = a.toObject();
            return {
                ...obj,
                name: obj.labUserId?.name || "—",
                labName: obj.systemId?.labId?.name || "—",
                systemName: obj.systemId?.name || "—",
                liveStatus: getStatus(a),
            };
        });

        res.json({ success: true, data: withLiveStatus });
    } catch (err) {
        next(err);
    }
}

// GET /api/assignments/my-requests (STUDENT ONLY)
async function myRequests(req, res, next) {
    try {
        const studentId = req.user.id;
        const orgId = req.user.orgId;

        const labUsers = await LabUser.find({ studentId, orgId }).sort({ createdAt: -1 });
        const labUserIds = labUsers.map((u) => u._id);

        const assignments = await Assignment.find({ labUserId: { $in: labUserIds }, orgId })
            .populate({
                path: "systemId",
                select: "name labId",
                populate: { path: "labId", select: "name" },
            });

        const assignmentByLabUser = new Map(assignments.map((a) => [a.labUserId.toString(), a]));

        const result = labUsers.map((u) => {
            const a = assignmentByLabUser.get(u._id.toString());
            
            const projectName = (a && a.projectName) || u.projectName || "--";
            const startDate = formatDate((a && a.startDate) || u.startDate);
            const endDate = formatDate((a && a.endDate) || u.endDate);
            const submittedOn = formatDate(u.createdAt);

            if (!a) {
                return {
                    id: u._id,
                    projectName,
                    startDate,
                    endDate,
                    status: "PENDING",
                    referenceId: "--",
                    assignedSystem: "Unassigned",
                    submittedOn,
                    hodLetterPath: u.hodLetterPath || null,
                };
            }

            return {
                id: u._id,
                projectName,
                startDate,
                endDate,
                status: getStatus(a),
                referenceId: a.referenceId,
                assignedSystem: a.systemId
                    ? `${a.systemId.name} (${a.systemId.labId?.name || ""})`
                    : "Unassigned",
                submittedOn,
                hodLetterPath: u.hodLetterPath || null,
            };
        });

        res.json({ success: true, data: result });
    } catch (err) {
        next(err);
    }
}

module.exports = {
    createRequest,
    listRequests,
    assignSystem,
    listAssignments,
    myRequests,
};