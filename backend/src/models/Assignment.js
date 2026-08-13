// ============================================================
// MODEL: Assignment  ** THE REFERENCE ID LIVES HERE **
// ------------------------------------------------------------
// Created when the Admin assigns a system to a user (Sec 4).
// Fields: orgId, referenceId (unique, generated),
// labUserId, systemId, labId, projectName (purpose),
// startDate, endDate,
// status: ACTIVE | NEARING_EXPIRY | EXPIRED.
// The Reference ID carries the project purpose + duration and
// drives access control + deadline notifications.
// ============================================================

const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema(
    {
        labUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "LabUser",
            required: true,
        }, // who this assignment belongs to

        systemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "System",
            required: true,
        }, // which system was assigned

        projectName: { type: String, required: true },   // moved here from LabUser
        startDate: { type: Date, required: true },        // moved here from LabUser
        endDate: { type: Date, required: true },          // moved here from LabUser

        referenceId: {
            type: String,
            required: true,
            unique: true,
        }, // the Reference ID given to the user

        status: {
            type: String,
            enum: ["ACTIVE", "NEARING_EXPIRY", "EXPIRED"],
            default: "ACTIVE",
        }, // starts ACTIVE on creation; flipped later by referenceIdService / deadlineChecker

        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Assignment", assignmentSchema);