import { useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { CheckCircle2, Store, Phone, MapPin, Landmark } from 'lucide-react';
import { api, money, fmtDateTime, PAYMENT_LABELS } from '../api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, MedImage, Spinner, Stars } from '../components/ui';

const STEPS = ['pending', 'confirmed', 'ready', 'completed'];

export default function OrderDetail() {
  const { id } = useParams();
  const { state } = useLocation();
  const { showToast } = useAuth();
  const [o, setO] = useState(null);
  const [fb, setFb] = useState({ rating: 5, comment: '', sent: false });
  const load = () => api(`/me/orders/${id}`).then(setO);
  useEffect(() => { load(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!o) return <Spinner />;

  const cancel = async () => {
    try { await api(`/me/orders/${o.id}/cancel`, { method: 'PATCH' }); showToast('Order cancelled'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  };
  const sendFb = async (e) => {
    e.preventDefault();
    await api('/me/feedback', { method: 'POST', body: { pharmacy_id: o.pharmacy_id, rating: fb.rating, comment: fb.comment } });
    setFb({ ...fb, sent: true });
    showToast('Thanks for your feedback!');
  };
  const step = STEPS.indexOf(o.status);

  return (
    <div className="container page narrow">
      {state?.placed && <div className="notice success"><CheckCircle2 size={20} /> Your order was placed. {o.pharmacy_name} has been notified.</div>}
      <div className="page-head">
        <div><Link to="/orders" className="link small">← My orders</Link><h1>Order #{o.id}</h1><p className="muted">Placed {fmtDateTime(o.created_at)}</p></div>
        <StatusBadge status={o.status} />
      </div>
      {o.status !== 'cancelled' && (
        <div className="card tracker">
          {STEPS.map((s, i) => (
            <div key={s} className={`track-step ${i <= step ? 'done' : ''} ${i < step ? 'line-done' : ''}`}><span className="track-dot">{i + 1}</span><span>{s}</span></div>
          ))}
        </div>
      )}
      <div className="order-detail-grid">
        <div className="card">
          <h3>Items</h3>
          {o.items.map((i) => (
            <div key={i.id} className="cart-row">
              <MedImage src={i.image_url} category={i.category} name={i.medicine_name} size="sm" />
              <div className="cart-row-info"><b>{i.medicine_name}</b><div className="muted small">{i.quantity} × {money(i.unit_price)}</div></div>
              <b>{money(i.quantity * i.unit_price)}</b>
            </div>
          ))}
          <div className="sum-line total"><span>Total</span><span>{money(o.total)}</span></div>
          {o.status === 'pending' && <button className="btn outline danger-outline" onClick={cancel}>Cancel order</button>}
        </div>
        <div className="stack">
          <div className="card">
            <h3>Pharmacy</h3>
            <div className="shop-lines">
              <span><Store size={15} /> <b>{o.pharmacy_name}</b></span>
              <a href={`tel:${o.pharmacy_phone}`}><Phone size={15} /> {o.pharmacy_phone}</a>
              <span><MapPin size={15} /> {o.pharmacy_address}</span>
            </div>
          </div>
          <div className="card">
            <h3>Payment</h3>
            <div className="sum-line"><span>Method</span><b>{PAYMENT_LABELS[o.payment_method]}</b></div>
            <div className="sum-line"><span>Status</span><StatusBadge status={o.payment_status} /></div>
            {o.payment_method === 'bank_transfer' && (
              <div className="bank-card">
                <b><Landmark size={15} /> Transfer to</b>
                <div className="bank-grid">
                  <span>Bank</span><b>{o.bank_name}</b>
                  <span>Account no.</span><b>{o.bank_account_no}</b>
                  <span>Account name</span><b>{o.bank_account_name}</b>
                </div>
              </div>
            )}
            <div className="sum-line"><span>Deliver to</span><span className="right">{o.delivery_address}</span></div>
          </div>
          {o.status === 'completed' && (
            <form className="card" onSubmit={sendFb}>
              <h3>Rate this pharmacy</h3>
              {fb.sent ? <p className="green">Thanks! Your feedback was sent.</p> : (
                <>
                  <Stars value={fb.rating} size={24} onChange={(rating) => setFb({ ...fb, rating })} />
                  <textarea rows={3} placeholder="Tell others about your experience" value={fb.comment} onChange={(e) => setFb({ ...fb, comment: e.target.value })} />
                  <button className="btn">Send feedback</button>
                </>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
