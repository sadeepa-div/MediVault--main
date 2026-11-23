import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Banknote, CreditCard, Landmark, Lock } from 'lucide-react';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { groupByPharmacy } from './Cart';
import { Field } from '../components/ui';

const METHODS = [
  { id: 'cash_on_delivery', label: 'Cash on delivery', desc: 'Pay when your medicine arrives', icon: Banknote },
  { id: 'card', label: 'Credit / debit card', desc: 'Visa, Mastercard, Amex', icon: CreditCard },
  { id: 'bank_transfer', label: 'Bank transfer', desc: "Pay into the pharmacy's bank account", icon: Landmark },
];

export default function Checkout() {
  const { user, cart, setCart, showToast } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ delivery_address: user?.address || '', contact_phone: user?.phone || '', note: '', payment_method: 'cash_on_delivery' });
  const [card, setCard] = useState({ number: '', name: '', exp: '', cvc: '' });
  const [busy, setBusy] = useState(false);
  if (!cart.length) return <Navigate to="/cart" />;
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const groups = groupByPharmacy(cart);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const place = async (e) => {
    e.preventDefault();
    if (form.payment_method === 'card' && card.number.replace(/\s/g, '').length < 12) return showToast('Enter a valid card number', 'error');
    setBusy(true);
    try {
      const { orderIds } = await api('/me/checkout', { method: 'POST', body: form });
      setCart([]);
      showToast('Order placed successfully!');
      nav(orderIds.length === 1 ? `/orders/${orderIds[0]}` : '/orders', { state: { placed: true } });
    } catch (err) { showToast(err.message, 'error'); }
    setBusy(false);
  };

  return (
    <div className="container page">
      <h1>Checkout</h1>
      <form className="cart-layout" onSubmit={place}>
        <div>
          <div className="card form-card">
            <h3>Delivery details</h3>
            <div className="form-grid">
              <Field label="Delivery address" full><input required value={form.delivery_address} onChange={set('delivery_address')} /></Field>
              <Field label="Contact phone"><input required value={form.contact_phone} onChange={set('contact_phone')} /></Field>
              <Field label="Note for pharmacy (optional)"><input value={form.note} onChange={set('note')} placeholder="e.g. call before delivery" /></Field>
            </div>
          </div>
          <div className="card form-card">
            <h3>Payment method</h3>
            <div className="pay-options">
              {METHODS.map(({ id, label, desc, icon: Icon }) => (
                <label key={id} className={`pay-option ${form.payment_method === id ? 'active' : ''}`}>
                  <input type="radio" name="pm" checked={form.payment_method === id} onChange={() => setForm({ ...form, payment_method: id })} />
                  <span className="pay-icon"><Icon size={22} /></span>
                  <span><b>{label}</b><small>{desc}</small></span>
                </label>
              ))}
            </div>
            {form.payment_method === 'card' && (
              <div className="form-grid card-form">
                <Field label="Card number" full><input inputMode="numeric" placeholder="4242 4242 4242 4242" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} /></Field>
                <Field label="Name on card"><input value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></Field>
                <Field label="Expiry"><input placeholder="MM/YY" value={card.exp} onChange={(e) => setCard({ ...card, exp: e.target.value })} /></Field>
                <Field label="CVC"><input placeholder="123" value={card.cvc} onChange={(e) => setCard({ ...card, cvc: e.target.value })} /></Field>
                <p className="muted small full"><Lock size={13} /> Demo mode: no real payment is taken. Connect a payment gateway (e.g. PayHere or Stripe) before going live.</p>
              </div>
            )}
            {form.payment_method === 'bank_transfer' && (
              <div className="bank-list">
                <p className="muted small">After placing the order, transfer the amount to each pharmacy and keep your receipt. The pharmacy marks the order paid once it receives the money.</p>
                {groups.map((g) => (
                  <div key={g.id} className="bank-card">
                    <b>{g.name}</b>
                    <div className="bank-grid">
                      <span>Bank</span><b>{g.bank.bank_name || '—'}</b>
                      <span>Account no.</span><b>{g.bank.bank_account_no || '—'}</b>
                      <span>Account name</span><b>{g.bank.bank_account_name || '—'}</b>
                      <span>Amount</span><b>{money(g.items.reduce((s, i) => s + i.price * i.quantity, 0))}</b>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="card summary">
          <h3>Your order</h3>
          {cart.map((c) => (
            <div key={c.id} className="sum-line"><span>{c.quantity} × {c.name}</span><span>{money(c.price * c.quantity)}</span></div>
          ))}
          <div className="sum-line"><span>Delivery</span><span className="green">Free</span></div>
          <div className="sum-line total"><span>Total</span><span>{money(total)}</span></div>
          <button className="btn lg block" disabled={busy}>{busy ? 'Placing order…' : `Place order · ${money(total)}`}</button>
        </div>
      </form>
    </div>
  );
}
