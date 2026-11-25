import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, KeyRound, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import ConfirmDialog from '../../components/ConfirmDialog';
import Modal from '../../components/Modal';
import ProfileDetails from '../../components/ProfileDetails';
import Spinner from '../../components/Spinner';
import { employeeApi, errMsg } from '../../services/api';

export default function EmployeeProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [confirm, setConfirm] = useState(null); // 'delete' | 'reset'
  const [busy, setBusy] = useState(false);
  const [tempPassword, setTempPassword] = useState('');

  useEffect(() => {
    employeeApi.get(id).then(setEmployee).catch((e) => { toast.error(errMsg(e)); navigate('/hr/employees'); });
  }, [id, navigate]);

  const run = async () => {
    setBusy(true);
    try {
      if (confirm === 'delete') {
        await employeeApi.remove(id);
        toast.success('Employee deleted');
        navigate('/hr/employees');
      } else {
        const r = await employeeApi.resetPassword(id);
        setTempPassword(r.tempPassword);
        setConfirm(null);
      }
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  if (!employee) return <Spinner fill />;

  return (
    <>
      <div className="page-head">
        <div><h1>Employee profile</h1><p>Complete record for {employee.fullName}.</p></div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <Link className="btn btn-ghost" to="/hr/employees"><ArrowLeft size={16} />Back</Link>
          <button className="btn btn-ghost" onClick={() => setConfirm('reset')}><KeyRound size={16} />Reset password</button>
          <Link className="btn btn-primary" to={`/hr/employees/${id}/edit`}><Pencil size={16} />Edit</Link>
          <button className="btn btn-danger" onClick={() => setConfirm('delete')}><Trash2 size={16} />Delete</button>
        </div>
      </div>
      <ProfileDetails employee={employee} />

      {confirm && (
        <ConfirmDialog
          title={confirm === 'delete' ? 'Delete this employee?' : 'Reset password?'}
          message={confirm === 'delete' ? `${employee.fullName} and their login account will be permanently removed.` : `A new temporary password will be generated for ${employee.fullName}. Their current password will stop working.`}
          confirmLabel={confirm === 'delete' ? 'Delete employee' : 'Reset password'} busy={busy} onConfirm={run} onCancel={() => setConfirm(null)}
        />
      )}
      {tempPassword && (
        <Modal title="New temporary password" onClose={() => setTempPassword('')}>
          <p>Share this with {employee.fullName}. It won’t be shown again.</p>
          <div className="cred"><code>{tempPassword}</code></div>
          <div className="modal-actions"><button className="btn btn-primary" onClick={() => setTempPassword('')}>Done</button></div>
        </Modal>
      )}
    </>
  );
}
