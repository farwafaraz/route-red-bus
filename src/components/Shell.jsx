import { useState } from 'react';
import { Logo } from './Logo';
import { BottomNav } from './BottomNav';
import { SideMenu } from './SideMenu';
import { Menu, UserRound } from 'lucide-react';

export function Shell({ children, title, subtitle }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  return (
    <div className="app-shell">
      <header className="topbar">
        <Logo />
        <div className="topbar-title">
          {title && (
            <>
              <span>{title}</span>
              {subtitle && <small>{subtitle}</small>}
            </>
          )}
        </div>
        <div className="topbar-actions">
          <button className="icon-button" aria-label="Passenger profile" onClick={() => setProfileOpen(true)}>
            <UserRound size={20} />
          </button>
          <button className="icon-button" aria-label="Open menu" onClick={() => setMenuOpen(true)}>
            <Menu size={21} />
          </button>
        </div>
      </header>
      {children}
      <BottomNav />
      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
      {profileOpen && (
        <div className="modal-backdrop" onClick={() => setProfileOpen(false)}>
          <div className="profile-card" onClick={(e) => e.stopPropagation()}>
            <div className="profile-icon"><UserRound size={30} /></div>
            <h3>Passenger</h3>
            <p>Guest · Karachi Red Bus</p>
            <button className="primary-button full" onClick={() => setProfileOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
