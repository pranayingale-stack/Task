const express = require('express');
const rateLimit = require('express-rate-limit');
const { login, me } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

// Throttle login attempts to slow down brute-force / credential-stuffing attacks.
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again later.' },
});

router.post('/login', loginLimiter, login);
router.get('/me', authenticate, me);

module.exports = router;
