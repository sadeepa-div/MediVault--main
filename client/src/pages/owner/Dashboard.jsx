import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingBag, Clock, Star, AlertTriangle, PackageX } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { api, fillDays, money, shortMoney, PAYMENT_LABELS } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatCard, Spinner } from '../../components/ui';

export const CHART_COLORS = ['#0d9488', '#6366f1', '#f59e0b', '#ec4899', '#0ea5e9', '#84cc16', '#ef4444', '#a855f7'];
const dayLabel = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export function RangePicker({ days, setDays }) {
  return (
    <div className="segmented">
      {[7, 30, 90].map((d) => <button key={d} className={days === d ? 'active' : ''} onClick={() => setDays(d)}>{d} days</button>)}
    </div>
  );
}

export function ShopToggle({ open, onChange }) {
  return (
    <button className={`shop-toggle ${open ? 'on' : ''}`} onClick={() => onChange(!open)}>
      <span className="knob" /> {open ? 'Shop is open' : 'Shop is closed'}
    </button>
  );
}

export default function OwnerDashboard() {
  const { showToast } = useAuth();
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  useEffect(() => { api(`/owner/analytics?days=${days}`).then(setD); }, [days]);
  if (!d) return <Spinner />;

  const toggle = async (is_open) => {
    await api('/owner/shop-status', { method: 'PATCH', body: { is_open } });
    setD({ ...d, is_open });
    showToast(is_open ? 'Your shop is now open' : 'Your shop is now closed');
  };

  return (
    <>
      <div className="page-head">
        <div><h1>{d.pharmacy_name}</h1><p className="muted">Sales analysis and shop overview</p></div>
        <div className="row gap"><ShopToggle open={!!d.is_open} onChange={toggle} /><RangePicker days={days} setDays={setDays} /></div>
      </div>
      <div className="stat-grid">
        <StatCard icon={Wallet} label="Revenue" value={money(d.summary.revenue)} sub={`Last ${days} days`} />
        <StatCard icon={ShoppingBag} label="Orders" value={d.summary.orders} sub={`Avg ${money(d.summary.avg_order)}`} tone="indigo" />
        <StatCard icon={Clock} label="Pending orders" value={d.summary.pending || 0} sub={<Link to="/owner/orders" className="link">Review now</Link>} tone="amber" />
        <StatCard icon={Star} label="Rating" value={d.rating.avg || '—'} sub={`${d.rating.count} reviews`} tone="pink" />
      </div>
      {(d.stock.low_stock > 0 || d.stock.out_of_stock > 0) && (
        <div className="notice warn">
          <AlertTriangle size={18} /> {d.stock.low_stock || 0} medicine(s) running low and {d.stock.out_of_stock || 0} out of stock. <Link to="/owner/inventory" className="link">Open inventory</Link>
        </div>
      )}
      <div className="chart-grid">
        <div className="card chart-card span-2">
          <h3>Daily revenue</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fillDays(d.daily, days)}>
              <defs><linearGradient id="rev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0d9488" stopOpacity={0.35} /><stop offset="1" stopColor="#0d9488" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tickFormatter={dayLabel} fontSize={12} stroke="#94a3b8" />
              <YAxis tickFormatter={shortMoney} fontSize={12} stroke="#94a3b8" width={70} />
              <Tooltip formatter={(v) => money(v)} labelFormatter={dayLabel} />
              <Area type="monotoneX" dataKey="revenue" stroke="#0d9488" strokeWidth={2.5} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Payment methods</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.byPayment.map((p) => ({ ...p, name: PAYMENT_LABELS[p.payment_method] }))} dataKey="revenue" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                {d.byPayment.map((_, i) => <Cell key={i} fill={CHART_COLORS[i]} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">{d.byPayment.map((p, i) => <span key={p.payment_method}><i style={{ background: CHART_COLORS[i] }} />{PAYMENT_LABELS[p.payment_method]} · {p.orders}</span>)}</div>
        </div>
        <div className="card chart-card span-3">
          <h3>Best-selling medicines</h3>
          <ResponsiveContainer width="100%" height={Math.max(200, d.top.length * 38)}>
            <BarChart data={d.top} layout="vertical" margin={{ left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" tickFormatter={shortMoney} fontSize={12} stroke="#94a3b8" />
              <YAxis type="category" dataKey="name" width={130} fontSize={12} stroke="#64748b" />
              <Tooltip formatter={(v, n) => (n === 'revenue' ? money(v) : v)} />
              <Bar dataKey="revenue" fill="#0d9488" radius={[0, 6, 6, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="stat-grid three">
        <StatCard icon={PackageX} label="Medicines listed" value={d.stock.total} tone="indigo" />
        <StatCard icon={AlertTriangle} label="Low stock" value={d.stock.low_stock || 0} tone="amber" />
        <StatCard icon={PackageX} label="Out of stock" value={d.stock.out_of_stock || 0} tone="red" />
      </div>
    </>
  );
}
