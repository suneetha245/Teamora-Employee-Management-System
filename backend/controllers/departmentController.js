const Department = require('../models/Department');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

async function nextDepartmentId() {
  const last = await Department.findOne().sort({ departmentId: -1 }).select('departmentId');
  const n = last ? parseInt(last.departmentId.split('-')[1], 10) + 1 : 1;
  return `DEP-${String(n).padStart(3, '0')}`;
}

const readBody = (b) => {
  const name = String(b.name || '').trim();
  if (name.length < 2) throw new ApiError(400, 'Department name must be at least 2 characters');
  return { name, description: String(b.description || '').trim() };
};

exports.listDepartments = asyncHandler(async (req, res) => {
  const [departments, counts] = await Promise.all([
    Department.find().sort({ name: 1 }).lean(),
    Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({ data: departments.map((d) => ({ ...d, employeeCount: map.get(String(d._id)) || 0 })) });
});

exports.createDepartment = asyncHandler(async (req, res) => {
  const body = readBody(req.body);
  if (await Department.exists({ name: new RegExp(`^${body.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }))
    throw new ApiError(409, 'A department with this name already exists');
  const department = await Department.create({ ...body, departmentId: await nextDepartmentId() });
  res.status(201).json({ department });
});

exports.updateDepartment = asyncHandler(async (req, res) => {
  const body = readBody(req.body);
  const department = await Department.findByIdAndUpdate(req.params.id, body, { new: true, runValidators: true });
  if (!department) throw new ApiError(404, 'Department not found');
  res.json({ department });
});

exports.deleteDepartment = asyncHandler(async (req, res) => {
  const count = await Employee.countDocuments({ department: req.params.id });
  if (count > 0)
    throw new ApiError(409, `This department has ${count} employee${count > 1 ? 's' : ''}. Move them to another department first`);
  const department = await Department.findByIdAndDelete(req.params.id);
  if (!department) throw new ApiError(404, 'Department not found');
  res.json({ message: 'Department deleted' });
});
