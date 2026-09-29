import { useEffect, useState } from 'react';
import { STATUS, statusFor } from '../utils.js';

// Add / edit form shown in a modal. onSave(payload) must return a promise.
export default function ItemForm({ initial, categories, onSave, onCancel }) {
  const [v, setV] = useState({
    name: '', generic_name: '', category_id: '', quantity: 0, price: '',
    status: 'out_of_stock', expiry_date: '', ...initial,
  });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  const set = (field) => (e) => setV((p) => ({ ...p, [field]: e.target.value }));
  // Changing the quantity suggests a matching status; the user can still change it afterwards.
  const setQuantity = (e) => setV((p) => ({ ...p, quantity: e.target.value, status: statusFor(e.target.value) }));

  async function submit(e) {
    e.preventDefault();
    const quantity = Number(v.quantity);
    const price = Number(v.price);
    if (!v.name.trim()) return setError('Medicine name is required.');
    if (!Number.isInteger(quantity) || quantity < 0) return setError('Quantity must be a whole number, 0 or more.');
    if (v.price === '' || !(price >= 0)) return setError('Enter a valid price.');

    setBusy(true);
    setError('');
    try {
      await onSave({
        name: v.name.trim(),
        generic_name: v.generic_name.trim(),
        category_id: v.category_id ? Number(v.category_id) : null,
        quantity,
        price,
        status: v.status,
        expiry_date: v.expiry_date || null,
      });
    } catch (err) {
      setError(err.message);
      setBusy(false);
    }
  }

  return (
    <div className="overlay" onMouseDown={onCancel}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="form-title" onMouseDown={(e) => e.stopPropagation()}>
        <h2 id="form-title">{initial ? 'Edit medicine' : 'Add medicine'}</h2>
        <form onSubmit={submit}>
          <div className="form-grid">
            <label className="full">Medicine name
              <input value={v.name} onChange={set('name')} autoFocus />
            </label>
            <label>Generic name
              <input value={v.generic_name} onChange={set('generic_name')} />
            </label>
            <label>Category
              <select value={v.category_id ?? ''} onChange={set('category_id')}>
                <option value="">Select...</option>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label>Quantity
              <input type="number" min="0" step="1" value={v.quantity} onChange={setQuantity} />
            </label>
            <label>Price (Rs.)
              <input type="number" min="0" step="0.01" value={v.price} onChange={set('price')} />
            </label>
            <label>Stock status
              <select value={v.status} onChange={set('status')}>
                {Object.entries(STATUS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
              </select>
            </label>
            <label>Expiry date
              <input type="date" value={v.expiry_date ?? ''} onChange={set('expiry_date')} />
            </label>
          </div>
          {error && <div className="notice notice-error" role="alert">{error}</div>}
          <div className="modal-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel}>Cancel</button>
            <button className="btn" disabled={busy}>{busy ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
