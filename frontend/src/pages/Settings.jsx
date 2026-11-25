import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { authApi, errMsg } from '../services/api';
import Spinner from '../components/Spinner';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [errors, setErrors] = useState({});
  const [visible, setVisible] = useState({});
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.currentPassword) errs.currentPassword = 'Enter your current password';
    if (form.newPassword.length < 8 || !/[A-Za-z]/.test(form.newPassword) || !/\d/.test(form.newPassword))
      errs.newPassword = 'Use at least 8 characters with a letter and a number';
    if (form.confirm !== form.newPassword) errs.confirm = 'Passwords do not match';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await authApi.changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      toast.success('Password updated');
      setForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const field = (k, label) => (
    <div className="field" key={k}>
      <label htmlFor={k}>{label}</label>
      <div className="input-wrap">
        <input id={k} type={visible[k] ? 'text' : 'password'} className={`input ${errors[k] ? 'invalid' : ''}`} value={form[k]} onChange={set(k)} autoComplete={k === 'currentPassword' ? 'current-password' : 'new-password'} />
        <button type="button" className="icon-btn" onClick={() => setVisible((v) => ({ ...v, [k]: !v[k] }))} aria-label={visible[k] ? `Hide ${label.toLowerCase()}` : `Show ${label.toLowerCase()}`}>
          {visible[k] ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  return (
    <>
      <div className="page-head"><div><h1>Settings</h1><p>Manage your account and sign-in details.</p></div></div>
      <div className="grid-2" style={{ alignItems: 'start' }}>
        <div className="card">
          <div className="card-head"><h3>Account</h3></div>
          <dl className="detail-grid" style={{ margin: 0 }}>
            <div className="detail"><dt>Name</dt><dd>{user.name}</dd></div>
            <div className="detail"><dt>Role</dt><dd>{user.role === 'hr' ? 'HR/Admin' : 'Employee'}</dd></div>
            <div className="detail" style={{ gridColumn: '1 / -1' }}><dt>Email</dt><dd>{user.email}</dd></div>
          </dl>
        </div>
        <form className="card" onSubmit={submit} noValidate>
          <div className="card-head"><h3>Change password</h3></div>
          <div className="stack" style={{ gap: 16 }}>
            {field('currentPassword', 'Current password')}
            {field('newPassword', 'New password')}
            {field('confirm', 'Confirm new password')}
          </div>
          <div className="form-actions" style={{ marginTop: 20 }}><button className="btn btn-primary" disabled={busy}>{busy && <Spinner small />}Update password</button></div>
        </form>
      </div>
    </>
  );
}
