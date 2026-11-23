import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Star, Clock, Search } from 'lucide-react';
import { api } from '../api';
import { OpenBadge, Spinner } from '../components/ui';

export default function Pharmacies() {
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  useEffect(() => { api('/pharmacies').then(setList); }, []);
  if (!list) return <Spinner />;
  const shown = list.filter((p) => `${p.name} ${p.city} ${p.address}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <div className="container page">
      <div className="page-head">
        <div><h1>Pharmacies</h1><p className="muted">{list.length} verified pharmacies</p></div>
        <div className="inline-search"><Search size={18} /><input placeholder="Search by name or city" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="pharm-grid">
        {shown.map((p) => (
          <Link key={p.id} to={`/pharmacies/${p.id}`} className="pharm-card">
            <div className="pharm-card-top">
              <span className="pharm-avatar">{p.image_url ? <img src={p.image_url} alt="" /> : p.name[0]}</span>
              <OpenBadge open={p.is_open} />
            </div>
            <h3>{p.name}</h3>
            <p className="muted small clamp">{p.description}</p>
            <div className="muted small"><MapPin size={14} /> {p.address}</div>
            <div className="muted small"><Phone size={14} /> {p.phone}</div>
            <div className="muted small"><Clock size={14} /> {p.opening_hours}</div>
            <div className="pharm-meta"><span><Star size={14} fill="#f59e0b" color="#f59e0b" /> {p.rating || 'New'} ({p.review_count})</span><span>{p.medicine_count} medicines</span></div>
          </Link>
        ))}
      </div>
    </div>
  );
}
