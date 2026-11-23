import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, Lock, ShieldCheck, Store, ShoppingBag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      const u = await login(form.username, form.password);
      nav(state?.from || (u.role === 'owner' ? '/owner' : u.role === 'admin' ? '/admin' : '/'));
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  const demo = (username, password) => setForm({ username, password });

  return (
    <div className="auth">
      <div className="auth-art">
        <Logo light />
        <h2>Welcome back.</h2>
        <p>One login for customers, pharmacy owners and admins.</p>
        <ul>
          <li><ShoppingBag size={18} /> Customers: search, order and track medicine</li>
          <li><Store size={18} /> Owners: manage orders, inventory and sales</li>
          <li><ShieldCheck size={18} /> Admins: approve pharmacies and view analytics</li>
        </ul>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <h1>Log in</h1>
          <p className="muted">Enter your username or email and password.</p>
          {error && <div className="notice error">{error}</div>}
          <label className="input-icon"><User size={18} /><input placeholder="Username or email" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} required /></label>
          <label className="input-icon"><Lock size={18} /><input type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></label>
          <button className="btn lg block" disabled={busy}>{busy ? 'Logging in…' : 'Log in'}</button>
          <p className="muted small center">New here? <Link className="link" to="/register">Create a customer account</Link> or <Link className="link" to="/register-pharmacy">register a pharmacy</Link></p>
          <div className="demo">
            <span>Demo accounts</span>
            <button type="button" onClick={() => demo('nimal', 'user123')}>Customer</button>
            <button type="button" onClick={() => demo('cityhealth', 'owner123')}>Pharmacy owner</button>
            <button type="button" onClick={() => demo('admin', 'admin123')}>Admin</button>
          </div>
        </form>
      </div>
    </div>
  );
}
