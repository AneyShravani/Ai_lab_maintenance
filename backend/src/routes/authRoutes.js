const express = require('express');
const {
  login,
  signup,
  resetPassword,
  forgotPassword,
  verifyForgotPasswordOtp,
  forgotPasswordReset,
} = require('../controllers/authController');
const auth = require('../middleware/auth');

const router = express.Router();

router.post('/login', login);
router.post('/signup', signup);
router.post('/reset-password', auth, resetPassword);
router.post('/forgot-password', forgotPassword);
router.post('/forgot-password/verify-otp', verifyForgotPasswordOtp);
router.post('/forgot-password/reset', forgotPasswordReset);

module.exports = router;