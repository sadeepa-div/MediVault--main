import { useEffect, useState } from 'react';
import { Minus, Plus, AlertTriangle, Boxes, PackageX, PackageCheck } from 'lucide-react';
import { api, money } from '../../api';
import { MedImage, StockBadge, StatCard, Spinner } from '../../components/ui';

export default function Inventory() {
  const [list, setList] = useState(null);
  const [filter, setFilter] = useState('all');
  const [amount, setAmount] = useState({});
  useEffect(() => { api('/owner/medicines').then(setList); }, []);
  if (!list) return <Spinner />;

  const adjust = async (m, delta) => {
    const updated = await api(`/owner/medicines/${m.id}/stock`, { method: 'PATCH', body: { delta } });
    setList(list.map((x) => (x.id === m.id ? { ...x, ...updated } : x)));
  };
  const low = list.filter((m) => m.stock_qty > 0 && m.stock_qty <= m.low_stock_threshold);
  const out = list.filter((m) => m.stock_qty <= 0);
  const shown = filter === 'low' ? low : filter === 'out' ? out : list;
  const value = list.reduce((s, m) => s + m.price * m.stock_qty, 0);

  return (
    <>
      <div className="page-head"><div><h1>Inventory</h1><p className="muted">Keep stock levels up to date so customers see accurate availability</p></div></div>
      <div className="stat-grid">
        <StatCard icon={Boxes} label="Total units" value={list.reduce((s, m) => s + m.stock_qty, 0).toLocaleString()} />
        <StatCard icon={PackageCheck} label="Stock value" value={money(value)} tone="indigo" />
        <StatCard icon={AlertTriangle} label="Low stock" value={low.length} tone="amber" />
        <StatCard icon={PackageX} label="Out of stock" value={out.length} tone="red" />
      </div>
      <div className="tabs">
        <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>All ({list.length})</button>
        <button className={filter === 'low' ? 'active' : ''} onClick={() => setFilter('low')}>Low stock ({low.length})</button>
        <button className={filter === 'out' ? 'active' : ''} onClick={() => setFilter('out')}>Out of stock ({out.length})</button>
      </div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Medicine</th><th>Category</th><th>Price</th><th>Sold</th><th>Status</th><th>In stock</th><th>Restock</th></tr></thead>
          <tbody>
            {shown.map((m) => (
              <tr key={m.id} className={m.stock_qty <= 0 ? 'row-out' : m.stock_qty <= m.low_stock_threshold ? 'row-low' : ''}>
                <td><div className="row gap"><MedImage src={m.image_url} category={m.category} name={m.name} size="sm" /><div><b>{m.name}</b><div className="muted small">{m.dosage}</div></div></div></td>
                <td>{m.category}</td>
                <td>{money(m.price)}</td>
                <td>{m.units_sold}</td>
                <td><StockBadge qty={m.stock_qty} threshold={m.low_stock_threshold} /></td>
                <td>
                  <div className="qty sm">
                    <button onClick={() => adjust(m, -1)}><Minus size={14} /></button>
                    <span>{m.stock_qty}</span>
                    <button onClick={() => adjust(m, 1)}><Plus size={14} /></button>
                  </div>
                </td>
                <td>
                  <div className="row gap restock">
                    <input type="number" min="1" placeholder="Qty" value={amount[m.id] || ''} onChange={(e) => setAmount({ ...amount, [m.id]: e.target.value })} />
                    <button className="btn sm" disabled={!amount[m.id]} onClick={() => { adjust(m, Number(amount[m.id])); setAmount({ ...amount, [m.id]: '' }); }}>Add</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
