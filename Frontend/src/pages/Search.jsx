import { useEffect, useState } from 'react';
import { api } from '../api.js';
import StatusBadge from '../components/StatusBadge.jsx';
import MedicineIllustration from '../components/MedicineIllustration.jsx';
import { money, overallStatus } from '../utils.js';

export default function Search() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  // Search 300ms after the user stops typing; ignore out-of-date responses.
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const data = await api.getMedicines({ search: query.trim(), category });
        if (!cancelled) {
          setMedicines(data);
          setError('');
        }
      } catch (e) {
        if (!cancelled) setError(e.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, category]);

  return (
    <section>
      <div className="hero">
        <h1>Find your medicine</h1>
        <p className="muted">Explore medicines and check pharmacy stock when information is available.</p>
        {import.meta.env.VITE_USE_MOCK !== 'false' && <p className="catalogue-note">Demo catalogue: medicine names and illustrations are examples. Pharmacy prices and stock shown here are sample data.</p>}
      </div>

      <div className="search-row">
        <input
          type="search"
          placeholder="Search by medicine or generic name"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search medicines"
        />
        <select value={category} onChange={(e) => setCategory(e.target.value)} aria-label="Category">
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      {error && <div className="notice notice-error" role="alert">{error}</div>}
      {loading && !medicines.length && <p className="empty">Searching...</p>}
      {!loading && !error && !medicines.length && (
        <p className="empty">No medicines found. Try a different name or category.</p>
      )}

      <div className="grid">
        {medicines.map((m) => {
          const status = overallStatus(m.availability);
          const stocked = m.availability.filter((a) => a.status !== 'out_of_stock');
          const lowest = stocked.length ? Math.min(...stocked.map((a) => Number(a.price))) : null;
          const isOpen = openId === m.id;
          return (
            <article className="card" key={m.id}>
              <MedicineIllustration name={m.name} category={m.category_name} />
              <div className="card-top">
                <h3>{m.name}</h3>
                {m.availability.length > 0 && <StatusBadge status={status} />}
              </div>
              <p className="muted">{m.generic_name} · {m.category_name}</p>
              <p className="price">
                {lowest !== null ? <>From <strong>{money(lowest)}</strong></> : m.availability.length ? 'Currently unavailable' : 'No pharmacy stock data yet'}
              </p>
              {m.availability.length > 0 && <button className="link" aria-expanded={isOpen} onClick={() => setOpenId(isOpen ? null : m.id)}>
                {isOpen ? 'Hide' : 'Show'} pharmacies ({m.availability.length})
              </button>}
              {isOpen && (
                <ul className="pharm-list">
                  {m.availability.map((a) => (
                    <li key={a.inventory_id}>
                      <span>{a.pharmacy_name}</span>
                      <span>{money(a.price)}</span>
                      <StatusBadge status={a.status} />
                    </li>
                  ))}
                </ul>
              )}
            </article>
          );
        })}
      </div>
    </section>
  );
}
