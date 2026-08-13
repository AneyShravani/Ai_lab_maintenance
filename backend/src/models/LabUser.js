// ============================================================
// MODEL: LabUser  (the requester — Module 3.7)
// ------------------------------------------------------------
// A student / faculty / HOD / HR / employee who requests
// a system. Fields: orgId, name, rollNumber, department,
// userType, hodLetterPath (uploaded document in /uploads),
// projectName, startDate, endDate.
// ============================================================

const mongoose = require("mongoose");

const labUserSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "AdminUser",
            default: null,
        },
        name: { type: String, required: true },               // requester's name
        rollNumber: { type: String, required: true },          // student/employee roll no
        department: { type: String, required: true },          // department

        userType: {
            type: String,
            enum: ["student", "faculty", "hod", "hr", "employee"],
            required: true,
        },

        projectName: { type: String, required: true },         // project purpose
        startDate: { type: Date, required: true },            // duration start
        endDate: { type: Date, required: true },              // duration end

        hodLetterPath: { type: String, required: true },        // uploaded HOD letter file path

        orgId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("LabUser", labUserSchema);