// ============================================================
// SERVICE: referenceIdService  (heart of the system)
// ------------------------------------------------------------
// generateReferenceId() -> unique ID for a new Assignment
//   (carries: project purpose + start/end dates via the
//    Assignment record it points to).
// getStatus(assignment) -> compares today with endDate:
//   ACTIVE / NEARING_EXPIRY (within N days) / EXPIRED.
// Used by dashboardController and jobs/deadlineChecker.
// ============================================================


const NEARING_EXPIRY_DAYS = 3; // kept inline per Akhilesh — flagged for possible centralization later

// Generates a unique, traceable Reference ID
// Format: ORG-YYYYMMDD-XXXX (org prefix + date + random 4-char code)
function generateReferenceId(orgId) {
    const orgPrefix = orgId.toString().slice(-4).toUpperCase(); // last 4 chars of orgId
    const today = new Date();
    const datePart = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;
    const randomPart = Math.random().toString(36).slice(2, 6).toUpperCase(); // 4 random chars

    return `${orgPrefix}-${datePart}-${randomPart}`;
}

// Computes live status of an assignment based on its endDate
function getStatus(assignment) {
    const today = new Date();
    const endDate = new Date(assignment.endDate);

    // difference in milliseconds -> convert to days
    const msPerDay = 1000 * 60 * 60 * 24;
    const daysLeft = Math.ceil((endDate - today) / msPerDay);

    if (daysLeft < 0) {
        return "EXPIRED";
    } else if (daysLeft <= NEARING_EXPIRY_DAYS) {
        return "NEARING_EXPIRY";
    } else {
        return "ACTIVE";
    }
}

module.exports = { generateReferenceId, getStatus };