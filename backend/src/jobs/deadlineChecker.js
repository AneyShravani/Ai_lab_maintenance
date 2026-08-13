// ============================================================
// JOB: deadlineChecker (cron — runs daily)
// ------------------------------------------------------------
// 1. Find ACTIVE assignments whose endDate is within
//    NEARING_EXPIRY_DAYS -> set status NEARING_EXPIRY
//    + notificationService.createDeadlineAlert().
// 2. Find assignments past endDate -> set status EXPIRED
//    and free the System (status back to AVAILABLE)*.
//    (*confirm this rule with the team — see spec Sec 7)
// Started from server.js.
// ============================================================
