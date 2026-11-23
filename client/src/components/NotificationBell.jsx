import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, Package, Star, AlertTriangle, UserCheck } from 'lucide-react';
import { api, fmtDateTime } from '../api';

const ICONS = { order: Package, feedback: Star, stock: AlertTriangle, account: UserCheck };

export default function NotificationBell() {
  const [items, setItems] = useState([]);
  const [open, setOpen] = useState(false);
  const ref = useRef();

  const load = () => api('/notifications').then(setItems).catch(() => {});
  useEffect(() => {
    load();
    const t = setInterval(load, 30000);
    const close = (e) => ref.current && !ref.current.contains(e.target) && setOpen(false);
    document.addEventListener('mousedown', close);
    return () => { clearInterval(t); document.removeEventListener('mousedown', close); };
  }, []);

  const unread = items.filter((n) => !n.is_read).length;
  const toggle = async () => {
    setOpen(!open);
    if (!open && unread) {
      await api('/notifications/read-all', { method: 'PATCH' });
      setTimeout(() => setItems((xs) => xs.map((n) => ({ ...n, is_read: 1 }))), 1500);
    }
  };

  return (
    <div className="bell" ref={ref}>
      <button className="icon-btn" onClick={toggle} aria-label="Notifications">
        <Bell size={20} />
        {unread > 0 && <span className="bell-count">{unread}</span>}
      </button>
      {open && (
        <div className="dropdown notif-dropdown">
          <div className="dropdown-head">Notifications</div>
          {items.length === 0 && <div className="notif-empty">You're all caught up</div>}
          {items.slice(0, 12).map((n) => {
            const Icon = ICONS[n.type] || Bell;
            return (
              <Link key={n.id} to={n.link || '#'} className={`notif ${n.is_read ? '' : 'unread'}`} onClick={() => setOpen(false)}>
                <span className={`notif-icon n-${n.type}`}><Icon size={16} /></span>
                <span>
                  <span className="notif-msg">{n.message}</span>
                  <span className="notif-time">{fmtDateTime(n.created_at)}</span>
                </span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
