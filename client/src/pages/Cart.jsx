import { Link, useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingCart, Store, ArrowRight } from 'lucide-react';
import { api, money } from '../api';
import { useAuth } from '../context/AuthContext';
import { MedImage, Empty, OpenBadge } from '../components/ui';

export function groupByPharmacy(cart) {
  const groups = {};
  for (const c of cart) (groups[c.pharmacy_id] ||= { id: c.pharmacy_id, name: c.pharmacy_name, is_open: c.is_open, bank: c, items: [] }).items.push(c);
  return Object.values(groups);
}

export default function Cart() {
  const { user, cart, setCart } = useAuth();
  const nav = useNavigate();
  if (!user) return <div className="container page"><Empty icon={ShoppingCart} title="Your cart is waiting">Please <Link className="link" to="/login" state={{ from: '/cart' }}>log in</Link> to add medicines to your cart.</Empty></div>;
  if (!cart.length) return <div className="container page"><Empty icon={ShoppingCart} title="Your cart is empty"><Link className="link" to="/medicines">Find medicines</Link></Empty></div>;

  const update = async (id, quantity) => setCart(await api(`/me/cart/${id}`, { method: 'PATCH', body: { quantity } }));
  const remove = async (id) => setCart(await api(`/me/cart/${id}`, { method: 'DELETE' }));
  const total = cart.reduce((s, c) => s + c.price * c.quantity, 0);
  const groups = groupByPharmacy(cart);

  return (
    <div className="container page">
      <h1>Shopping cart</h1>
      <div className="cart-layout">
        <div>
          {groups.map((g) => (
            <div key={g.id} className="card cart-group">
              <div className="cart-group-head"><Store size={18} /> <b>{g.name}</b> <OpenBadge open={g.is_open} /></div>
              {g.items.map((c) => (
                <div key={c.id} className="cart-row">
                  <MedImage src={c.image_url} category={c.category} name={c.name} size="sm" />
                  <div className="cart-row-info">
                    <Link to={`/medicines/${c.medicine_id}`}><b>{c.name}</b></Link>
                    <div className="muted small">{money(c.price)} each · {c.stock_qty} available</div>
                  </div>
                  <div className="qty sm">
                    <button onClick={() => update(c.id, Math.max(1, c.quantity - 1))}><Minus size={14} /></button>
                    <span>{c.quantity}</span>
                    <button onClick={() => update(c.id, Math.min(c.stock_qty, c.quantity + 1))}><Plus size={14} /></button>
                  </div>
                  <b className="cart-line-total">{money(c.price * c.quantity)}</b>
                  <button className="icon-btn danger" onClick={() => remove(c.id)} aria-label="Remove"><Trash2 size={17} /></button>
                </div>
              ))}
            </div>
          ))}
        </div>
        <div className="card summary">
          <h3>Order summary</h3>
          <div className="sum-line"><span>Items</span><span>{cart.reduce((s, c) => s + c.quantity, 0)}</span></div>
          <div className="sum-line"><span>Pharmacies</span><span>{groups.length}</span></div>
          <div className="sum-line"><span>Delivery</span><span className="green">Free</span></div>
          <div className="sum-line total"><span>Total</span><span>{money(total)}</span></div>
          {groups.length > 1 && <p className="muted small">Your items come from {groups.length} pharmacies, so you will get {groups.length} separate orders.</p>}
          <button className="btn lg block" onClick={() => nav('/checkout')}>Checkout <ArrowRight size={18} /></button>
        </div>
      </div>
    </div>
  );
}
