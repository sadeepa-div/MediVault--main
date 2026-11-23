// Thin fetch wrapper that adds the login token and turns API errors into exceptions.
const TOKEN_KEY = 'medivault_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export async function api(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (form) payload = form;
  else if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    payload = JSON.stringify(body);
  }
  const res = await fetch(`/api${path}`, { method, headers, body: payload });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`);
  return data;
}

export const money = (n) =>
  'Rs. ' + Number(n || 0).toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export const shortMoney = (n) => {
  n = Number(n || 0);
  if (n >= 1e6) return 'Rs. ' + (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return 'Rs. ' + (n / 1e3).toFixed(1) + 'k';
  return 'Rs. ' + n.toFixed(0);
};

export const fmtDate = (d) =>
  d ? new Date(d.replace(' ', 'T')).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '';

export const fmtDateTime = (d) =>
  d ? new Date(d.replace(' ', 'T')).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : '';

// Adds zero-revenue entries for days without sales so charts show a continuous timeline.
export function fillDays(rows, days) {
  const map = Object.fromEntries(rows.map((r) => [r.day, r]));
  const out = [];
  for (let i = days; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    out.push(map[key] || { day: key, revenue: 0, orders: 0 });
  }
  return out;
}

export const PAYMENT_LABELS = { cash_on_delivery: 'Cash on delivery', card: 'Card', bank_transfer: 'Bank transfer' };
