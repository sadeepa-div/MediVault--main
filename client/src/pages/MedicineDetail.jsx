import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ShoppingCart, Minus, Plus, Phone, Mail, MapPin, Clock, FileText, Store, Zap } from 'lucide-react';
import { api, money, fmtDate } from '../api';
import { useAuth } from '../context/AuthContext';
import { MedImage, StockBadge, OpenBadge, Stars, Spinner, Empty } from '../components/ui';

export default function MedicineDetail() {
  const { id } = useParams();
  const { user, addToCart, showToast } = useAuth();
  const nav = useNavigate();
  const [m, setM] = useState(null);
  const [qty, setQty] = useState(1);
  const [review, setReview] = useState({ rating: 5, comment: '' });

  const load = () => api(`/medicines/${id}`).then(setM).catch(() => setM(false));
  useEffect(() => { setM(null); setQty(1); load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (m === null) return <Spinner />;
  if (m === false) return <div className="container page"><Empty title="Medicine not found" /></div>;

  const add = async (buyNow) => {
    if (!user) return nav('/login', { state: { from: `/medicines/${id}` } });
    if (user.role !== 'customer') return showToast('Log in as a customer to buy', 'error');
    try {
      await addToCart(m.id, qty);
      if (buyNow) nav('/checkout'); else showToast(`${qty} × ${m.name} added to cart`);
    } catch (e) { showToast(e.message, 'error'); }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await api('/me/feedback', { method: 'POST', body: { pharmacy_id: m.pharmacy_id, medicine_id: m.id, ...review } });
      setReview({ rating: 5, comment: '' });
      showToast('Thanks for your feedback!');
      load();
    } catch (err) { showToast(err.message, 'error'); }
  };

  const avg = m.reviews.length ? m.reviews.reduce((s, r) => s + r.rating, 0) / m.reviews.length : 0;

  return (
    <div className="container page">
      <div className="crumbs"><Link to="/medicines">Medicines</Link> / <Link to={`/medicines?category=${encodeURIComponent(m.category)}`}>{m.category}</Link> / <span>{m.name}</span></div>
      <div className="detail">
        <div className="detail-img card"><MedImage src={m.image_url} category={m.category} name={m.name} size="lg" /></div>
        <div className="detail-info">
          <div className="med-cat">{m.category}</div>
          <h1>{m.name}</h1>
          <p className="muted">{m.generic_name} · {m.dosage} · by {m.manufacturer}</p>
          <div className="detail-rating"><Stars value={avg} /> <span className="muted small">{m.reviews.length} reviews</span></div>
          <div className="detail-price">{money(m.price)} <StockBadge qty={m.stock_qty} threshold={m.low_stock_threshold} /></div>
          {m.requires_prescription ? (
            <div className="notice warn"><FileText size={18} /> Prescription required. The pharmacy will ask to see your prescription before handing over this medicine.</div>
          ) : null}
          <p className="detail-desc">{m.description}</p>
          <div className="buy-row">
            <div className="qty">
              <button onClick={() => setQty(Math.max(1, qty - 1))}><Minus size={16} /></button>
              <span>{qty}</span>
              <button onClick={() => setQty(Math.min(m.stock_qty, qty + 1))}><Plus size={16} /></button>
            </div>
            <button className="btn lg" disabled={m.stock_qty <= 0} onClick={() => add(false)}><ShoppingCart size={18} /> Add to cart</button>
            <button className="btn outline lg" disabled={m.stock_qty <= 0} onClick={() => add(true)}><Zap size={18} /> Buy now</button>
          </div>
          <div className="card shop-box">
            <div className="shop-box-head">
              <span className="pharm-avatar sm"><Store size={18} /></span>
              <div><Link to={`/pharmacies/${m.pharmacy_id}`}><b>{m.pharmacy_name}</b></Link><div><OpenBadge open={m.is_open} /></div></div>
            </div>
            <div className="shop-lines">
              <a href={`tel:${m.pharmacy_phone}`}><Phone size={15} /> {m.pharmacy_phone}</a>
              <span><Mail size={15} /> {m.pharmacy_email}</span>
              <span><MapPin size={15} /> {m.pharmacy_address}</span>
              <span><Clock size={15} /> {m.opening_hours}</span>
            </div>
          </div>
        </div>
      </div>

      {m.alternatives.length > 0 && (
        <section className="section">
          <h2>Also available at</h2>
          <div className="card table-wrap">
            <table className="table">
              <thead><tr><th>Pharmacy</th><th>City</th><th>Contact</th><th>Status</th><th>Availability</th><th>Price</th><th /></tr></thead>
              <tbody>
                {m.alternatives.map((a) => (
                  <tr key={a.id}>
                    <td><b>{a.pharmacy_name}</b></td><td>{a.city}</td><td>{a.pharmacy_phone}</td>
                    <td><OpenBadge open={a.is_open} /></td><td><StockBadge qty={a.stock_qty} /></td>
                    <td><b>{money(a.price)}</b></td>
                    <td><Link className="btn sm outline" to={`/medicines/${a.id}`}>View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="section reviews">
        <h2>Customer feedback</h2>
        <div className="reviews-grid">
          <div>
            {m.reviews.length === 0 && <p className="muted">No reviews yet. Be the first to share your experience.</p>}
            {m.reviews.map((r) => (
              <div key={r.id} className="review card">
                <div className="review-head"><span className="avatar">{r.full_name[0]}</span><div><b>{r.full_name}</b><div className="muted small">{fmtDate(r.created_at)}</div></div><Stars value={r.rating} /></div>
                <p>{r.comment}</p>
              </div>
            ))}
          </div>
          {user?.role === 'customer' ? (
            <form className="card review-form" onSubmit={submitReview}>
              <h3>Add your feedback</h3>
              <Stars value={review.rating} size={26} onChange={(rating) => setReview({ ...review, rating })} />
              <textarea rows={4} placeholder={`How was ${m.name} from ${m.pharmacy_name}?`} value={review.comment} onChange={(e) => setReview({ ...review, comment: e.target.value })} />
              <button className="btn">Submit feedback</button>
            </form>
          ) : (
            <div className="card review-form"><h3>Share your experience</h3><p className="muted"><Link to="/login" className="link">Log in</Link> as a customer to leave feedback.</p></div>
          )}
        </div>
      </section>
    </div>
  );
}
