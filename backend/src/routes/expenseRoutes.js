// ============================================================
// ROUTES: /api/expenses   (Admin only)
// ------------------------------------------------------------
// Middleware chain: auth -> roleCheck(ADMIN) -> orgIsolation
// GET / , POST / , PUT /:id
// ============================================================

const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const roleCheck = require('../middleware/roleCheck');
// const orgIsolation = require('../middleware/orgIsolation'); // TODO: re-enable once orgIsolation.js is implemented (currently empty, will crash server)

const {
    addExpense,
    listExpenses,
    updateExpense,
} = require('../controllers/expenseController');

router.use(auth, roleCheck('ADMIN')); // TODO: add orgIsolation here once it exists

router.get('/', listExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);

module.exports = router;