const mongoose = require('mongoose');
const { EMPLOYEE_STATUSES } = require('../utils/validate');

const employeeSchema = new mongoose.Schema(
  {
    employeeId: { type: String, required: true, unique: true },
    loginPassword: { type: String, select: false, default: '' },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' },
    department: { type: mongoose.Schema.Types.ObjectId, ref: 'Department', required: true, index: true },
    designation: { type: String, required: true, trim: true },
    dateOfJoining: { type: Date, required: true },
    status: { type: String, enum: EMPLOYEE_STATUSES, default: 'Active', index: true },
    profilePhoto: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Employee', employeeSchema);
