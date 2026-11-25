const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

// Verifies the Bearer token and loads the user (with their employee record) on every request.
exports.protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header.startsWith('Bearer ')) throw new ApiError(401, 'Please sign in to continue');
  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please sign in again');
  }
  const user = await User.findById(decoded.id).populate({
    path: 'employee',
    populate: { path: 'department', select: 'name' },
  });
  if (!user) throw new ApiError(401, 'This account no longer exists');
  req.user = user;
  next();
});

exports.hrOnly = (req, res, next) => {
  if (req.user?.role !== 'hr') return next(new ApiError(403, 'Only HR/Admin can perform this action'));
  next();
};
