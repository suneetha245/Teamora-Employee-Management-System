import { Link } from 'react-router-dom';

export default function Logo({ light = false, to = '/' }) {
  return (
    <Link to={to} className={`logo ${light ? 'light' : ''}`} aria-label="Teamora home">
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" aria-hidden="true"><path d="M7 9h18v5h-6.5v11h-5V14H7z" fill="#fff" /></svg>
      </span>
      Teamora
    </Link>
  );
}
