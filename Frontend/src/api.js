import { CATEGORIES, MY_PHARMACY, PHARMACIES, seedItems } from './mockData.js';
import { demoCatalogue } from './demoCatalogue.js';

export const USE_MOCK = import.meta.env.VITE_USE_MOCK !== 'false';
const BASE = import.meta.env.VITE_API_URL || '/api';

/* ---------- Real API (Express + MySQL backend) ---------- */
async function request(path, { method = 'GET', body } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  const token = localStorage.getItem('mv_token');
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && path !== '/auth/login') {
    localStorage.removeItem('mv_token');
    localStorage.removeItem('mv_user');
    window.location.assign('/login');
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const real = {
  login: (email, password) => request('/auth/login', { method: 'POST', body: { email, password } }),
  getCategories: () => request('/categories'),
  getMedicines: ({ search, category } = {}) => {
    const p = new URLSearchParams();
    if (search) p.set('search', search);
    if (category) p.set('category', category);
    const qs = p.toString();
    return request(`/medicines${qs ? `?${qs}` : ''}`);
  },
  getInventory: () => request('/inventory'),
  addItem: (values) => request('/inventory', { method: 'POST', body: values }),
  updateItem: (id, values) => request(`/inventory/${id}`, { method: 'PUT', body: values }),
  deleteItem: (id) => request(`/inventory/${id}`, { method: 'DELETE' }),
};

/* ---------- Mock API (in-memory demo data) ---------- */
let items = seedItems();
let nextId = 100;
const wait = (value) => new Promise((r) => setTimeout(() => r(JSON.parse(JSON.stringify(value))), 200));
const catName = (id) => CATEGORIES.find((c) => c.id === id)?.name ?? '';

const mock = {
  login: (email, password) =>
    email === 'demo@medivault.lk' && password === 'demo123'
      ? wait({ token: 'mock-token', user: { id: 1, name: 'Nimal Perera', role: 'pharmacist', pharmacy_id: MY_PHARMACY } })
      : Promise.reject(new Error('Invalid email or password')),

  getCategories: () => wait(CATEGORIES),

  getMedicines: ({ search = '', category = '' } = {}) => {
    const q = search.toLowerCase();
    const grouped = new Map();
    for (const it of items) {
      if (category && String(it.category_id) !== String(category)) continue;
      if (q && !it.name.toLowerCase().includes(q) && !it.generic_name.toLowerCase().includes(q)) continue;
      if (!grouped.has(it.medicine_id)) {
        grouped.set(it.medicine_id, {
          id: it.medicine_id, name: it.name, generic_name: it.generic_name,
          category_id: it.category_id, category_name: catName(it.category_id), availability: [],
        });
      }
      grouped.get(it.medicine_id).availability.push({
        inventory_id: it.id, pharmacy_id: it.pharmacy_id, pharmacy_name: it.pharmacy_name,
        quantity: it.quantity, price: it.price, status: it.status, expiry_date: it.expiry_date,
      });
    }
    const catalogue = demoCatalogue
      .filter((m) => ![...grouped.values()].some((entry) => entry.name.toLowerCase() === m.name.toLowerCase()))
      .filter((m) => (!category || String(m.category_id) === String(category)) && (!q || m.name.toLowerCase().includes(q)))
      .map((m) => ({ ...m, category_name: catName(m.category_id) }));
    return wait([...grouped.values(), ...catalogue]);
  },

  getInventory: () =>
    wait(items.filter((i) => i.pharmacy_id === MY_PHARMACY).map((i) => ({ ...i, category_name: catName(i.category_id) }))),

  addItem: (v) => {
    const existing = items.find((i) => i.name.toLowerCase() === v.name.toLowerCase());
    const catalogueMatch = demoCatalogue.find((m) => m.name.toLowerCase() === v.name.toLowerCase());
    items.push({
      ...v, id: nextId++, pharmacy_id: MY_PHARMACY, pharmacy_name: PHARMACIES[MY_PHARMACY],
      medicine_id: existing ? existing.medicine_id : catalogueMatch ? catalogueMatch.id : nextId++,
    });
    return wait({ ok: true });
  },

  updateItem: (id, v) => {
    items = items.map((i) => (i.id === id ? { ...i, ...v } : i));
    return wait({ ok: true });
  },

  deleteItem: (id) => {
    items = items.filter((i) => i.id !== id);
    return wait(null);
  },
};

export const api = USE_MOCK ? mock : real;
