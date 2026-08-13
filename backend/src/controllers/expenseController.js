// ============================================================
// CONTROLLER: expenseController  (Module 3.3)
// ------------------------------------------------------------
// addExpense    -> add a tool/model with cost + spend.
// listExpenses  -> full breakdown + computed total.
// updateExpense -> edit cost/spend of a tool.
// ============================================================

const Expense = require('../models/Expense');

// POST /api/expenses
const addExpense = async (req, res) => {
  try {
    const { toolName, cost, amountSpent, notes } = req.body;

    if (!toolName || cost === undefined) {
      return res.status(400).json({
        success: false,
        message: 'toolName and cost are required',
      });
    }

    const expense = await Expense.create({
      orgId: req.user.orgId, 
      toolName,
      cost,
      amountSpent: amountSpent || 0,
      notes,
    });
    return res.status(201).json({ success: true, expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// GET /api/expenses
const listExpenses = async (req, res) => {
  try {
    const expenses = await Expense.find({ orgId: req.user.orgId }).sort({ createdAt: -1 });

    const totalCost = expenses.reduce((sum, e) => sum + e.cost, 0);
    const totalSpent = expenses.reduce((sum, e) => sum + e.amountSpent, 0);

    return res.status(200).json({
      success: true,
      expenses,
      totalCost,
      totalSpent,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  try {
    const { toolName, cost, amountSpent, notes } = req.body;

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, orgId: req.user.orgId },
      { toolName, cost, amountSpent, notes },
      { new: true, runValidators: true }
    );

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found' });
    }

    return res.status(200).json({ success: true, expense });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

module.exports = {
  addExpense,
  listExpenses,
  updateExpense,
};