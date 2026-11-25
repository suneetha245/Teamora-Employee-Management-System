import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileSpreadsheet, UserCheck, UserPlus, Users, Sparkles } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { toast } from 'react-toastify';
import StatCard from '../../components/StatCard';
import Spinner from '../../components/Spinner';
import Avatar from '../../components/Avatar';
import StatusBadge from '../../components/StatusBadge';
import { errMsg, reportApi } from '../../services/api';

const COLORS = ['#172554', '#2563EB', '#F59E0B', '#16A34A', '#60A5FA', '#94A3B8', '#B45309'];

export default function HrDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    reportApi.summary().then(setData).catch((e) => toast.error(errMsg(e)));
  }, []);

  if (!data) return <Spinner fill />;
  const { totals, byDepartment, recent } = data;
  const max = Math.max(1, ...byDepartment.map((d) => d.count));
  const pie = byDepartment.filter((d) => d.count > 0);

  return (
    <>
      <div className="page-head"><div><h1>Dashboard</h1><p>A snapshot of your workforce today.</p></div></div>

      <div className="grid-4">
        <StatCard icon={Users} label="Total employees" value={totals.employees} />
        <StatCard icon={UserCheck} label="Active employees" value={totals.active} tone="green" />
        <StatCard icon={Building2} label="Total departments" value={totals.departments} tone="blue" />
        <StatCard icon={Sparkles} label="Added in last 30 days" value={totals.recentlyAdded} tone="orange" />
      </div>

      <div className="grid-3-2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head"><h3>Employees by department</h3></div>
          {pie.length === 0 ? (
            <div className="empty"><h4>No employees yet</h4><p>Add your first employee to see the distribution.</p></div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1fr) 1fr', gap: 8, alignItems: 'center' }}>
              <div style={{ height: 230 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pie} dataKey="count" nameKey="name" innerRadius={55} outerRadius={95} paddingAngle={2}>
                      {pie.map((d, i) => <Cell key={d.id} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8, fontSize: '.88rem' }}>
                {pie.map((d, i) => (
                  <li key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <i style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i % COLORS.length], flex: 'none' }} />
                    <span style={{ flex: 1 }}>{d.name}</span><b style={{ color: 'var(--navy)' }}>{d.count}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-head"><h3>Quick actions</h3></div>
          <div className="quick">
            <Link className="btn btn-primary" to="/hr/employees/new"><UserPlus size={17} />Add employee</Link>
            <Link className="btn btn-ghost" to="/hr/employees"><Users size={17} />View employees</Link>
            <Link className="btn btn-ghost" to="/hr/departments"><Building2 size={17} />Departments</Link>
            <Link className="btn btn-ghost" to="/hr/reports"><FileSpreadsheet size={17} />Export report</Link>
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginTop: 18 }}>
        <div className="card">
          <div className="card-head"><h3>Department statistics</h3><Link to="/hr/departments">Manage</Link></div>
          {byDepartment.length === 0 && <div className="empty"><h4>No departments</h4><p>Create a department to get started.</p></div>}
          {byDepartment.map((d) => (
            <div className="bar-row" key={d.id}>
              <span>{d.name}</span>
              <div className="bar"><i style={{ width: `${(d.count / max) * 100}%` }} /></div>
              <b>{d.count}</b>
            </div>
          ))}
        </div>

        <div className="card">
          <div className="card-head"><h3>Recently added</h3><Link to="/hr/employees">View all</Link></div>
          {recent.length === 0 ? (
            <div className="empty"><h4>Nobody added yet</h4><p>New employees will appear here.</p></div>
          ) : (
            <div className="mini-list">
              {recent.map((e) => (
                <div key={e._id}>
                  <Avatar name={e.fullName} src={e.profilePhoto} />
                  <div className="grow"><strong>{e.fullName}</strong><small>{e.designation} · {e.department?.name}</small></div>
                  <StatusBadge status={e.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
