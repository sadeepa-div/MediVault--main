import { useEffect, useState } from 'react';
import { Camera, Store, Landmark, User } from 'lucide-react';
import { api } from '../../api';
import { useAuth } from '../../context/AuthContext';
import { Field, Spinner } from '../../components/ui';
import { ShopToggle } from './Dashboard';

export default function OwnerProfile() {
  const { setUser, user, showToast } = useAuth();
  const [f, setF] = useState(null);
  const [meta, setMeta] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [shopImg, setShopImg] = useState(null);

  const fill = ({ owner, pharmacy }) => {
    setMeta({ owner, pharmacy });
    setF({
      full_name: owner.full_name, email: owner.email, phone: owner.phone || '', address: owner.address || '',
      pharmacy_name: pharmacy.name, pharmacy_address: pharmacy.address || '', city: pharmacy.city || '', pharmacy_phone: pharmacy.phone || '',
      pharmacy_email: pharmacy.email || '', description: pharmacy.description || '', opening_hours: pharmacy.opening_hours || '',
      bank_name: pharmacy.bank_name || '', bank_account_no: pharmacy.bank_account_no || '', bank_account_name: pharmacy.bank_account_name || '',
    });
  };
  useEffect(() => { api('/owner/profile').then(fill); }, []);
  if (!f) return <Spinner />;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const save = async (e) => {
    e.preventDefault();
    const form = new FormData();
    Object.entries(f).forEach(([k, v]) => form.append(k, v));
    if (photo) form.append('photo', photo);
    if (shopImg) form.append('shop_image', shopImg);
    try {
      const r = await api('/owner/profile', { method: 'PUT', form });
      fill(r); setPhoto(null); setShopImg(null);
      setUser({ ...user, full_name: r.owner.full_name, photo_url: r.owner.photo_url });
      showToast('Profile saved');
    } catch (err) { showToast(err.message, 'error'); }
  };
  const toggle = async (is_open) => {
    await api('/owner/shop-status', { method: 'PATCH', body: { is_open } });
    setMeta({ ...meta, pharmacy: { ...meta.pharmacy, is_open } });
  };
  const photoSrc = photo ? URL.createObjectURL(photo) : meta.owner.photo_url;
  const shopSrc = shopImg ? URL.createObjectURL(shopImg) : meta.pharmacy.image_url;

  return (
    <form onSubmit={save}>
      <div className="page-head">
        <div><h1>Profile</h1><p className="muted">Your details, shop details and bank account for payments</p></div>
        <div className="row gap"><ShopToggle open={!!meta.pharmacy.is_open} onChange={toggle} /><button className="btn">Save changes</button></div>
      </div>
      <div className="profile-head card">
        <label className="photo-upload">
          {photoSrc ? <img src={photoSrc} alt="" /> : <span>{f.full_name[0]}</span>}
          <i><Camera size={16} /></i>
          <input type="file" accept="image/*" hidden onChange={(e) => setPhoto(e.target.files[0])} />
        </label>
        <div>
          <h2>{f.full_name}</h2>
          <p className="muted">@{meta.owner.username} · ID {meta.owner.id_no} · Born {meta.owner.birthday}</p>
          <p className="muted small">Pharmacy licence: <b>{meta.pharmacy.license_no}</b></p>
        </div>
        <label className="shop-photo">
          {shopSrc ? <img src={shopSrc} alt="" /> : <Store size={28} />}
          <span><Camera size={14} /> Shop photo</span>
          <input type="file" accept="image/*" hidden onChange={(e) => setShopImg(e.target.files[0])} />
        </label>
      </div>
      <div className="profile-grid">
        <div className="card form-card">
          <h3><User size={18} /> Owner details</h3>
          <div className="form-grid">
            <Field label="Name"><input value={f.full_name} onChange={set('full_name')} /></Field>
            <Field label="Email"><input type="email" value={f.email} onChange={set('email')} /></Field>
            <Field label="Contact no."><input value={f.phone} onChange={set('phone')} /></Field>
            <Field label="Address"><input value={f.address} onChange={set('address')} /></Field>
          </div>
        </div>
        <div className="card form-card">
          <h3><Landmark size={18} /> Bank account (for order payments)</h3>
          <div className="form-grid">
            <Field label="Bank name"><input value={f.bank_name} onChange={set('bank_name')} /></Field>
            <Field label="Account number"><input value={f.bank_account_no} onChange={set('bank_account_no')} /></Field>
            <Field label="Account owner name" full><input value={f.bank_account_name} onChange={set('bank_account_name')} /></Field>
          </div>
        </div>
        <div className="card form-card span-2">
          <h3><Store size={18} /> Shop details</h3>
          <div className="form-grid three">
            <Field label="Pharmacy name"><input value={f.pharmacy_name} onChange={set('pharmacy_name')} /></Field>
            <Field label="Shop phone"><input value={f.pharmacy_phone} onChange={set('pharmacy_phone')} /></Field>
            <Field label="Shop email"><input value={f.pharmacy_email} onChange={set('pharmacy_email')} /></Field>
            <Field label="Shop address"><input value={f.pharmacy_address} onChange={set('pharmacy_address')} /></Field>
            <Field label="City"><input value={f.city} onChange={set('city')} /></Field>
            <Field label="Opening hours"><input value={f.opening_hours} onChange={set('opening_hours')} placeholder="Mon–Sat 8 AM – 9 PM" /></Field>
            <Field label="About the shop" full><textarea rows={3} value={f.description} onChange={set('description')} /></Field>
          </div>
        </div>
      </div>
    </form>
  );
}
