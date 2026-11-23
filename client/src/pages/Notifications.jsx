import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, Star, AlertTriangle, UserCheck } from 'lucide-react';
import { api, fmtDateTime } from '../api';
import { Empty, Spinner } from '../components/ui';

const ICONS = { order: Package, feedback: Star, stock: AlertTriangle, account: UserCheck };

export default function Notifications() {
  const [list, setList] = useState(null);
  useEffect(() => { api('/notifications').then((l) => { setList(l); api('/notifications/read-all', { method: 'PATCH' }); }); }, []);
  if (!list) return <Spinner />;
  return (
    <>
      <div className="page-head"><div><h1>Notifications</h1><p className="muted">Order, stock and feedback alerts</p></div></div>
      {list.length === 0 ? <Empty icon={Bell} title="No notifications" /> : (
        <div className="card notif-page">
          {list.map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <Link key={n.id} to={n.link || '#'} className={`notif ${n.is_read ? '' : 'unread'}`}>
                <span className={`notif-icon n-${n.type}`}><Icon size={16} /></span>
                <span><span className="notif-msg">{n.message}</span><span className="notif-time">{fmtDateTime(n.created_at)}</span></span>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
