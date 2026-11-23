import { Star, Pill, Syringe, HeartPulse, Leaf, Baby, Thermometer, ShieldPlus, Droplets, Bandage, Activity } from 'lucide-react';
import { X } from 'lucide-react';

const CATEGORY_STYLE = {
  'Pain Relief': ['#f97316', '#fb923c', Thermometer],
  Antibiotics: ['#6366f1', '#818cf8', ShieldPlus],
  Allergy: ['#ec4899', '#f472b6', Leaf],
  Vitamins: ['#eab308', '#facc15', Activity],
  Diabetes: ['#0ea5e9', '#38bdf8', Syringe],
  'Heart & BP': ['#ef4444', '#f87171', HeartPulse],
  Digestive: ['#14b8a6', '#2dd4bf', Droplets],
  'Cold & Flu': ['#3b82f6', '#60a5fa', Thermometer],
  'First Aid': ['#dc2626', '#f87171', Bandage],
  'Baby Care': ['#a855f7', '#c084fc', Baby],
};

export function categoryStyle(cat) {
  return CATEGORY_STYLE[cat] || ['#0d9488', '#2dd4bf', Pill];
}

// Shows the uploaded medicine photo, or a colourful category illustration when there is none.
export function MedImage({ src, category, name, size = 'md' }) {
  const [a, b, Icon] = categoryStyle(category);
  if (src) return <div className={`med-img ${size}`}><img src={src} alt={name} loading="lazy" /></div>;
  return (
    <div className={`med-img ${size} placeholder`} style={{ background: `linear-gradient(135deg, ${a}22, ${b}44)` }}>
      <div className="med-img-icon" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}>
        <Icon size={size === 'lg' ? 56 : size === 'sm' ? 18 : 30} color="#fff" strokeWidth={2} />
      </div>
      {size !== 'sm' && <span className="med-img-label" style={{ color: a }}>{name}</span>}
    </div>
  );
}

export function Stars({ value = 0, size = 14, onChange }) {
  return (
    <span className="stars">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          fill={i <= Math.round(value) ? '#f59e0b' : 'none'}
          color={i <= Math.round(value) ? '#f59e0b' : '#cbd5e1'}
          style={onChange ? { cursor: 'pointer' } : undefined}
          onClick={onChange ? () => onChange(i) : undefined}
        />
      ))}
    </span>
  );
}

export function StatusBadge({ status }) {
  return <span className={`badge status-${status}`}>{String(status).replace(/_/g, ' ')}</span>;
}

export function StockBadge({ qty, threshold = 10 }) {
  if (qty <= 0) return <span className="badge stock-out">Out of stock</span>;
  if (qty <= threshold) return <span className="badge stock-low">Only {qty} left</span>;
  return <span className="badge stock-in">In stock</span>;
}

export function OpenBadge({ open }) {
  return <span className={`badge ${open ? 'open' : 'closed'}`}><i className="dot" />{open ? 'Open now' : 'Closed'}</span>;
}

export function StatCard({ icon: Icon, label, value, sub, tone = 'teal' }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      <div className="stat-icon"><Icon size={22} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function Empty({ icon: Icon = Pill, title, children }) {
  return (
    <div className="empty">
      <div className="empty-icon"><Icon size={32} /></div>
      <h3>{title}</h3>
      {children && <p>{children}</p>}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }) {
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`modal ${wide ? 'wide' : ''}`}>
        <div className="modal-head">
          <h3>{title}</h3>
          <button className="icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function Spinner() {
  return <div className="spinner-wrap"><div className="spinner" /></div>;
}

export function Field({ label, children, hint, full }) {
  return (
    <label className={`field ${full ? 'full' : ''}`}>
      <span>{label}</span>
      {children}
      {hint && <small>{hint}</small>}
    </label>
  );
}
