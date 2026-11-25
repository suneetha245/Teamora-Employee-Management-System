export default function Spinner({ small = false, fill = false }) {
  const el = <span className={`spinner ${small ? 'sm' : ''}`} role="status" aria-label="Loading" />;
  return fill ? <div className="center-fill">{el}</div> : el;
}
