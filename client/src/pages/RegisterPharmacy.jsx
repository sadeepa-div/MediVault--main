import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, BarChart3, Boxes, Bell } from 'lucide-react';
import { api } from '../api';
import Logo from '../components/Logo';
import { Field } from '../components/ui';

export default function RegisterPharmacy() {
  const [f, setF] = useState({
    full_name: '', email: '', phone: '', birthday: '', id_no: '', address: '',
    pharmacy_name: '', license_no: '', pharmacy_address: '', city: '', username: '', password: '',
  });
  const [error, setError] = useState('');
  const [done, setDone] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    setError('');
    try { const r = await api('/auth/register-owner', { method: 'POST', body: f }); setDone(r.message); window.scrollTo(0, 0); }
    catch (err) { setError(err.message); }
  };
  return (
    <div className="auth">
      <div className="auth-art">
        <Logo light />
        <h2>Grow your pharmacy online.</h2>
        <p>Sign up and our admin team will verify your pharmacy licence before your account goes live.</p>
        <ul>
          <li><Boxes size={18} /> Manage medicines and inventory</li>
          <li><Bell size={18} /> Instant order and feedback alerts</li>
          <li><BarChart3 size={18} /> Sales analysis dashboard</li>
        </ul>
      </div>
      <div className="auth-form-wrap">
        {done ? (
          <div className="auth-form center">
            <CheckCircle2 size={56} className="green" />
            <h1>Application submitted</h1>
            <p className="muted">{done}</p>
            <Link className="btn lg" to="/login">Back to login</Link>
          </div>
        ) : (
          <form className="auth-form wide" onSubmit={submit}>
            <h1>Register your pharmacy</h1>
            {error && <div className="notice error">{error}</div>}
            <h4 className="form-section">Owner details</h4>
            <div className="form-grid">
              <Field label="Full name"><input required value={f.full_name} onChange={set('full_name')} /></Field>
              <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} /></Field>
              <Field label="Phone number"><input required value={f.phone} onChange={set('phone')} /></Field>
              <Field label="Birthday"><input type="date" required value={f.birthday} onChange={set('birthday')} /></Field>
              <Field label="ID number (NIC)"><input required value={f.id_no} onChange={set('id_no')} /></Field>
              <Field label="Home address"><input required value={f.address} onChange={set('address')} /></Field>
            </div>
            <h4 className="form-section">Pharmacy details</h4>
            <div className="form-grid">
              <Field label="Pharmacy name"><input required value={f.pharmacy_name} onChange={set('pharmacy_name')} /></Field>
              <Field label="Pharmacy licence / valid ID no."><input required value={f.license_no} onChange={set('license_no')} placeholder="e.g. PH-COL-2024-0001" /></Field>
              <Field label="Pharmacy address"><input value={f.pharmacy_address} onChange={set('pharmacy_address')} placeholder="Same as home if empty" /></Field>
              <Field label="City"><input value={f.city} onChange={set('city')} /></Field>
            </div>
            <h4 className="form-section">Login details</h4>
            <div className="form-grid">
              <Field label="Username"><input required value={f.username} onChange={set('username')} /></Field>
              <Field label="Password"><input type="password" minLength={6} required value={f.password} onChange={set('password')} /></Field>
            </div>
            <button className="btn lg block">Submit for approval</button>
            <p className="muted small center">Already approved? <Link className="link" to="/login">Log in</Link></p>
          </form>
        )}
      </div>
    </div>
  );
}
