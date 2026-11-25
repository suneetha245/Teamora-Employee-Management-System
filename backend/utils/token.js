const jwt = require('jsonwebtoken');
const crypto = require('crypto');

exports.signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

exports.generatePassword = () => `Tm-${crypto.randomBytes(4).toString('hex')}A1`;
