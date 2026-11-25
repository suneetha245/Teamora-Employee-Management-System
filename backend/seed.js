// Usage: npm run seed   (wipes users, employees and departments, then inserts demo data)
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Employee = require('./models/Employee');
const Department = require('./models/Department');

const departments = [
  ['Human Resources', 'People operations, hiring and employee experience'],
  ['Development', 'Product engineering and platform'],
  ['Testing', 'Quality assurance and test automation'],
  ['Finance', 'Accounting, payroll and budgeting'],
  ['Marketing', 'Brand, content and campaigns'],
  ['Operations', 'Facilities, vendors and day-to-day delivery'],
  ['Sales', 'Customer acquisition and account management'],
];

const people = [
  ['Meera Nair', 'meera.nair', 'Human Resources', 'HR Executive', 'Female', 'Active', '2022-06-13'],
  ['Aarav Sharma', 'aarav.sharma', 'Development', 'Senior Software Engineer', 'Male', 'Active', '2021-03-01'],
  ['Divya Rao', 'divya.rao', 'Development', 'Frontend Developer', 'Female', 'Active', '2023-08-21'],
  ['Karthik Shetty', 'karthik.shetty', 'Testing', 'QA Automation Engineer', 'Male', 'Active', '2023-01-09'],
  ['Ananya Iyer', 'ananya.iyer', 'Testing', 'QA Analyst', 'Female', 'Probation', '2026-09-15'],
  ['Rohan Mehta', 'rohan.mehta', 'Finance', 'Accounts Manager', 'Male', 'Active', '2020-11-02'],
  ['Sneha Kulkarni', 'sneha.kulkarni', 'Marketing', 'Content Strategist', 'Female', 'On Leave', '2022-02-14'],
  ['Vikram Reddy', 'vikram.reddy', 'Operations', 'Operations Lead', 'Male', 'Active', '2019-07-22'],
  ['Pooja Hegde', 'pooja.hegde', 'Sales', 'Account Executive', 'Female', 'Active', '2024-04-08'],
  ['Arjun Pai', 'arjun.pai', 'Development', 'Backend Developer', 'Male', 'Active', '2026-10-27'],
];

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany({}), Employee.deleteMany({}), Department.deleteMany({})]);

  const deps = {};
  for (const [i, [name, description]] of departments.entries())
    deps[name] = await Department.create({ departmentId: `DEP-${String(i + 1).padStart(3, '0')}`, name, description });

  await User.create({ name: 'Teamora Admin', email: 'hr@teamora.com', password: 'Admin@123', role: 'hr' });

  for (const [i, [fullName, handle, dep, designation, gender, status, joined]] of people.entries()) {
    const email = `${handle}@teamora.com`;
    const emp = await Employee.create({
      employeeId: `EMP-${String(i + 1).padStart(4, '0')}`,
      fullName, email, gender, designation, status,
      phone: `+91 98${String(45000000 + i * 137).slice(0, 8)}`,
      department: deps[dep]._id,
      dateOfJoining: new Date(joined),
    });
    await User.create({ name: fullName, email, password: 'Employee@123', role: 'employee', employee: emp._id });
  }

  console.log('Seeded. HR login: hr@teamora.com / Admin@123');
  console.log('Employee login: aarav.sharma@teamora.com / Employee@123 (all seeded employees share this password)');
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
