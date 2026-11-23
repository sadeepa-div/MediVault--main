import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { Field } from '../components/ui';

export default function Register() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [f, setF] = useState({ full_name: '', username: '', email: '', phone: '', address: '', password: '' });
  const [error, setError] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const submit = async (e) => {
    e.preventDefault();
    try { await register(f); nav('/'); } catch (err) { setError(err.message); }
  };
  return (
    <div className="auth">
      <div className="auth-art">
        <Logo light />
        <h2>Medicine made simple.</h2>
        <p>Create a free account to order from verified pharmacies and track every order.</p>
      </div>
      <div className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit}>
          <h1>Create account</h1>
          {error && <div className="notice error">{error}</div>}
          <div className="form-grid">
            <Field label="Full name" full><input required value={f.full_name} onChange={set('full_name')} /></Field>
            <Field label="Username"><input required value={f.username} onChange={set('username')} /></Field>
            <Field label="Email"><input type="email" required value={f.email} onChange={set('email')} /></Field>
            <Field label="Phone"><input value={f.phone} onChange={set('phone')} /></Field>
            <Field label="Password"><input type="password" minLength={6} required value={f.password} onChange={set('password')} /></Field>
            <Field label="Delivery address" full><input value={f.address} onChange={set('address')} /></Field>
          </div>
          <button className="btn lg block">Create account</button>
          <p className="muted small center">Already have an account? <Link className="link" to="/login">Log in</Link></p>
        </form>
      </div>
    </div>
  );
}
