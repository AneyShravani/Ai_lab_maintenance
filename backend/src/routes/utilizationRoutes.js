const express = require("express"); // web framework
const router = express.Router(); // mini router for this module
const auth = require("../middleware/auth"); // verifies JWT, sets req.user
const roleCheck = require("../middleware/roleCheck"); // checks req.user.role matches allowed roles
// TODO: orgIsolation middleware not yet implemented (backend/src/middleware/orgIsolation.js is empty — flagged to Akhilesh 13/07). Add here once built.

const {
    addUtilization,
    listUtilization,
    updateStatus,
} = require("../controllers/utilizationController");

router.use(auth, roleCheck("ADMIN")); // full chain pending orgIsolation

router.post("/", addUtilization);
router.get("/", listUtilization);
router.put("/:id", updateStatus);

module.exports = router;