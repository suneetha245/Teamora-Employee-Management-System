import { Link } from 'react-router-dom';
import { BadgeCheck, Briefcase, Building2, IdCard } from 'lucide-react';
import StatCard from '../../components/StatCard';
import { useAuth } from '../../context/AuthContext';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const e = user.employee;
  if (!e) return <div className="card empty"><h4>No employee record linked</h4><p>Ask HR to link your account to an employee profile.</p></div>;

  return (
    <>
      <div className="page-head">
        <div><h1>Welcome, {user.name.split(' ')[0]}</h1><p>Here’s a summary of your employment details.</p></div>
        <Link className="btn btn-primary" to="/employee/profile">View my profile</Link>
      </div>
      <div className="grid-4">
        <StatCard icon={IdCard} label="Employee ID" value={e.employeeId} />
        <StatCard icon={Building2} label="Department" value={e.department?.name || '—'} tone="blue" />
        <StatCard icon={Briefcase} label="Designation" value={e.designation} tone="orange" />
        <StatCard icon={BadgeCheck} label="Employment status" value={e.status} tone="green" />
      </div>
      <div className="card" style={{ marginTop: 18 }}>
        <p>Your profile is read-only. If any of your details are out of date, please contact HR to have them updated.</p>
      </div>
    </>
  );
}
