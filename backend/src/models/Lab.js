// ============================================================
// MODEL: Lab  (Module 3.4)
// ------------------------------------------------------------
// An AI lab inside an organization (an org can have many).
// Fields: name, orgId. System count is derived from the
// System collection (count of systems with this labId).
// ============================================================
const mongoose = require('mongoose');

const labSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

labSchema.index({ orgId: 1, name: 1 }, { unique: true });

module.exports = mongoose.model('Lab', labSchema);
