const mongoose = require('mongoose');
const ExcelJS = require('exceljs');
const Employee = require('../models/Employee');
const Department = require('../models/Department');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const NAVY = 'FF172554';

// Dashboard numbers for HR.
exports.summary = asyncHandler(async (req, res) => {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [departments, counts, total, active, recentCount, recent, statusRows] = await Promise.all([
    Department.find().sort({ name: 1 }).lean(),
    Employee.aggregate([{ $group: { _id: '$department', count: { $sum: 1 } } }]),
    Employee.countDocuments(),
    Employee.countDocuments({ status: 'Active' }),
    Employee.countDocuments({ createdAt: { $gte: since } }),
    Employee.find().sort({ createdAt: -1 }).limit(5).populate('department', 'name'),
    Employee.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  const map = new Map(counts.map((c) => [String(c._id), c.count]));
  res.json({
    totals: { employees: total, active, departments: departments.length, recentlyAdded: recentCount },
    byDepartment: departments.map((d) => ({ id: d._id, name: d.name, count: map.get(String(d._id)) || 0 })),
    byStatus: statusRows.map((s) => ({ status: s._id, count: s.count })),
    recent,
  });
});

async function fetchRows(departmentParam) {
  const filter = {};
  let department = null;
  if (departmentParam && departmentParam !== 'all') {
    if (!mongoose.isValidObjectId(departmentParam)) throw new ApiError(400, 'Invalid department');
    department = await Department.findById(departmentParam);
    if (!department) throw new ApiError(404, 'Department not found');
    filter.department = department._id;
  }
  const rows = await Employee.find(filter).populate('department', 'name').sort({ employeeId: 1 });
  return { rows, department };
}

// JSON preview of what an export would contain.
exports.employeeReport = asyncHandler(async (req, res) => {
  const { rows, department } = await fetchRows(req.query.department);
  res.json({ department: department?.name || 'All departments', total: rows.length, data: rows });
});

const COLUMNS = [
  { header: 'Employee ID', key: 'employeeId', width: 14 },
  { header: 'Name', key: 'fullName', width: 28 },
  { header: 'Email', key: 'email', width: 34 },
  { header: 'Phone', key: 'phone', width: 18 },
  { header: 'Department', key: 'department', width: 20 },
  { header: 'Designation', key: 'designation', width: 26 },
  { header: 'Joining Date', key: 'dateOfJoining', width: 16 },
  { header: 'Status', key: 'status', width: 14 },
];

function addSheet(wb, title, rows) {
  const ws = wb.addWorksheet(title.replace(/[\\/*?:[\]]/g, ' ').slice(0, 31), { views: [{ state: 'frozen', ySplit: 1 }] });
  ws.columns = COLUMNS;
  rows.forEach((e) =>
    ws.addRow({
      employeeId: e.employeeId,
      fullName: e.fullName,
      email: e.email,
      phone: e.phone,
      department: e.department?.name || '',
      designation: e.designation,
      dateOfJoining: e.dateOfJoining,
      status: e.status,
    })
  );
  const header = ws.getRow(1);
  header.height = 24;
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: NAVY } };
    c.alignment = { vertical: 'middle', horizontal: 'left' };
  });
  ws.getColumn('dateOfJoining').numFmt = 'dd-mmm-yyyy';
  ws.getColumn('dateOfJoining').alignment = { horizontal: 'left' };
  ws.eachRow((row, i) => {
    row.eachCell((c) => {
      c.border = { bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } } };
      if (i > 1 && i % 2 === 1) c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF8FAFC' } };
    });
  });
  ws.autoFilter = { from: 'A1', to: 'H1' };
}

// department=<id> → one sheet; department=all (default) → "All Employees" plus a sheet per department.
exports.exportEmployees = asyncHandler(async (req, res) => {
  const { rows, department } = await fetchRows(req.query.department);
  const wb = new ExcelJS.Workbook();
  wb.creator = 'Teamora';
  wb.created = new Date();

  if (department) {
    addSheet(wb, department.name, rows);
  } else {
    addSheet(wb, 'All Employees', rows);
    const departments = await Department.find().sort({ name: 1 });
    for (const d of departments)
      addSheet(wb, d.name, rows.filter((e) => String(e.department?._id) === String(d._id)));
  }

  const name = `teamora-employees-${(department?.name || 'all').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${new Date().toISOString().slice(0, 10)}.xlsx`;
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', `attachment; filename="${name}"`);
  await wb.xlsx.write(res);
  res.end();
});
