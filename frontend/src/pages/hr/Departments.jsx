import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Filter, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { departmentApi, employeeApi, errMsg } from '../../services/api';

export default function Departments() {
  const [list, setList] = useState(null);
  const [editor, setEditor] = useState(null); // { _id?, name, description }
  const [error, setError] = useState('');
  const [toDelete, setToDelete] = useState(null);
  const [viewing, setViewing] = useState(null);
  const [members, setMembers] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => departmentApi.list().then(setList).catch((e) => toast.error(errMsg(e))), []);
  useEffect(() => { load(); }, [load]);

  const save = async (e) => {
    e.preventDefault();
    if (editor.name.trim().length < 2) return setError('Department name must be at least 2 characters');
    setBusy(true);
    try {
      const body = { name: editor.name, description: editor.description };
      editor._id ? await departmentApi.update(editor._id, body) : await departmentApi.create(body);
      toast.success(editor._id ? 'Department updated' : 'Department added');
      setEditor(null); setError(''); load();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    setBusy(true);
    try {
      await departmentApi.remove(toDelete._id);
      toast.success('Department deleted');
      setToDelete(null); load();
    } catch (err) {
      toast.error(errMsg(err)); setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const view = async (d) => {
    setViewing(d); setMembers(null);
    try { setMembers((await employeeApi.list({ department: d._id, limit: 100 })).data); } catch (e) { toast.error(errMsg(e)); setViewing(null); }
  };

  if (!list) return <Spinner fill />;

  return (
    <>
      <div className="page-head">
        <div><h1>Departments</h1><p>Organise your teams and see who belongs where.</p></div>
        <button className="btn btn-primary" onClick={() => { setEditor({ name: '', description: '' }); setError(''); }}><Plus size={17} />Add department</button>
      </div>

      <div className="card">
        {list.length === 0 ? (
          <div className="empty"><h4>No departments yet</h4><p>Add a department to start assigning employees.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>ID</th><th>Department</th><th>Description</th><th>Employees</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {list.map((d) => (
                  <tr key={d._id}>
                    <td><b style={{ color: 'var(--navy)' }}>{d.departmentId}</b></td>
                    <td><b style={{ color: 'var(--navy)' }}>{d.name}</b></td>
                    <td style={{ color: 'var(--muted)', maxWidth: 320 }}>{d.description || '—'}</td>
                    <td><span className="badge Active" style={{ background: 'var(--navy-soft)', color: 'var(--navy)' }}>{d.employeeCount}</span></td>
                    <td>
                      <div className="actions">
                        <button className="icon-btn" title="View employees" aria-label={`View employees in ${d.name}`} onClick={() => view(d)}><Users size={17} /></button>
                        <Link className="icon-btn" title="Filter employee list" aria-label={`Filter employee list by ${d.name}`} to={`/hr/employees?department=${d._id}`}><Filter size={17} /></Link>
                        <button className="icon-btn" title="Edit" aria-label={`Edit ${d.name}`} onClick={() => { setEditor({ ...d }); setError(''); }}><Pencil size={17} /></button>
                        <button className="icon-btn danger" title="Delete" aria-label={`Delete ${d.name}`} onClick={() => setToDelete(d)}><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {editor && (
        <Modal title={editor._id ? 'Edit department' : 'Add department'} onClose={() => setEditor(null)}>
          <form onSubmit={save} noValidate>
            <div className="stack" style={{ gap: 16, marginTop: 14 }}>
              <div className="field">
                <label htmlFor="dname">Department name</label>
                <input id="dname" autoFocus className={`input ${error ? 'invalid' : ''}`} value={editor.name} onChange={(e) => { setEditor({ ...editor, name: e.target.value }); setError(''); }} />
                {error && <span className="field-error">{error}</span>}
              </div>
              <div className="field">
                <label htmlFor="ddesc">Description <span className="hint">(optional)</span></label>
                <textarea id="ddesc" className="textarea" rows={3} value={editor.description || ''} onChange={(e) => setEditor({ ...editor, description: e.target.value })} />
              </div>
            </div>
            <div className="modal-actions">
              <button type="button" className="btn btn-ghost" onClick={() => setEditor(null)}>Cancel</button>
              <button className="btn btn-primary" disabled={busy}>{busy && <Spinner small />}{editor._id ? 'Save changes' : 'Add department'}</button>
            </div>
          </form>
        </Modal>
      )}

      {toDelete && (
        <ConfirmDialog title="Delete this department?" message={`“${toDelete.name}” will be removed. Departments that still have employees can’t be deleted.`}
          confirmLabel="Delete department" busy={busy} onConfirm={remove} onCancel={() => setToDelete(null)} />
      )}

      {viewing && (
        <Modal title={`${viewing.name} team`} wide onClose={() => setViewing(null)}>
          {!members ? <Spinner fill /> : members.length === 0 ? (
            <div className="empty"><h4>No employees here yet</h4><p>Assign employees to this department from the employee form.</p></div>
          ) : (
            <div className="mini-list" style={{ marginTop: 8 }}>
              {members.map((m) => (
                <div key={m._id}>
                  <Avatar name={m.fullName} src={m.profilePhoto} />
                  <div className="grow"><strong>{m.fullName}</strong><small>{m.employeeId} · {m.designation}</small></div>
                  <StatusBadge status={m.status} />
                  <Link className="btn btn-ghost" to={`/hr/employees/${m._id}`}>View</Link>
                </div>
              ))}
            </div>
          )}
          <div className="modal-actions"><button className="btn btn-primary" onClick={() => setViewing(null)}>Close</button></div>
        </Modal>
      )}
    </>
  );
}
