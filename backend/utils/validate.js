const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^\+?[0-9]{7,15}$/;

exports.EMPLOYEE_STATUSES = ['Active', 'Probation', 'On Leave', 'Resigned'];
exports.GENDERS = ['Male', 'Female', 'Other', ''];
exports.isEmail = (v) => EMAIL.test(String(v || ''));

exports.validateEmployee = (b) => {
  const e = {};
  const name = String(b.fullName || '').trim();
  if (name.length < 2 || !/\p{L}/u.test(name)) e.fullName = 'Enter a name with at least 2 characters';
  else if (name.length > 100) e.fullName = 'Name must be 100 characters or fewer';
  else if (!/^[\p{L}\p{M} .'-]+$/u.test(name)) e.fullName = 'Use letters, spaces, apostrophes, periods or hyphens only';
  const email = String(b.email || '').trim();
  if (!email) e.email = 'Enter an email address';
  else if (email.length > 254 || !exports.isEmail(email)) e.email = 'Enter a valid email address';
  const phone = String(b.phone || '').trim();
  if (!phone) e.phone = 'Enter a phone number';
  else if (!PHONE.test(phone)) e.phone = 'Enter a valid phone number with 7–15 digits and an optional leading +';
  if (!b.department) e.department = 'Select a department';
  const designation = String(b.designation || '').trim();
  if (!designation) e.designation = 'Enter a designation';
  else if (designation.length < 2) e.designation = 'Designation must be at least 2 characters';
  else if (/\p{N}/u.test(designation)) e.designation = 'Designation cannot contain numbers';
  else if (designation.length > 100) e.designation = 'Designation must be 100 characters or fewer';
  const dateValue = String(b.dateOfJoining || '');
  const d = new Date(`${dateValue}T00:00:00Z`);
  if (!dateValue) e.dateOfJoining = 'Select a joining date';
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue) || Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== dateValue) e.dateOfJoining = 'Enter a valid joining date';
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
