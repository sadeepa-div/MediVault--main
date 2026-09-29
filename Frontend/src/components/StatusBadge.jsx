import { STATUS } from '../utils.js';

export default function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{STATUS[status] ?? status}</span>;
}
