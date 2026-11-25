import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, X } from 'lucide-react';
import Logo from '../components/Logo';
import Avatar from '../components/Avatar';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ links, subtitle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const current = links.find((l) => (l.end ? pathname === l.to : pathname.startsWith(l.to)));

  useEffect(() => setOpen(false), [pathname]);

  const signOut = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="shell">
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <Logo light to={links[0].to} />
        <nav className="nav" aria-label="Main">
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}><Icon size={19} />{label}</NavLink>
          ))}
          <span className="sep" />
          <button className="nav-item" onClick={signOut}><LogOut size={19} />Logout</button>
        </nav>
      </aside>
      <div className={`scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} />
      <div className="main">
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button className="icon-btn menu-btn" onClick={() => setOpen((o) => !o)} aria-label="Toggle menu">{open ? <X size={22} /> : <Menu size={22} />}</button>
            <h2>{current?.label || 'Teamora'}</h2>
          </div>
          <div className="who">
            <div><strong>{user.name}</strong><small>{subtitle}</small></div>
            <Avatar name={user.name} src={user.employee?.profilePhoto} />
          </div>
        </header>
        <main className="content"><Outlet /></main>
      </div>
    </div>
  );
}
