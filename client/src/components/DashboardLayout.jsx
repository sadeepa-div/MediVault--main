import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LogOut, Store } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

export default function DashboardLayout({ links, title }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  return (
    <div className="dash">
      <aside className="dash-side">
        <Logo light />
        <div className="dash-role">{title}</div>
        <nav>
          {links.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}><Icon size={18} /> {label}</NavLink>
          ))}
        </nav>
        <div className="dash-side-foot">
          <NavLink to="/"><Store size={18} /> View shop</NavLink>
          <button onClick={() => { logout(); nav('/'); }}><LogOut size={18} /> Log out</button>
        </div>
      </aside>
      <div className="dash-main">
        <div className="dash-top">
          <div className="dash-mobile-nav">
            {links.map(({ to, label, end }) => <NavLink key={to} to={to} end={end}>{label}</NavLink>)}
          </div>
          <div className="dash-top-right">
            <NotificationBell />
            <div className="user-chip">
              <span className="avatar">{user.photo_url ? <img src={user.photo_url} alt="" /> : user.full_name[0]}</span>
              <span className="user-name">{user.full_name}</span>
            </div>
          </div>
        </div>
        <div className="dash-content"><Outlet /></div>
      </div>
    </div>
  );
}
