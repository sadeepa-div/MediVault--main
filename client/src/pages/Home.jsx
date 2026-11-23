import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Truck, ShieldCheck, Clock, Store, ArrowRight, Star, MapPin, Phone } from 'lucide-react';
import { api } from '../api';
import MedicineCard from '../components/MedicineCard';
import { categoryStyle, OpenBadge } from '../components/ui';

export default function Home() {
  const [q, setQ] = useState('');
  const [cats, setCats] = useState([]);
  const [meds, setMeds] = useState([]);
  const [pharmacies, setPharmacies] = useState([]);
  const nav = useNavigate();

  useEffect(() => {
    api('/categories').then(setCats);
    api('/medicines?inStock=1').then((m) => {
      // one card per medicine name so the home page shows variety
      const seen = new Set();
      setMeds(m.filter((x) => !seen.has(x.name) && seen.add(x.name)).slice(0, 8));
    });
    api('/pharmacies').then(setPharmacies);
  }, []);

  const rated = pharmacies.filter((p) => p.rating);
  const avgRating = rated.length ? (rated.reduce((s, p) => s + Number(p.rating), 0) / rated.length).toFixed(1) : '5.0';

  return (
    <>
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="pill-tag"><ShieldCheck size={14} /> Verified pharmacies only</span>
            <h1>Your medicine, <span className="grad">found and delivered</span> in minutes.</h1>
            <p>Search every pharmacy near you at once. See who has it in stock, compare prices, and order with the payment method that suits you.</p>
            <form className="hero-search" onSubmit={(e) => { e.preventDefault(); nav(`/medicines?q=${encodeURIComponent(q)}`); }}>
              <Search size={20} />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Try “Panadol”, “Vitamin C” or “Losartan”" />
              <button className="btn">Search</button>
            </form>
            <div className="hero-popular">
              Popular: {['Panadol', 'Vitamin C 1000', 'Cetirizine', 'Omeprazole'].map((p) => (
                <Link key={p} to={`/medicines?q=${encodeURIComponent(p)}`}>{p}</Link>
              ))}
            </div>
          </div>
          <div className="hero-art" aria-hidden>
            <div className="hero-blob" />
            <div className="float-card fc1"><Truck size={20} /><div><b>Fast delivery</b><span>From pharmacies near you</span></div></div>
            <div className="float-card fc2"><Store size={20} /><div><b>{pharmacies.length} pharmacies</b><span>Verified by our team</span></div></div>
            <div className="float-card fc3"><Star size={20} fill="#f59e0b" color="#f59e0b" /><div><b>{avgRating} average rating</b><span>From real customers</span></div></div>
            <div className="hero-cross">
              <svg viewBox="0 0 200 200"><defs><linearGradient id="hc" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2dd4bf" /><stop offset="1" stopColor="#0f766e" /></linearGradient></defs><rect x="10" y="10" width="180" height="180" rx="48" fill="url(#hc)" /><path d="M80 45h40v35h35v40h-35v35H80v-35H45V80h35z" fill="#fff" /></svg>
            </div>
          </div>
        </div>
      </section>

      <section className="container features">
        {[
          [Search, 'Search everywhere', 'One search checks stock at every pharmacy.'],
          [ShieldCheck, 'Verified pharmacies', 'Every pharmacy is checked and approved by our admins.'],
          [Clock, 'Live availability', 'See open hours and stock before you leave home.'],
          [Truck, 'Flexible payment', 'Cash on delivery, card or bank transfer.'],
        ].map(([Icon, t, d]) => (
          <div className="feature" key={t}><div className="feature-icon"><Icon size={22} /></div><div><b>{t}</b><p>{d}</p></div></div>
        ))}
      </section>

      <section className="container section">
        <div className="section-head"><h2>Shop by category</h2><Link to="/medicines" className="link">View all <ArrowRight size={16} /></Link></div>
        <div className="cat-grid">
          {cats.map((c) => {
            const [a, b, Icon] = categoryStyle(c.category);
            return (
              <Link key={c.category} to={`/medicines?category=${encodeURIComponent(c.category)}`} className="cat-card">
                <span className="cat-icon" style={{ background: `linear-gradient(135deg, ${a}, ${b})` }}><Icon size={22} color="#fff" /></span>
                <b>{c.category}</b>
                <small>{c.count} items</small>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="container section">
        <div className="section-head"><h2>Available now</h2><Link to="/medicines" className="link">Browse medicines <ArrowRight size={16} /></Link></div>
        <div className="med-grid">{meds.map((m) => <MedicineCard key={m.id} m={m} />)}</div>
      </section>

      <section className="container section">
        <div className="section-head"><h2>Pharmacies on Medi_vault</h2><Link to="/pharmacies" className="link">See all <ArrowRight size={16} /></Link></div>
        <div className="pharm-grid">
          {pharmacies.map((p) => (
            <Link key={p.id} to={`/pharmacies/${p.id}`} className="pharm-card">
              <div className="pharm-card-top">
                <span className="pharm-avatar">{p.image_url ? <img src={p.image_url} alt="" /> : p.name[0]}</span>
                <OpenBadge open={p.is_open} />
              </div>
              <h3>{p.name}</h3>
              <div className="muted small"><MapPin size={14} /> {p.address}</div>
              <div className="muted small"><Phone size={14} /> {p.phone}</div>
              <div className="pharm-meta"><span><Star size={14} fill="#f59e0b" color="#f59e0b" /> {p.rating || 'New'}</span><span>{p.medicine_count} medicines</span></div>
            </Link>
          ))}
        </div>
      </section>

      <section className="container">
        <div className="cta">
          <div>
            <h2>Own a pharmacy?</h2>
            <p>Reach more customers, manage inventory and track your sales in one place.</p>
          </div>
          <Link to="/register-pharmacy" className="btn light lg">Register your pharmacy <ArrowRight size={18} /></Link>
        </div>
      </section>
    </>
  );
}
