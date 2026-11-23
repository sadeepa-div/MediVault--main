import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { api, fmtDate } from '../../api';
import { StatusBadge, Spinner } from '../../components/ui';

export default function Users() {
  const [list, setList] = useState(null);
  const [role, setRole] = useState('');
  const [q, setQ] = useState('');
  useEffect(() => { api('/admin/users').then(setList); }, []);
  if (!list) return <Spinner />;
  const shown = list.filter((u) => (!role || u.role === role) && `${u.full_name} ${u.username} ${u.email}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="page-head">
        <div><h1>Users</h1><p className="muted">{list.length} accounts</p></div>
        <div className="inline-search"><Search size={18} /><input placeholder="Search users" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="tabs">{['', 'customer', 'owner', 'admin'].map((r) => <button key={r} className={role === r ? 'active' : ''} onClick={() => setRole(r)}>{r ? r + 's' : 'All'}</button>)}</div>
      <div className="card table-wrap">
        <table className="table">
          <thead><tr><th>Name</th><th>Username</th><th>Email</th><th>Phone</th><th>Role</th><th>Status</th><th>Orders</th><th>Joined</th></tr></thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id}>
                <td><div className="row gap"><span className="avatar">{u.full_name[0]}</span><b>{u.full_name}</b></div></td>
                <td>@{u.username}</td><td>{u.email}</td><td>{u.phone}</td>
                <td><span className={`badge role-${u.role}`}>{u.role}</span></td>
                <td><StatusBadge status={u.status} /></td><td>{u.orders}</td><td>{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
