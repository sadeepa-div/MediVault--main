import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SlidersHorizontal, PackageSearch } from 'lucide-react';
import { api } from '../api';
import MedicineCard from '../components/MedicineCard';
import { Empty, Spinner } from '../components/ui';

export default function Medicines() {
  const [params, setParams] = useSearchParams();
  const [meds, setMeds] = useState(null);
  const [cats, setCats] = useState([]);
  const [cities, setCities] = useState([]);
  const [q, setQ] = useState(params.get('q') || '');

  useEffect(() => {
    api('/categories').then(setCats);
    api('/pharmacies').then((ps) => setCities([...new Set(ps.map((p) => p.city).filter(Boolean))]));
  }, []);

  useEffect(() => {
    setMeds(null);
    setQ(params.get('q') || '');
    api(`/medicines?${params.toString()}`).then(setMeds);
  }, [params]);

  const set = (k, v) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v); else next.delete(k);
    setParams(next);
  };

  return (
    <div className="container page">
      <div className="page-head">
        <div>
          <h1>{params.get('q') ? `Results for “${params.get('q')}”` : params.get('category') || 'All medicines'}</h1>
          <p className="muted">{meds ? `${meds.length} items across our pharmacies` : 'Searching…'}</p>
        </div>
        <form className="inline-search" onSubmit={(e) => { e.preventDefault(); set('q', q); }}>
          <Search size={18} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medicines" />
        </form>
      </div>
      <div className="browse">
        <aside className="filters card">
          <h4><SlidersHorizontal size={16} /> Filters</h4>
          <div className="filter-group">
            <label>Category</label>
            <div className="chips">
              <button className={!params.get('category') ? 'chip active' : 'chip'} onClick={() => set('category', '')}>All</button>
              {cats.map((c) => (
                <button key={c.category} className={params.get('category') === c.category ? 'chip active' : 'chip'} onClick={() => set('category', c.category)}>{c.category}</button>
              ))}
            </div>
          </div>
          <div className="filter-group">
            <label>City</label>
            <select value={params.get('city') || ''} onChange={(e) => set('city', e.target.value)}>
              <option value="">Any city</option>
              {cities.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="filter-group">
            <label>Sort by</label>
            <select value={params.get('sort') || ''} onChange={(e) => set('sort', e.target.value)}>
              <option value="">Availability</option>
              <option value="price_asc">Price: low to high</option>
              <option value="price_desc">Price: high to low</option>
              <option value="name">Name</option>
            </select>
          </div>
          <label className="check"><input type="checkbox" checked={params.get('inStock') === '1'} onChange={(e) => set('inStock', e.target.checked ? '1' : '')} /> In stock only</label>
        </aside>
        <div>
          {!meds ? <Spinner /> : meds.length === 0 ? (
            <Empty icon={PackageSearch} title="No medicines found">Try a different name or clear the filters.</Empty>
          ) : (
            <div className="med-grid">{meds.map((m) => <MedicineCard key={m.id} m={m} />)}</div>
          )}
        </div>
      </div>
    </div>
  );
}
