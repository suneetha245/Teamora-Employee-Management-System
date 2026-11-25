const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9][0-9\s-]{6,14}$/;

exports.EMPLOYEE_STATUSES = ['Active', 'Probation', 'On Leave', 'Resigned'];
exports.GENDERS = ['Male', 'Female', 'Other', ''];
exports.isEmail = (v) => EMAIL.test(String(v || ''));

exports.validateEmployee = (b) => {
  const e = {};
  const name = String(b.fullName || '').trim();
  if (name.length < 2) e.fullName = 'Enter the employee’s full name';
  if (!exports.isEmail(b.email)) e.email = 'Enter a valid email address';
  if (!PHONE.test(String(b.phone || '').trim())) e.phone = 'Enter a valid phone number (7–15 digits)';
  if (!b.department) e.department = 'Select a department';
  if (!String(b.designation || '').trim()) e.designation = 'Designation is required';
  const d = new Date(b.dateOfJoining);
  if (!b.dateOfJoining || Number.isNaN(d.getTime())) e.dateOfJoining = 'Select a valid joining date';
  if (!exports.EMPLOYEE_STATUSES.includes(b.status)) e.status = 'Select an employment status';
  if (b.gender && !exports.GENDERS.includes(b.gender)) e.gender = 'Invalid gender value';
  return e;
};

exports.cleanEmployeeBody = (b) => ({
  fullName: String(b.fullName || '').trim(),
  email: String(b.email || '').trim().toLowerCase(),
  phone: String(b.phone || '').trim(),
  gender: b.gender || '',
  department: b.department,
  designation: String(b.designation || '').trim(),
  dateOfJoining: b.dateOfJoining,
  status: b.status,
});

exports.validatePassword = (p) =>
  typeof p === 'string' && p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p)
    ? null
    : 'Password must be at least 8 characters and include a letter and a number';
