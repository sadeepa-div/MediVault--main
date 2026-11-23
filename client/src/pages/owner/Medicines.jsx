import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, ImagePlus } from 'lucide-react';
import { api, money } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { MedImage, StockBadge, Modal, Field, Spinner, Empty } from '../../components/ui';

const CATEGORIES = ['Pain Relief', 'Antibiotics', 'Allergy', 'Vitamins', 'Diabetes', 'Heart & BP', 'Digestive', 'Cold & Flu', 'First Aid', 'Baby Care'];
const EMPTY = { name: '', generic_name: '', category: 'Pain Relief', manufacturer: '', dosage: '', description: '', price: '', stock_qty: '', low_stock_threshold: 10, requires_prescription: false };

export function MedicineForm({ initial, onSaved, onClose }) {
  const { showToast } = useAuth();
  const [f, setF] = useState(initial ? { ...initial, requires_prescription: !!initial.requires_prescription } : EMPTY);
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setF({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });
  const preview = file ? URL.createObjectURL(file) : f.image_url;

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const form = new FormData();
    Object.keys(EMPTY).forEach((k) => form.append(k, f[k] ?? ''));
    if (file) form.append('image', file);
    try {
      await api(initial ? `/owner/medicines/${initial.id}` : '/owner/medicines', { method: initial ? 'PUT' : 'POST', form });
      showToast(initial ? 'Medicine updated' : 'Medicine added');
      onSaved();
    } catch (err) { showToast(err.message, 'error'); }
    setBusy(false);
  };

  return (
    <Modal title={initial ? `Edit ${initial.name}` : 'Add medicine'} onClose={onClose} wide>
      <form className="med-form" onSubmit={submit}>
        <label className="upload-box">
          {preview ? <img src={preview} alt="" /> : <MedImage category={f.category} name={f.name || 'Image'} />}
          <span className="upload-hint"><ImagePlus size={16} /> {preview ? 'Change image' : 'Upload image'}</span>
          <input type="file" accept="image/*" hidden onChange={(e) => setFile(e.target.files[0])} />
        </label>
        <div className="form-grid">
          <Field label="Medicine name"><input required value={f.name} onChange={set('name')} /></Field>
          <Field label="Generic name"><input value={f.generic_name || ''} onChange={set('generic_name')} /></Field>
          <Field label="Category">
            <select value={f.category || ''} onChange={set('category')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select>
          </Field>
          <Field label="Manufacturer"><input value={f.manufacturer || ''} onChange={set('manufacturer')} /></Field>
          <Field label="Dosage / pack"><input value={f.dosage || ''} onChange={set('dosage')} placeholder="500 mg tablet" /></Field>
          <Field label="Price (Rs.)"><input type="number" step="0.01" min="0" required value={f.price} onChange={set('price')} /></Field>
          <Field label="Stock quantity"><input type="number" min="0" required value={f.stock_qty} onChange={set('stock_qty')} /></Field>
          <Field label="Low stock alert at"><input type="number" min="0" value={f.low_stock_threshold} onChange={set('low_stock_threshold')} /></Field>
          <Field label="Details about the item" full><textarea rows={3} value={f.description || ''} onChange={set('description')} /></Field>
          <label className="check full"><input type="checkbox" checked={f.requires_prescription} onChange={set('requires_prescription')} /> Requires a prescription</label>
        </div>
        <div className="modal-foot full"><button type="button" className="btn ghost" onClick={onClose}>Cancel</button><button className="btn" disabled={busy}>{busy ? 'Saving…' : 'Save medicine'}</button></div>
      </form>
    </Modal>
  );
}

export default function OwnerMedicines() {
  const { showToast } = useAuth();
  const [list, setList] = useState(null);
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState(undefined); // undefined = closed, null = new
  const load = () => api('/owner/medicines').then(setList);
  useEffect(() => { load(); }, []);

  const remove = async (m) => {
    if (!window.confirm(`Delete ${m.name}?`)) return;
    await api(`/owner/medicines/${m.id}`, { method: 'DELETE' });
    showToast('Medicine deleted');
    load();
  };

  if (!list) return <Spinner />;
  const shown = list.filter((m) => `${m.name} ${m.generic_name} ${m.category}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <div className="page-head">
        <div><h1>Medicines</h1><p className="muted">{list.length} medicines in your shop</p></div>
        <div className="row gap">
          <div className="inline-search"><Search size={18} /><input placeholder="Search" value={q} onChange={(e) => setQ(e.target.value)} /></div>
          <button className="btn" onClick={() => setEditing(null)}><Plus size={18} /> Add medicine</button>
        </div>
      </div>
      {shown.length === 0 ? <Empty title="No medicines yet">Add your first medicine to start selling.</Empty> : (
        <div className="owner-med-grid">
          {shown.map((m) => (
            <div key={m.id} className="card owner-med">
              <MedImage src={m.image_url} category={m.category} name={m.name} />
              <div className="owner-med-body">
                <div className="med-cat">{m.category}</div>
                <b>{m.name}</b>
                <div className="muted small">{m.generic_name} · {m.dosage}</div>
                <div className="row between"><span className="price">{money(m.price)}</span><StockBadge qty={m.stock_qty} threshold={m.low_stock_threshold} /></div>
                <div className="muted small">{m.units_sold} sold · {m.stock_qty} in stock</div>
                <div className="row gap">
                  <button className="btn sm outline grow" onClick={() => setEditing(m)}><Pencil size={14} /> Edit</button>
                  <button className="icon-btn danger" onClick={() => remove(m)} aria-label="Delete"><Trash2 size={17} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {editing !== undefined && <MedicineForm initial={editing} onClose={() => setEditing(undefined)} onSaved={() => { setEditing(undefined); load(); }} />}
    </>
  );
}
