import { useEffect, useState } from 'react';
import { Download, Share2 } from 'lucide-react';
import { toast } from 'react-toastify';
import Spinner from '../../components/Spinner';
import StatusBadge from '../../components/StatusBadge';
import { departmentApi, errMsg, reportApi } from '../../services/api';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const XLSX_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

export default function Reports() {
  const [departments, setDepartments] = useState([]);
  const [department, setDepartment] = useState('all');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState('');

  useEffect(() => { departmentApi.list().then(setDepartments).catch((e) => toast.error(errMsg(e))); }, []);

  useEffect(() => {
    setLoading(true);
    reportApi.employees(department).then(setReport).catch((e) => toast.error(errMsg(e))).finally(() => setLoading(false));
  }, [department]);

  const build = async () => {
    const { blob, filename } = await reportApi.exportXlsx(department);
    return new File([blob], filename, { type: XLSX_TYPE });
  };

  const download = async () => {
    setBusy('download');
    try {
      const file = await build();
      const url = URL.createObjectURL(file);
      const a = Object.assign(document.createElement('a'), { href: url, download: file.name });
      document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
      toast.success('Excel file downloaded');
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  const share = async () => {
    setBusy('share');
    try {
      const file = await build();
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: 'Teamora employee report' });
      } else {
        toast.info('Sharing isn’t supported in this browser. Download the file and share it from there.');
      }
    } catch (e) {
      if (e.name !== 'AbortError') toast.error(errMsg(e));
    } finally {
      setBusy('');
    }
  };

  return (
    <>
      <div className="page-head"><div><h1>Reports & Export</h1><p>Preview employee data and export it to Excel.</p></div></div>

      <div className="card">
        <div className="toolbar" style={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
            <select className="select" value={department} onChange={(e) => setDepartment(e.target.value)} aria-label="Department to export">
              <option value="all">All departments</option>
              {departments.map((d) => <option key={d._id} value={d._id}>{d.name} ({d.employeeCount})</option>)}
            </select>
            <span className="hint">{report ? `${report.total} employee${report.total === 1 ? '' : 's'}` : ''}</span>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button className="btn btn-ghost" onClick={share} disabled={!!busy || !report?.total}>{busy === 'share' ? <Spinner small /> : <Share2 size={16} />}Share</button>
            <button className="btn btn-primary" onClick={download} disabled={!!busy || !report?.total}>{busy === 'download' ? <Spinner small /> : <Download size={16} />}Download Excel</button>
          </div>
        </div>
        {department === 'all' && <p className="notice" style={{ marginBottom: 18 }}>Exporting all departments creates one workbook with an “All Employees” sheet plus a separate sheet for each department.</p>}

        {loading ? <Spinner fill /> : !report?.total ? (
          <div className="empty"><h4>Nothing to export</h4><p>This department has no employees yet.</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Employee ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Department</th><th>Designation</th><th>Joining date</th><th>Status</th></tr></thead>
              <tbody>
                {report.data.map((e) => (
                  <tr key={e._id}>
                    <td><b style={{ color: 'var(--navy)' }}>{e.employeeId}</b></td><td>{e.fullName}</td><td>{e.email}</td><td style={{ whiteSpace: 'nowrap' }}>{e.phone}</td>
                    <td>{e.department?.name}</td><td>{e.designation}</td><td style={{ whiteSpace: 'nowrap' }}>{fmt(e.dateOfJoining)}</td><td><StatusBadge status={e.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
