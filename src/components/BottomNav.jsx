import { NavLink } from 'react-router-dom';
import { Compass, MessageCircle, Navigation, UserRound } from 'lucide-react';

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <NavLink to="/" end><Navigation size={18} /><span>Explore</span></NavLink>
      <NavLink to="/lost-found"><Compass size={18} /><span>Lost & Found</span></NavLink>
      <NavLink to="/assistant"><MessageCircle size={18} /><span>Assistant</span></NavLink>
      <NavLink to="/driver"><UserRound size={18} /><span>Driver</span></NavLink>
    </nav>
  );
}
