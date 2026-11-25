import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import Logo from '../components/Logo';
import Spinner from '../components/Spinner';
import { useAuth, homeFor } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { LOGIN_IMAGE } from '../config';

export default function Login() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', role: 'hr' });
  const [show, setShow] = useState(false);
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeFor(user.role)} replace />;

  const set = (k) => (e) => {
    setForm((f) => ({ ...f, [k]: e.target.value }));
    setErrors((current) => ({ ...current, [k]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.email.trim()) errs.email = 'Enter an email ID';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.password) errs.password = 'Enter your password';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      const u = await login(form);
      toast.success(`Welcome back, ${u.name.split(' ')[0]}`);
      navigate(homeFor(u.role), { replace: true });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login">
      <aside className="login-art">
        <img src={LOGIN_IMAGE} alt="" onError={(e) => (e.currentTarget.style.display = 'none')} />
        <div className="over">
          <Logo light />
          <div>
            <h1>Manage Your People with Confidence</h1>
            <p>A smarter way to connect HR operations and employee management.</p>
          </div>
        </div>
      </aside>

      <div className="login-side">
        <form className="login-box" onSubmit={submit} noValidate>
          <Logo />
          <h2>Welcome Back</h2>
          <p className="desc">Sign in to your Teamora workspace to continue.</p>

          <div className="role-switch" role="radiogroup" aria-label="Sign in as">
            <button type="button" role="radio" aria-checked={form.role === 'hr'} className={form.role === 'hr' ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, role: 'hr' }))}>HR/Admin</button>
            <button type="button" role="radio" aria-checked={form.role === 'employee'} className={form.role === 'employee' ? 'on' : ''} onClick={() => setForm((f) => ({ ...f, role: 'employee' }))}>Employee</button>
          </div>

          <div className="stack" style={{ gap: 16 }}>
            <div className="field">
              <label htmlFor="email">Email address</label>
              <input id="email" type="email" autoComplete="username" className={`input ${errors.email ? 'invalid' : ''}`} placeholder="you@company.com" value={form.email} onChange={set('email')} />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <div className="input-wrap">
                <input id="password" type={show ? 'text' : 'password'} autoComplete="current-password" className={`input ${errors.password ? 'invalid' : ''}`} placeholder="Enter your password" value={form.password} onChange={set('password')} />
                <button type="button" className="icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>
          </div>

          <div className="login-row" style={{ justifyContent: 'flex-end' }}>
            <a href="#forgot" onClick={(e) => { e.preventDefault(); toast.info(form.role === 'hr' ? 'The HR/Admin password is handled by the administration team. Please contact your administrator.' : 'Please contact your HR team to know your password.'); }}>Forgot password?</a>
          </div>

          <button className="btn btn-accent btn-lg btn-block" disabled={busy}>{busy && <Spinner small />}Login</button>
          <p className="demo" style={{ marginTop: 8 }}><Link to="/">← Back to homepage</Link></p>
        </form>
      </div>
    </div>
  );
}
