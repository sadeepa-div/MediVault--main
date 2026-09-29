import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { USE_MOCK } from '../api.js';
import { useAuth } from '../auth.jsx';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function socialSignIn(provider) {
    if (USE_MOCK) {
      setError(`${provider} sign-in needs a connected backend. Use the demo email and password for now.`);
      return;
    }
    // The backend starts OAuth, verifies the provider and creates the app session.
    window.location.assign(`/api/auth/${provider.toLowerCase()}`);
  }

  return (
    <section className="auth-layout" aria-label="Sign in">
      <aside className="auth-intro">
        <div className="auth-intro-brand"><span className="brand-mark">+</span> MediVault</div>
        <h1>Welcome to MediVault.</h1>
        <p>Manage your pharmacy with confidence.</p>
        <div className="auth-art" aria-hidden="true">
          <svg viewBox="0 0 430 335" role="presentation" focusable="false">
            <defs>
              <linearGradient id="pedestalTop" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#f8fffc"/><stop offset="1" stopColor="#b8e3d7"/></linearGradient>
              <linearGradient id="pedestalSide" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#66af9b"/><stop offset="1" stopColor="#267965"/></linearGradient>
              <linearGradient id="tube" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#244e49"/><stop offset="1" stopColor="#102e2d"/></linearGradient>
              <filter id="artShadow"><feDropShadow dx="0" dy="13" stdDeviation="13" floodColor="#0e584b" floodOpacity=".18"/></filter>
            </defs>
            <ellipse cx="214" cy="293" rx="157" ry="22" fill="#216c5d" opacity=".12"/>
            <g filter="url(#artShadow)">
              <path d="M62 222v42c0 39 68 60 152 60s152-21 152-60v-42" fill="url(#pedestalSide)"/>
              <ellipse cx="214" cy="222" rx="152" ry="54" fill="url(#pedestalTop)"/>
              <path d="M145 234c42-15 91-20 145-12" fill="none" stroke="#83c5b4" strokeWidth="2" opacity=".55"/>
            </g>
            <g fill="none" stroke="url(#tube)" strokeWidth="11" strokeLinecap="round" strokeLinejoin="round">
              <path d="M146 31v89c0 47 20 68 55 68 33 0 54-23 54-68V31"/>
              <path d="M201 188v12c0 37 18 54 49 54 35 0 48-26 49-66"/>
            </g>
            <path d="M146 25v21M255 25v21" stroke="#a5d7c9" strokeWidth="12" strokeLinecap="round"/>
            <circle cx="299" cy="170" r="27" fill="#164f47" filter="url(#artShadow)"/>
            <circle cx="299" cy="170" r="18" fill="#e5f6f0" stroke="#83c8b5" strokeWidth="5"/>
            <circle cx="299" cy="170" r="7" fill="#0f6b5c"/>
          </svg>
        </div>
      </aside>
      <div className="auth-panel">
        <div className="auth-content">
          <span className="auth-eyebrow">MEDIVAULT</span>
          <h2>Sign in</h2>
          <p className="muted">Sign in to manage your pharmacy's stock.</p>
          {USE_MOCK && <div className="notice">Demo mode: use demo@medivault.lk / demo123</div>}
          <form onSubmit={submit}>
            <label>
              Email
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="username" />
            </label>
            <label>
              Password
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" />
            </label>
            {error && <div className="notice notice-error" role="alert">{error}</div>}
            <button className="btn" disabled={busy}>{busy ? 'Signing in...' : 'Sign in'}</button>
          </form>
          <div className="auth-divider"><span>or continue with</span></div>
          <div className="social-actions">
            <button className="btn btn-social" type="button" onClick={() => socialSignIn('Google')}>Continue with Google</button>
            <button className="btn btn-social" type="button" onClick={() => socialSignIn('Facebook')}>Continue with Facebook</button>
          </div>
        </div>
      </div>
    </section>
  );
}
