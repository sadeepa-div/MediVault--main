import { Link } from 'react-router-dom';

export default function Logo({ light, to = '/' }) {
  return (
    <Link to={to} className={`logo ${light ? 'light' : ''}`}>
      <span className="logo-mark">
        <svg viewBox="0 0 32 32" width="30" height="30"><rect width="32" height="32" rx="9" fill="url(#lg)" /><path d="M13 8h6v5h5v6h-5v5h-6v-5H8v-6h5z" fill="#fff" /><defs><linearGradient id="lg" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#14b8a6" /><stop offset="1" stopColor="#0f766e" /></linearGradient></defs></svg>
      </span>
      <span className="logo-text">Medi<b>_vault</b></span>
    </Link>
  );
}
