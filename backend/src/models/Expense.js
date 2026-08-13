// ============================================================
// MODEL: Expense  (Module 3.3)
// ------------------------------------------------------------
// One AI tool/model the lab pays for.
// Fields: orgId, toolName, cost, amountSpent, notes.
// The expenses page repeats this per tool to build the
// full breakdown; dashboard sums the totals.
// ============================================================

const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
    toolName: {
      type: String,
      required: true,
      trim: true,
    },
    cost: {
      type: Number,
      required: true,
      min: 0,
    },
    amountSpent: {
      type: Number,
      default: 0,
      min: 0,
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Expense', expenseSchema);