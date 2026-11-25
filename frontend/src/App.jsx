import { Navigate, Route, Routes, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Building2, FileSpreadsheet, Settings as Cog, UserRound } from 'lucide-react';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './layouts/DashboardLayout';
import Home from './pages/Home';
import Login from './pages/Login';
import Settings from './pages/Settings';
import HrDashboard from './pages/hr/HrDashboard';
import Employees from './pages/hr/Employees';
import EmployeeFormPage from './pages/hr/EmployeeFormPage';
import EmployeeProfile from './pages/hr/EmployeeProfile';
import Departments from './pages/hr/Departments';
import Reports from './pages/hr/Reports';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import MyProfile from './pages/employee/MyProfile';

const hrLinks = [
  { to: '/hr', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/hr/employees', label: 'Employee Management', icon: Users },
  { to: '/hr/departments', label: 'Departments', icon: Building2 },
  { to: '/hr/reports', label: 'Reports & Export', icon: FileSpreadsheet },
  { to: '/hr/settings', label: 'Settings', icon: Cog },
];
const employeeLinks = [
  { to: '/employee', label: 'My Dashboard', icon: LayoutDashboard, end: true },
  { to: '/employee/profile', label: 'My Profile', icon: UserRound },
  { to: '/employee/settings', label: 'Settings', icon: Cog },
];

const NotFound = () => (
  <div className="center-fill" style={{ minHeight: '100vh', textAlign: 'center' }}>
    <div>
      <h1>Page not found</h1>
      <p style={{ margin: '10px 0 20px', color: 'var(--muted)' }}>The page you’re looking for doesn’t exist or has moved.</p>
      <Link className="btn btn-primary" to="/">Go to homepage</Link>
    </div>
  </div>
);

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />

      <Route element={<ProtectedRoute role="hr" />}>
        <Route path="/hr" element={<DashboardLayout links={hrLinks} subtitle="HR/Admin" />}>
          <Route index element={<HrDashboard />} />
          <Route path="employees" element={<Employees />} />
          <Route path="employees/new" element={<EmployeeFormPage />} />
          <Route path="employees/:id" element={<EmployeeProfile />} />
          <Route path="employees/:id/edit" element={<EmployeeFormPage />} />
          <Route path="departments" element={<Departments />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute role="employee" />}>
        <Route path="/employee" element={<DashboardLayout links={employeeLinks} subtitle="Employee" />}>
          <Route index element={<EmployeeDashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<Navigate to="/login" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
