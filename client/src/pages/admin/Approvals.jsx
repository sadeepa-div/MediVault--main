import { useEffect, useState } from 'react';
import { Check, X, Mail, Phone, Cake, IdCard, MapPin, BadgeCheck, Store, RotateCcw } from 'lucide-react';
import { api, fmtDate } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, Spinner, Empty } from '../../components/ui';

export default function Approvals() {
  const { showToast } = useAuth();
  const [tab, setTab] = useState('pending');
  const [list, setList] = useState(null);
  const load = () => api(`/admin/owners?status=${tab}`).then(setList);
  useEffect(() => { setList(null); load(); }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const decide = async (o, status) => {
    await api(`/admin/owners/${o.id}`, { method: 'PATCH', body: { status } });
    showToast(status === 'approved' ? `${o.full_name} approved` : status === 'rejected' ? `${o.full_name} rejected` : 'Moved back to pending');
    load();
  };

  return (
    <>
      <div className="page-head"><div><h1>Pharmacy owner approvals</h1><p className="muted">Check each owner's details and licence before they can log in</p></div></div>
      <div className="tabs">{['pending', 'approved', 'rejected'].map((t) => <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>{t}</button>)}</div>
      {!list ? <Spinner /> : list.length === 0 ? <Empty icon={BadgeCheck} title={`No ${tab} owners`} /> : (
        <div className="approval-grid">
          {list.map((o) => (
            <div key={o.id} className="card approval">
              <div className="approval-head">
                <span className="avatar lg">{o.full_name[0]}</span>
                <div className="grow"><b>{o.full_name}</b><div className="muted small">@{o.username} · applied {fmtDate(o.created_at)}</div></div>
                <StatusBadge status={o.status} />
              </div>
              <div className="approval-pharm"><Store size={16} /> <b>{o.pharmacy_name}</b> <span className="muted">· {o.city}</span></div>
              <div className="kv">
                <span><BadgeCheck size={14} /> Licence no.</span><b>{o.license_no}</b>
                <span><IdCard size={14} /> ID no.</span><b>{o.id_no}</b>
                <span><Mail size={14} /> Email</span><b>{o.email}</b>
                <span><Phone size={14} /> Phone</span><b>{o.phone}</b>
                <span><Cake size={14} /> Birthday</span><b>{fmtDate(o.birthday)}</b>
                <span><MapPin size={14} /> Address</span><b>{o.address}</b>
              </div>
              <div className="row gap">
                {o.status !== 'approved' && <button className="btn grow" onClick={() => decide(o, 'approved')}><Check size={16} /> Approve</button>}
                {o.status !== 'rejected' && <button className="btn outline danger-outline grow" onClick={() => decide(o, 'rejected')}><X size={16} /> Reject</button>}
                {o.status !== 'pending' && <button className="btn ghost" onClick={() => decide(o, 'pending')} title="Move back to pending"><RotateCcw size={16} /></button>}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
