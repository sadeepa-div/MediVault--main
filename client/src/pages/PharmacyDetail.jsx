import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock } from 'lucide-react';
import { api, fmtDate } from '../api';
import MedicineCard from '../components/MedicineCard';
import { OpenBadge, Stars, Spinner, Empty } from '../components/ui';

export default function PharmacyDetail() {
  const { id } = useParams();
  const [p, setP] = useState(null);
  const [meds, setMeds] = useState([]);
  useEffect(() => {
    api(`/pharmacies/${id}`).then(setP).catch(() => setP(false));
    api(`/medicines?pharmacy=${id}`).then(setMeds);
  }, [id]);
  if (p === null) return <Spinner />;
  if (p === false) return <div className="container page"><Empty title="Pharmacy not found" /></div>;
  return (
    <div className="container page">
      <div className="pharm-hero card">
        <span className="pharm-avatar lg">{p.image_url ? <img src={p.image_url} alt="" /> : p.name[0]}</span>
        <div className="pharm-hero-info">
          <div className="row gap"><h1>{p.name}</h1><OpenBadge open={p.is_open} /></div>
          <p className="muted">{p.description}</p>
          <div className="shop-lines row-wrap">
            <span><MapPin size={15} /> {p.address}</span>
            <a href={`tel:${p.phone}`}><Phone size={15} /> {p.phone}</a>
            <span><Mail size={15} /> {p.email}</span>
            <span><Clock size={15} /> {p.opening_hours}</span>
          </div>
          <div className="row gap small"><Stars value={p.rating || 0} /> <b>{p.rating || 'No ratings yet'}</b> <span className="muted">· Pharmacist: {p.owner_name}</span></div>
        </div>
      </div>
      <section className="section">
        <h2>Medicines ({meds.length})</h2>
        <div className="med-grid">{meds.map((m) => <MedicineCard key={m.id} m={m} />)}</div>
      </section>
      <section className="section">
        <h2>Feedback</h2>
        {p.reviews.length === 0 && <p className="muted">No feedback yet.</p>}
        <div className="review-cols">
          {p.reviews.map((r, i) => (
            <div key={i} className="review card">
              <div className="review-head"><span className="avatar">{r.full_name[0]}</span><div><b>{r.full_name}</b><div className="muted small">{fmtDate(r.created_at)}</div></div><Stars value={r.rating} /></div>
              <p>{r.comment}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
