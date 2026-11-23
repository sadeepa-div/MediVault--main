import { Link } from 'react-router-dom';
import { ShoppingCart, Phone, Store, FileText } from 'lucide-react';
import { money } from '../api';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MedImage, StockBadge } from './ui';

export default function MedicineCard({ m }) {
  const { user, addToCart, showToast } = useAuth();
  const nav = useNavigate();
  const add = async (e) => {
    e.preventDefault();
    if (!user) return nav('/login', { state: { from: `/medicines/${m.id}` } });
    if (user.role !== 'customer') return showToast('Log in as a customer to buy', 'error');
    try {
      await addToCart(m.id, 1);
      showToast(`${m.name} added to cart`);
    } catch (err) { showToast(err.message, 'error'); }
  };
  return (
    <Link to={`/medicines/${m.id}`} className="med-card">
      <div className="med-card-img">
        <MedImage src={m.image_url} category={m.category} name={m.name} />
        {m.requires_prescription ? <span className="rx-tag"><FileText size={12} /> Rx</span> : null}
      </div>
      <div className="med-card-body">
        <div className="med-cat">{m.category}</div>
        <h3>{m.name}</h3>
        <div className="med-generic">{m.generic_name} · {m.dosage}</div>
        <div className="med-pharmacy"><Store size={14} /> {m.pharmacy_name}{m.city ? `, ${m.city}` : ''}</div>
        <div className="med-pharmacy"><Phone size={14} /> {m.pharmacy_phone}</div>
        <div className="med-card-foot">
          <div>
            <div className="price">{money(m.price)}</div>
            <StockBadge qty={m.stock_qty} threshold={m.low_stock_threshold} />
          </div>
          <button className="btn round" disabled={m.stock_qty <= 0} onClick={add} aria-label="Add to cart">
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </Link>
  );
}
