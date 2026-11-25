const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');
const { removeUpload } = require('../utils/files');
const { validateEmployee, cleanEmployeeBody } = require('../utils/validate');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

async function nextEmployeeId() {
  const last = await Employee.findOne().sort({ employeeId: -1 }).select('employeeId');
  const n = last ? parseInt(last.employeeId.split('-')[1], 10) + 1 : 1;
  return `EMP-${String(n).padStart(4, '0')}`;
}

async function validatedBody(req) {
  const body = cleanEmployeeBody(req.body);
  const errors = validateEmployee(body);
  if (Object.keys(errors).length) throw new ApiError(400, Object.values(errors)[0], errors);
  if (!mongoose.isValidObjectId(body.department) || !(await Department.exists({ _id: body.department })))
    throw new ApiError(400, 'Selected department does not exist', { department: 'Selected department does not exist' });
  return body;
}

exports.createEmployee = asyncHandler(async (req, res) => {
  let employee;
  try {
    const body = await validatedBody(req);
    if (await Employee.exists({ email: body.email }) || await User.exists({ email: body.email }))
      throw new ApiError(409, 'An account with this email already exists', { email: 'Email already in use' });

    const employeeId = await nextEmployeeId();
    const tempPassword = employeeId;
    employee = await Employee.create({
      ...body,
      employeeId,
      loginPassword: tempPassword,
      profilePhoto: req.file ? `/uploads/${req.file.filename}` : '',
    });
    try {
      await User.create({ name: body.fullName, email: body.email, password: tempPassword, role: 'employee', employee: employee._id });
    } catch (err) {
      await employee.deleteOne();
      throw err;
    }
    await employee.populate('department', 'name');
    res.status(201).json({ employee, tempPassword });
  } catch (err) {
    removeUpload(req.file);
    throw err;
  }
});

exports.listEmployees = asyncHandler(async (req, res) => {
  const { search = '', department, status, page = 1, limit = 10 } = req.query;
  const q = {};
  if (department && mongoose.isValidObjectId(department)) q.department = department;
  if (status) q.status = status;
  if (String(search).trim()) {
    const r = new RegExp(escapeRegex(String(search).trim()), 'i');
    q.$or = [{ fullName: r }, { email: r }, { employeeId: r }, { phone: r }, { designation: r }];
  }
  const p = Math.max(1, parseInt(page, 10) || 1);
  const l = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
  const [data, total] = await Promise.all([
    Employee.find(q).populate('department', 'name').sort({ createdAt: -1 }).skip((p - 1) * l).limit(l),
    Employee.countDocuments(q),
  ]);
  res.json({ data, total, page: p, pages: Math.max(1, Math.ceil(total / l)) });
});

exports.getEmployee = asyncHandler(async (req, res) => {
  const { id } = req.params;
  // Employees may only read their own record; HR may read any.
  if (req.user.role !== 'hr' && String(req.user.employee?._id) !== id)
    throw new ApiError(403, 'You can only view your own profile');
  const employeeQuery = Employee.findById(id).populate('department', 'name');
  if (req.user.role === 'hr') employeeQuery.select('+loginPassword');
  const employee = await employeeQuery;
  if (!employee) throw new ApiError(404, 'Employee not found');
  res.json({ employee });
});

exports.updateEmployee = asyncHandler(async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) throw new ApiError(404, 'Employee not found');
    const body = await validatedBody(req);
    if (await Employee.exists({ email: body.email, _id: { $ne: employee._id } }))
      throw new ApiError(409, 'Another employee already uses this email', { email: 'Email already in use' });

    const oldPhoto = employee.profilePhoto;
    Object.assign(employee, body);
    if (req.file) employee.profilePhoto = `/uploads/${req.file.filename}`;
    else if (req.body.removePhoto === 'true') employee.profilePhoto = '';
    await employee.save();
    await User.findOneAndUpdate({ employee: employee._id }, { name: body.fullName, email: body.email });
    if (oldPhoto && oldPhoto !== employee.profilePhoto) removeUpload(oldPhoto);
    await employee.populate('department', 'name');
    res.json({ employee });
  } catch (err) {
    removeUpload(req.file);
    throw err;
  }
});

exports.deleteEmployee = asyncHandler(async (req, res) => {
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  await Promise.all([employee.deleteOne(), User.deleteOne({ employee: employee._id })]);
  removeUpload(employee.profilePhoto);
  res.json({ message: 'Employee deleted' });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ employee: req.params.id });
  if (!user) throw new ApiError(404, 'No login account found for this employee');
  const employee = await Employee.findById(req.params.id);
  if (!employee) throw new ApiError(404, 'Employee not found');
  const tempPassword = employee.employeeId;
  user.password = tempPassword;
  await user.save();
  employee.loginPassword = tempPassword;
  await employee.save();
  res.json({ tempPassword });
});
