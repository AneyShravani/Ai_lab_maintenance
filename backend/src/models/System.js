// ============================================================
// MODEL: System  (Module 3.5)
// ------------------------------------------------------------
// One computer inside a lab.
// Fields: labId, orgId, systemNumber/label,
// status: AVAILABLE | OCCUPIED,
// currentAssignmentId (when occupied).
// Occupancy table on the dashboard is computed from these.
// ============================================================

const mongoose = require("mongoose"); 

const systemSchema = new mongoose.Schema(
    {
        labId: {
            type: mongoose.Schema.Types.ObjectId, // points to one Lab document
            ref: "Lab",                           // tells Mongoose which template labId belongs to
            required: true,                       // can't save without a labId
        },
        orgId: {
            type: mongoose.Schema.Types.ObjectId, // points to one Organization document
            ref: "Organization",                  // tells Mongoose which template orgId belongs to
            required: true,                       // can't save without an orgId
        },
        name: {
            type: String,   // unique identifier for the system, e.g. "SYS-001"
            required: true, // can't save without a system name
        },
        status: {
            type: String,                          // AVAILABLE = free, OCCUPIED = assigned to a user
            enum: ["AVAILABLE", "OCCUPIED"],        // only these two values allowed
            default: "AVAILABLE",                   // new systems start out free
        },
    },
    {
        timestamps: true, // auto-adds createdAt and updatedAt
    }
);

module.exports = mongoose.model("System", systemSchema); // registers this template as "System"