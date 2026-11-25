const router = require('express').Router();
const rateLimit = require('express-rate-limit');
const { login, logout, me, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many sign-in attempts. Try again in a few minutes' },
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);
router.get('/me', protect, me);
router.put('/change-password', protect, changePassword);

module.exports = router;
