import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Wallet, ShoppingBag, Store, Users, Pill, UserCheck } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { api, fillDays, money, shortMoney } from '../../api';
import { StatCard, Spinner } from '../../components/ui';
import { RangePicker, CHART_COLORS } from '../owner/Dashboard';

const dayLabel = (d) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });

export default function AdminDashboard() {
  const [days, setDays] = useState(30);
  const [d, setD] = useState(null);
  useEffect(() => { api(`/admin/analytics?days=${days}`).then(setD); }, [days]);
  if (!d) return <Spinner />;
  const s = d.summary;
  return (
    <>
      <div className="page-head">
        <div><h1>Overall sales analysis</h1><p className="muted">All medicine sales across every pharmacy</p></div>
        <RangePicker days={days} setDays={setDays} />
      </div>
      {s.pending_owners > 0 && (
        <div className="notice info"><UserCheck size={18} /> {s.pending_owners} pharmacy owner(s) waiting for approval. <Link to="/admin/approvals" className="link">Review now</Link></div>
      )}
      <div className="stat-grid">
        <StatCard icon={Wallet} label="Total revenue" value={money(s.revenue)} sub={`Last ${days} days`} />
        <StatCard icon={ShoppingBag} label="Orders" value={s.orders} sub={`Avg ${money(s.avg_order)}`} tone="indigo" />
        <StatCard icon={Store} label="Active pharmacies" value={s.pharmacies} sub={`${s.medicines} medicines listed`} tone="amber" />
        <StatCard icon={Users} label="Customers" value={s.customers} tone="pink" />
      </div>
      <div className="chart-grid">
        <div className="card chart-card span-2">
          <h3>Daily sales, all pharmacies</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={fillDays(d.daily, days)}>
              <defs><linearGradient id="arev" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6366f1" stopOpacity={0.35} /><stop offset="1" stopColor="#6366f1" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="day" tickFormatter={dayLabel} fontSize={12} stroke="#94a3b8" />
              <YAxis tickFormatter={shortMoney} fontSize={12} stroke="#94a3b8" width={70} />
              <Tooltip formatter={(v) => money(v)} labelFormatter={dayLabel} />
              <Area type="monotoneX" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#arev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Sales by category</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={d.byCategory} dataKey="revenue" nameKey="category" innerRadius={55} outerRadius={85} paddingAngle={2}>
                {d.byCategory.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v) => money(v)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend">{d.byCategory.map((c, i) => <span key={c.category}><i style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />{c.category}</span>)}</div>
        </div>
        <div className="card chart-card span-2">
          <h3>Revenue by pharmacy</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={d.byPharmacy}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="name" fontSize={12} stroke="#64748b" />
              <YAxis tickFormatter={shortMoney} fontSize={12} stroke="#94a3b8" width={70} />
              <Tooltip formatter={(v, n) => (n === 'revenue' ? money(v) : v)} />
              <Bar dataKey="revenue" radius={[8, 8, 0, 0]}>{d.byPharmacy.map((_, i) => <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />)}</Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card chart-card">
          <h3>Pharmacy leaderboard</h3>
          <div className="leader">
            {d.byPharmacy.map((p, i) => (
              <div key={p.name} className="leader-row"><span className="rank">{i + 1}</span><div className="grow"><b>{p.name}</b><div className="muted small">{p.city} · {p.orders} orders</div></div><b>{shortMoney(p.revenue)}</b></div>
            ))}
          </div>
        </div>
      </div>
      <div className="card table-wrap">
        <h3 className="pad">Top-selling medicines</h3>
        <table className="table">
          <thead><tr><th>#</th><th>Medicine</th><th>Units sold</th><th>Sold at</th><th>Revenue</th><th>Share</th></tr></thead>
          <tbody>
            {d.topMedicines.map((m, i) => (
              <tr key={m.name}>
                <td>{i + 1}</td><td><Pill size={14} className="teal" /> <b>{m.name}</b></td><td>{Number(m.units).toLocaleString()}</td>
                <td>{m.pharmacies} {m.pharmacies === 1 ? 'pharmacy' : 'pharmacies'}</td><td><b>{money(m.revenue)}</b></td>
                <td style={{ width: 160 }}><div className="bar"><i style={{ width: `${(m.revenue / d.topMedicines[0].revenue) * 100}%` }} /></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
