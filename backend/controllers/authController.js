const User = require('../models/User');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { signToken } = require('../utils/token');
const { isEmail, validatePassword } = require('../utils/validate');

const ROLE_LABEL = { hr: 'HR/Admin', employee: 'Employee' };

const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role, employee: u.employee || null });

exports.login = asyncHandler(async (req, res) => {
  const { email, password, role } = req.body;
  if (!isEmail(email) || !password) throw new ApiError(400, 'Enter your email address and password');
  if (!ROLE_LABEL[role]) throw new ApiError(400, 'Choose whether you are signing in as HR/Admin or Employee');

  const user = await User.findOne({ email: String(email).trim().toLowerCase() })
    .select('+password')
    .populate({ path: 'employee', populate: { path: 'department', select: 'name' } });

  // Same message for unknown email and wrong password so accounts can't be enumerated.
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Incorrect email or password');
  if (user.role !== role) throw new ApiError(403, `This account is not registered as ${ROLE_LABEL[role]}`);
  if (user.employee?.status === 'Resigned') throw new ApiError(403, 'This account has been deactivated. Contact HR');

  res.json({ token: signToken(user._id), user: publicUser(user) });
});

// JWTs are stateless: the client discards the token. Endpoint exists for a clean sign-out contract.
exports.logout = (req, res) => res.json({ message: 'Signed out' });

exports.me = (req, res) => res.json({ user: publicUser(req.user) });

exports.changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const problem = validatePassword(newPassword);
  if (problem) throw new ApiError(400, problem);
  const user = await User.findById(req.user._id).select('+password');
  if (!(await user.matchPassword(currentPassword || ''))) throw new ApiError(400, 'Current password is incorrect');
  user.password = newPassword;
  await user.save();
  if (user.role === 'employee' && user.employee) {
    await Employee.findByIdAndUpdate(user.employee, { loginPassword: newPassword });
  }
  res.json({ message: 'Password updated' });
});
