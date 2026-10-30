import { Link } from 'react-router-dom';

export function Logo() {
  return (
    <Link to="/" className="brand">
      <span className="brand-mark">
        <svg viewBox="0 0 36 26" width="34" height="24" className="bus-svg">
          <rect x="1" y="1" width="34" height="19" rx="4" fill="#d62828" />
          <rect x="4" y="4" width="7" height="6" rx="1" fill="#fff" />
          <rect x="13" y="4" width="7" height="6" rx="1" fill="#fff" />
          <rect x="22" y="4" width="7" height="6" rx="1" fill="#fff" />
          <rect x="4" y="13" width="28" height="4" rx="1" fill="#fff" opacity="0.8" />
          <circle cx="10" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" strokeWidth="1.2" />
          <circle cx="26" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" strokeWidth="1.2" />
        </svg>
      </span>
      <span>
        <strong>RoutVia</strong>
        <small>Karachi Red Bus</small>
      </span>
    </Link>
  );
}
