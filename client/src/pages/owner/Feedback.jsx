import { useEffect, useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { api, fmtDate } from '../../api';
import { Stars, Spinner, Empty } from '../../components/ui';

export default function OwnerFeedback() {
  const [list, setList] = useState(null);
  useEffect(() => { api('/owner/feedback').then(setList); }, []);
  if (!list) return <Spinner />;
  const avg = list.length ? list.reduce((s, f) => s + f.rating, 0) / list.length : 0;
  const dist = [5, 4, 3, 2, 1].map((r) => [r, list.filter((f) => f.rating === r).length]);
  return (
    <>
      <div className="page-head"><div><h1>Customer feedback</h1><p className="muted">What customers say about your pharmacy</p></div></div>
      {list.length === 0 ? <Empty icon={MessageSquare} title="No feedback yet" /> : (
        <div className="feedback-layout">
          <div className="card rating-summary">
            <div className="big-rating">{avg.toFixed(1)}</div>
            <Stars value={avg} size={20} />
            <div className="muted small">{list.length} reviews</div>
            {dist.map(([r, n]) => (
              <div key={r} className="dist-row"><span>{r}★</span><div className="bar"><i style={{ width: `${(n / list.length) * 100}%` }} /></div><span>{n}</span></div>
            ))}
          </div>
          <div className="stack">
            {list.map((f) => (
              <div key={f.id} className="review card">
                <div className="review-head"><span className="avatar">{f.full_name[0]}</span><div><b>{f.full_name}</b><div className="muted small">{fmtDate(f.created_at)}{f.medicine_name ? ` · about ${f.medicine_name}` : ''}</div></div><Stars value={f.rating} /></div>
                <p>{f.comment}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
