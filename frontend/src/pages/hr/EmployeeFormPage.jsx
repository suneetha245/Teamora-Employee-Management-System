import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Copy, ImagePlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import { departmentApi, employeeApi, errMsg, fieldErrors, photoUrl } from '../../services/api';
import { STATUSES } from '../../config';

const EMPTY = { fullName: '', email: '', phone: '', gender: '', department: '', designation: '', dateOfJoining: new Date().toISOString().slice(0, 10), status: 'Active' };

function validate(f) {
  const e = {};
  if (f.fullName.trim().length < 2) e.fullName = 'Enter the employee’s full name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email.trim())) e.email = 'Enter a valid email address';
  if (!/^\+?[0-9][0-9\s-]{6,14}$/.test(f.phone.trim())) e.phone = 'Enter a valid phone number (7–15 digits)';
  if (!f.department) e.department = 'Select a department';
  if (!f.designation.trim()) e.designation = 'Designation is required';
  if (!f.dateOfJoining) e.dateOfJoining = 'Select the joining date';
  return e;
}

export default function EmployeeFormPage() {
  const { id } = useParams();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const [form, setForm] = useState(EMPTY);
  const [original, setOriginal] = useState(null);
  const [employeeId, setEmployeeId] = useState('');
  const [departments, setDepartments] = useState([]);
  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState('');
  const [removePhoto, setRemovePhoto] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(editing);
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(null);

  useEffect(() => { departmentApi.list().then(setDepartments).catch((e) => toast.error(errMsg(e))); }, []);

  useEffect(() => {
    if (!editing) return;
    employeeApi.get(id).then((e) => {
      const f = { fullName: e.fullName, email: e.email, phone: e.phone, gender: e.gender || '', department: e.department?._id || '', designation: e.designation, dateOfJoining: e.dateOfJoining.slice(0, 10), status: e.status };
      setForm(f); setOriginal({ ...f, profilePhoto: e.profilePhoto }); setEmployeeId(e.employeeId); setPreview(photoUrl(e.profilePhoto));
    }).catch((err) => { toast.error(errMsg(err)); navigate('/hr/employees'); }).finally(() => setLoading(false));
  }, [id, editing, navigate]);

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: undefined })); };

  const pickPhoto = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) return toast.error('Choose a JPG, PNG or WebP image');
    if (file.size > 2 * 1024 * 1024) return toast.error('Photo must be 2 MB or smaller');
    setPhoto(file); setRemovePhoto(false); setPreview(URL.createObjectURL(file));
  };
  const clearPhoto = () => { setPhoto(null); setPreview(''); setRemovePhoto(true); if (fileRef.current) fileRef.current.value = ''; };

  const reset = () => {
    setForm(original ? { ...original } : EMPTY); setErrors({}); setPhoto(null); setRemovePhoto(false);
    setPreview(original ? photoUrl(original.profilePhoto) : ''); if (fileRef.current) fileRef.current.value = '';
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length) return toast.error('Please fix the highlighted fields');
    const body = new FormData();
    Object.entries(form).forEach(([k, v]) => body.append(k, v.trim ? v.trim() : v));
    if (photo) body.append('photo', photo);
    if (removePhoto) body.append('removePhoto', 'true');
    setBusy(true);
    try {
      if (editing) {
        await employeeApi.update(id, body);
        toast.success('Employee updated');
        navigate('/hr/employees');
      } else {
        setCreated(await employeeApi.create(body));
        toast.success('Employee added');
      }
    } catch (err) {
      setErrors((x) => ({ ...x, ...fieldErrors(err) }));
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const text = (k, label, props = {}) => (
    <div className="field" key={k}>
      <label htmlFor={k}>{label}</label>
      <input id={k} className={`input ${errors[k] ? 'invalid' : ''}`} value={form[k]} onChange={set(k)} {...props} />
      {errors[k] && <span className="field-error">{errors[k]}</span>}
    </div>
  );

  if (loading) return <Spinner fill />;

  return (
    <>
      <div className="page-head">
        <div><h1>{editing ? 'Edit employee' : 'Add employee'}</h1><p>{editing ? 'Update this employee’s details.' : 'Create the employee record and their login account.'}</p></div>
        <Link className="btn btn-ghost" to="/hr/employees"><ArrowLeft size={16} />Back to employees</Link>
      </div>

      <form className="card" onSubmit={submit} noValidate>
        <div className="photo-pick" style={{ marginBottom: 24 }}>
          {preview
            ? <img className="avatar lg" src={preview} alt="Profile preview" />
            : <Avatar name={form.fullName || 'New Employee'} large />}
          <div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={pickPhoto} hidden id="photo" />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <label htmlFor="photo" className="btn btn-ghost" style={{ cursor: 'pointer' }}><ImagePlus size={16} />{preview ? 'Change photo' : 'Upload photo'}</label>
              {preview && <button type="button" className="btn btn-ghost" onClick={clearPhoto}>Remove</button>}
            </div>
            <p className="hint" style={{ marginTop: 6 }}>Optional. JPG, PNG or WebP, up to 2 MB.</p>
          </div>
        </div>

        <div className="form-grid">
          <div className="field">
            <label htmlFor="eid">Employee ID</label>
            <input id="eid" className="input" value={employeeId || 'Generated automatically on save'} disabled />
          </div>
          {!editing && <div className="field">
            <label htmlFor="employee-password">Password</label>
            <input id="employee-password" className="input" value={employeeId || 'Generated automatically on save'} disabled />
            <span className="hint">Automatically generated to match the employee ID on save.</span>
          </div>}
          {text('fullName', 'Full name', { placeholder: 'e.g. Priya Menon', autoComplete: 'off' })}
          {text('email', 'Email address', { type: 'email', placeholder: 'name@company.com', autoComplete: 'off' })}
          {text('phone', 'Phone number', { placeholder: '+91 98765 43210', autoComplete: 'off' })}
          <div className="field">
            <label htmlFor="gender">Gender <span className="hint">(optional)</span></label>
            <select id="gender" className="select" value={form.gender} onChange={set('gender')}>
              <option value="">Prefer not to say</option><option>Male</option><option>Female</option><option>Other</option>
            </select>
          </div>
          <div className="field">
            <label htmlFor="department">Department</label>
            <select id="department" className={`select ${errors.department ? 'invalid' : ''}`} value={form.department} onChange={set('department')}>
              <option value="">Select department</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
            </select>
            {errors.department && <span className="field-error">{errors.department}</span>}
          </div>
          {text('designation', 'Designation', { placeholder: 'e.g. Software Engineer' })}
          {text('dateOfJoining', 'Date of joining', { type: 'date' })}
          <div className="field">
            <label htmlFor="status">Employment status</label>
            <select id="status" className="select" value={form.status} onChange={set('status')}>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
          </div>
        </div>

        <div className="form-actions">
          <button className="btn btn-primary" disabled={busy}>{busy && <Spinner small />}{editing ? 'Save changes' : 'Save employee'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => navigate('/hr/employees')} disabled={busy}>Cancel</button>
          <button type="button" className="btn btn-ghost" onClick={reset} disabled={busy}>Reset</button>
        </div>
      </form>

      {created && (
        <Modal title="Employee added" onClose={() => navigate('/hr/employees')}>
          <p><b>{created.employee.fullName}</b> ({created.employee.employeeId}) can now sign in as an Employee.</p>
          <div className="cred">
            <div>Email: <code>{created.employee.email}</code></div>
            <div style={{ marginTop: 8 }}>Temporary password: <code>{created.tempPassword}</code></div>
          </div>
          <p className="hint" style={{ marginTop: 12 }}>The password matches the employee ID and is available in the employee profile. The profile updates when the employee changes their password.</p>
          <div className="modal-actions">
            <button className="btn btn-ghost" onClick={() => { navigator.clipboard?.writeText(`Email: ${created.employee.email}\nPassword: ${created.tempPassword}`); toast.success('Credentials copied'); }}><Copy size={16} />Copy</button>
            <button className="btn btn-primary" onClick={() => navigate('/hr/employees')}>Done</button>
          </div>
        </Modal>
      )}
    </>
  );
}
