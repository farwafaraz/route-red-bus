import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, MessageCircle, UserRound, Info, X } from 'lucide-react';

export function SideMenu({ open, onClose }) {
  const location = useLocation();
  if (!open) return null;

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/lost-found', label: 'Lost & Found', icon: Compass },
    { to: '/assistant', label: 'Assistant', icon: MessageCircle },
    { to: '/driver', label: 'Driver Panel', icon: UserRound },
  ];

  return (
    <>
      <div className="menu-overlay" onClick={onClose} />
      <aside className="side-menu">
        <div className="side-menu-header">
          <span className="brand">
            <svg viewBox="0 0 36 26" width="34" height="24">
              <rect x="1" y="1" width="34" height="19" rx="4" fill="#d62828" />
              <rect x="4" y="4" width="7" height="6" rx="1" fill="#fff" />
              <rect x="13" y="4" width="7" height="6" rx="1" fill="#fff" />
              <rect x="22" y="4" width="7" height="6" rx="1" fill="#fff" />
              <rect x="4" y="13" width="28" height="4" rx="1" fill="#fff" opacity="0.8" />
              <circle cx="10" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" strokeWidth="1.2" />
              <circle cx="26" cy="22" r="3.5" fill="#1a1a2e" stroke="#fff" strokeWidth="1.2" />
            </svg>
            <span>
              <strong>RoutVia</strong>
              <small>Karachi Red Bus</small>
            </span>
          </span>
          <button className="icon-button light" onClick={onClose} aria-label="Close menu">
            <X size={19} />
          </button>
        </div>
        <nav className="side-menu-links">
          {links.map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className={`side-menu-link ${location.pathname === to ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={19} />
              <span>{label}</span>
            </Link>
          ))}
          <Link
            to="/about"
            className="side-menu-link"
            onClick={onClose}
          >
            <Info size={19} />
            <span>About RoutVia</span>
          </Link>
        </nav>
        <div className="side-menu-footer">
          <p>Adaptive Smart Mobile App for Tracking and Monitoring of Public Transport</p>
        </div>
      </aside>
    </>
  );
}
