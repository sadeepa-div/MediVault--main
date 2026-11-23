import { useEffect, useState } from 'react';
import { ChevronDown, Phone, MapPin, User, Landmark, StickyNote } from 'lucide-react';
import { api, money, fmtDateTime, PAYMENT_LABELS } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, Empty, Spinner } from '../../components/ui';

const TABS = ['', 'pending', 'confirmed', 'ready', 'completed', 'cancelled'];
const ACTIONS = { pending: [['confirmed', 'Confirm'], ['cancelled', 'Reject']], confirmed: [['ready', 'Mark ready'], ['cancelled', 'Cancel']], ready: [['completed', 'Complete']] };

export default function OwnerOrders() {
  const { showToast } = useAuth();
  const [tab, setTab] = useState('');
  const [data, setData] = useState(null);
  const [openId, setOpenId] = useState(null);
  const load = () => api(`/owner/orders${tab ? `?status=${tab}` : ''}`).then(setData);
  useEffect(() => { setData(null); load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const act = async (id, body) => {
    try { await api(`/owner/orders/${id}`, { method: 'PATCH', body }); showToast('Order updated'); load(); }
    catch (e) { showToast(e.message, 'error'); }
  };

  return (
    <>
      <div className="page-head"><div><h1>Orders</h1><p className="muted">Confirm, prepare and complete customer orders</p></div></div>
      <div className="tabs">{TABS.map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t || 'All'}</button>)}</div>
      {!data ? <Spinner /> : data.orders.length === 0 ? <Empty title="No orders here" /> : (
        <div className="order-list">
          {data.orders.map((o) => (
            <div key={o.id} className={`card owner-order ${openId === o.id ? 'open' : ''}`}>
              <button className="owner-order-head" onClick={() => setOpenId(openId === o.id ? null : o.id)}>
                <b>#{o.id}</b>
                <span className="grow left"><b>{o.customer_name}</b><span className="muted small"> · {o.items.length} item(s) · {fmtDateTime(o.created_at)}</span></span>
                <span className="muted small hide-sm">{PAYMENT_LABELS[o.payment_method]}</span>
                <StatusBadge status={o.payment_status} />
                <StatusBadge status={o.status} />
                <b>{money(o.total)}</b>
                <ChevronDown size={18} className="chev" />
              </button>
              {openId === o.id && (
                <div className="owner-order-body">
                  <div>
                    <h4>Items</h4>
                    <table className="table compact">
                      <tbody>
                        {o.items.map((i) => <tr key={i.id}><td>{i.medicine_name}</td><td>{i.quantity} × {money(i.unit_price)}</td><td className="right"><b>{money(i.quantity * i.unit_price)}</b></td></tr>)}
                        <tr><td colSpan={2}><b>Total</b></td><td className="right"><b>{money(o.total)}</b></td></tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="shop-lines">
                    <h4>Customer</h4>
                    <span><User size={15} /> {o.customer_name} ({o.customer_email})</span>
                    <a href={`tel:${o.contact_phone}`}><Phone size={15} /> {o.contact_phone}</a>
                    <span><MapPin size={15} /> {o.delivery_address}</span>
                    {o.note && <span><StickyNote size={15} /> {o.note}</span>}
                  </div>
                  <div>
                    <h4>Payment</h4>
                    <div className="sum-line"><span>Method</span><b>{PAYMENT_LABELS[o.payment_method]}</b></div>
                    {o.payment_method === 'bank_transfer' && (
                      <div className="bank-card">
                        <b><Landmark size={15} /> Paid into your account</b>
                        <div className="bank-grid">
                          <span>Bank</span><b>{data.bank.bank_name}</b>
                          <span>Account no.</span><b>{data.bank.bank_account_no}</b>
                          <span>Owner name</span><b>{data.bank.bank_account_name}</b>
                        </div>
                      </div>
                    )}
                    <div className="row gap wrap actions">
                      {(ACTIONS[o.status] || []).map(([s, label]) => (
                        <button key={s} className={`btn sm ${s === 'cancelled' ? 'outline danger-outline' : ''}`} onClick={() => act(o.id, { status: s })}>{label}</button>
                      ))}
                      {o.payment_status === 'unpaid' && o.status !== 'cancelled' && <button className="btn sm outline" onClick={() => act(o.id, { payment_status: 'paid' })}>Mark as paid</button>}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
