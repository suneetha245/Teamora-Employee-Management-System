export default function StatCard({ icon: Icon, label, value, tone = '' }) {
  return (
    <div className="card stat">
      <div className={`stat-icon ${tone}`}><Icon size={22} /></div>
      <div><strong>{value}</strong><span>{label}</span></div>
    </div>
  );
}
