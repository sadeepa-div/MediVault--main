import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Store } from 'lucide-react';
import { api, money, fmtDateTime, PAYMENT_LABELS } from '../api';
import { StatusBadge, Empty, Spinner } from '../components/ui';

export default function Orders() {
  const [orders, setOrders] = useState(null);
  useEffect(() => { api('/me/orders').then(setOrders); }, []);
  if (!orders) return <Spinner />;
  return (
    <div className="container page narrow">
      <h1>My orders</h1>
      {orders.length === 0 && <Empty icon={Package} title="No orders yet"><Link to="/medicines" className="link">Start shopping</Link></Empty>}
      <div className="order-list">
        {orders.map((o) => (
          <Link key={o.id} to={`/orders/${o.id}`} className="card order-row">
            <span className="order-icon"><Package size={20} /></span>
            <div className="grow">
              <div className="row gap"><b>Order #{o.id}</b><StatusBadge status={o.status} /></div>
              <div className="muted small"><Store size={13} /> {o.pharmacy_name} · {o.item_count} item(s) · {PAYMENT_LABELS[o.payment_method]} · {fmtDateTime(o.created_at)}</div>
            </div>
            <b>{money(o.total)}</b>
            <ChevronRight size={18} className="muted" />
          </Link>
        ))}
      </div>
    </div>
  );
}
