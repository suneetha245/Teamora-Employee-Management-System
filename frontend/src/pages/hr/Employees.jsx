import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Eye, Pencil, Search, Trash2, UserPlus } from 'lucide-react';
import { toast } from 'react-toastify';
import Avatar from '../../components/Avatar';
import ConfirmDialog from '../../components/ConfirmDialog';
import Pagination from '../../components/Pagination';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import useDebounce from '../../hooks/useDebounce';
import { departmentApi, employeeApi, errMsg } from '../../services/api';
import { STATUSES } from '../../config';

const LIMIT = 10;
const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function Employees() {
  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState(params.get('department') || '');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [departments, setDepartments] = useState([]);
  const [result, setResult] = useState({ data: [], total: 0, pages: 1 });
  const [loading, setLoading] = useState(true);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const q = useDebounce(search);

  useEffect(() => { departmentApi.list().then(setDepartments).catch((e) => toast.error(errMsg(e))); }, []);
  useEffect(() => { setPage(1); }, [q, department, status]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setResult(await employeeApi.list({ search: q, department, status, page, limit: LIMIT }));
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setLoading(false);
    }
  }, [q, department, status, page]);

  useEffect(() => { load(); }, [load]);

  const onDepartment = (v) => {
    setDepartment(v);
    v ? setParams({ department: v }) : setParams({});
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await employeeApi.remove(toDelete._id);
      toast.success(`${toDelete.fullName} was deleted`);
      setToDelete(null);
      // Step back a page if that was the last row on this one.
      if (result.data.length === 1 && page > 1) setPage(page - 1); else load();
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <div className="page-head">
        <div><h1>Employee Management</h1><p>Search, filter and manage every employee record.</p></div>
        <Link className="btn btn-primary" to="/hr/employees/new"><UserPlus size={17} />Add employee</Link>
      </div>

      <div className="card">
        <div className="toolbar">
          <div className="search">
            <Search size={17} />
            <input className="input" placeholder="Search by name, email, ID, phone or designation" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search employees" />
          </div>
          <select className="select" value={department} onChange={(e) => onDepartment(e.target.value)} aria-label="Filter by department">
            <option value="">All departments</option>
            {departments.map((d) => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
          <select className="select" value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>

        {loading && result.data.length === 0 ? <Spinner fill /> : result.data.length === 0 ? (
          <div className="empty">
            <h4>{search || department || status ? 'No employees match these filters' : 'No employees yet'}</h4>
            <p>{search || department || status ? 'Try a different search or clear the filters.' : 'Add your first employee to get started.'}</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ opacity: loading ? 0.6 : 1, transition: 'opacity .15s' }}>
            <table>
              <thead><tr><th>Employee ID</th><th>Employee</th><th>Phone</th><th>Department</th><th>Designation</th><th>Joined</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
              <tbody>
                {result.data.map((e) => (
                  <tr key={e._id}>
                    <td><b style={{ color: 'var(--navy)' }}>{e.employeeId}</b></td>
                    <td><div className="person"><Avatar name={e.fullName} src={e.profilePhoto} /><div><strong>{e.fullName}</strong><span>{e.email}</span></div></div></td>
                    <td style={{ whiteSpace: 'nowrap' }}>{e.phone}</td>
                    <td>{e.department?.name}</td>
                    <td>{e.designation}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{fmt(e.dateOfJoining)}</td>
                    <td><StatusBadge status={e.status} /></td>
                    <td>
                      <div className="actions">
                        <Link className="icon-btn" to={`/hr/employees/${e._id}`} aria-label={`View ${e.fullName}`} title="View profile"><Eye size={17} /></Link>
                        <Link className="icon-btn" to={`/hr/employees/${e._id}/edit`} aria-label={`Edit ${e.fullName}`} title="Edit"><Pencil size={17} /></Link>
                        <button className="icon-btn danger" onClick={() => setToDelete(e)} aria-label={`Delete ${e.fullName}`} title="Delete"><Trash2 size={17} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <Pagination page={page} pages={result.pages} total={result.total} limit={LIMIT} onChange={setPage} />
      </div>

      {toDelete && (
        <ConfirmDialog
          title="Delete this employee?"
          message={`${toDelete.fullName} (${toDelete.employeeId}) and their login account will be permanently removed. This can’t be undone.`}
          confirmLabel="Delete employee" busy={deleting} onConfirm={confirmDelete} onCancel={() => setToDelete(null)}
        />
      )}
    </>
  );
}
