const mongoose = require('mongoose');

const adminUserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['SUPER_ADMIN', 'ADMIN', 'STUDENT'],
      required: true,
    },
    userType: {
      type: String,
      enum: ['student', 'faculty', 'hod', 'hr', 'employee'],
      default: null,
    },
    rollNumber: {
      type: String,
      default: null,
      trim: true,
    },
    department: {
      type: String,
      default: null,
      trim: true,
    },
    orgId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Organization',
      default: null,
    },
    firstLogin: {
      type: Boolean,
      default: true,
    },
    resetPasswordOtpHash: {
      type: String,
      select: false,
      default: null,
    },
    resetPasswordOtpExpires: {
      type: Date,
      select: false,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('AdminUser', adminUserSchema);