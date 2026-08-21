// controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { validateLoginInput } = require('../utils/validate');
const { ApiError } = require('../middleware/errorHandler');

function login(req, res, next) {
  try {
    const { valid, errors } = validateLoginInput(req.body);
    if (!valid) throw new ApiError(400, 'Invalid login request.', errors);

    const { username, password } = req.body;
    const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username);

    // Same generic message whether the username or password is wrong,
    // so we don't leak which usernames exist.
    if (!user) throw new ApiError(401, 'Invalid username or password.');

    const passwordMatches = bcrypt.compareSync(password, user.password_hash);
    if (!passwordMatches) throw new ApiError(401, 'Invalid username or password.');

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role, name: user.name },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

function me(req, res) {
  res.json({ user: req.user });
}

module.exports = { login, me };
