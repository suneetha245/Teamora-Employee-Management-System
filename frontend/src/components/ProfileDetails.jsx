import Avatar from './Avatar';
import StatusBadge from './StatusBadge';

const fmt = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

export default function ProfileDetails({ employee: e }) {
  const rows = [
    ['Employee ID', e.employeeId],
    ...(Object.prototype.hasOwnProperty.call(e, 'loginPassword') ? [['Password', e.loginPassword || 'Unavailable']] : []),
    ['Full name', e.fullName], ['Email address', e.email], ['Phone number', e.phone],
    ['Department', e.department?.name || '—'], ['Designation', e.designation], ['Date of joining', fmt(e.dateOfJoining)],
    ['Gender', e.gender || '—'],
  ];
  return (
    <div className="card">
      <div className="profile-top">
        <Avatar name={e.fullName} src={e.profilePhoto} large />
        <div>
          <h2>{e.fullName}</h2>
          <p style={{ margin: '0 0 10px', color: 'var(--muted)' }}>{e.designation} · {e.department?.name}</p>
          <StatusBadge status={e.status} />
        </div>
      </div>
      <dl className="detail-grid" style={{ margin: 0 }}>
        {rows.map(([k, v]) => (<div className="detail" key={k}><dt>{k}</dt><dd>{v}</dd></div>))}
      </dl>
    </div>
  );
}
