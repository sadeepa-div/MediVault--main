import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, LogOut, Package, LayoutDashboard, Menu, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';
import NotificationBell from './NotificationBell';

export default function Navbar() {
  const { user, cart, logout } = useAuth();
  const [q, setQ] = useState('');
  const [menu, setMenu] = useState(false);
  const nav = useNavigate();
  const count = cart.reduce((s, c) => s + c.quantity, 0);

  const submit = (e) => {
    e.preventDefault();
    nav(`/medicines?q=${encodeURIComponent(q)}`);
  };

  return (
    <header className="navbar">
      <div className="container nav-inner">
        <Logo />
        <form className="nav-search" onSubmit={submit}>
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines, brands or pharmacies…" />
        </form>
        <nav className={`nav-links ${menu ? 'show' : ''}`} onClick={() => setMenu(false)}>
          <NavLink to="/medicines">Medicines</NavLink>
          <NavLink to="/pharmacies">Pharmacies</NavLink>
          {user?.role === 'customer' && <NavLink to="/orders"><Package size={16} /> My orders</NavLink>}
          {user?.role === 'owner' && <NavLink to="/owner"><LayoutDashboard size={16} /> My pharmacy</NavLink>}
          {user?.role === 'admin' && <NavLink to="/admin"><LayoutDashboard size={16} /> Admin</NavLink>}
          {!user && <NavLink to="/register-pharmacy">For pharmacies</NavLink>}
          {!user && <NavLink to="/login" className="menu-only">Log in</NavLink>}
        </nav>
        <div className="nav-actions">
          {(!user || user.role === 'customer') && (
            <Link to="/cart" className="icon-btn cart-btn" aria-label="Cart">
              <ShoppingCart size={20} />
              {count > 0 && <span className="bell-count">{count}</span>}
            </Link>
          )}
          {user && <NotificationBell />}
          {user ? (
            <div className="user-chip">
              <span className="avatar">{user.photo_url ? <img src={user.photo_url} alt="" /> : user.full_name[0]}</span>
              <span className="user-name">{user.full_name.split(' ')[0]}</span>
              <button className="icon-btn" title="Log out" onClick={() => { logout(); nav('/'); }}><LogOut size={18} /></button>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn ghost sm hide-xs">Log in</Link>
              <Link to="/register" className="btn sm">Sign up</Link>
            </>
          )}
          <button className="icon-btn menu-btn" onClick={() => setMenu(!menu)} aria-label="Menu">{menu ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
    </header>
  );
}
