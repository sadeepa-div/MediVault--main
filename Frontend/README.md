# MediVault frontend

React (Vite) frontend for the MediVault Medicine Availability Management System.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # unit tests (Vitest)
npm run build    # production build in dist/
```

The app starts in **demo mode** with built-in sample data, so you can work on the UI before the backend exists.
Demo sign-in: `demo@medivault.lk` / `demo123`.

To use the real backend, copy `.env.example` to `.env` (it sets `VITE_USE_MOCK=false`) and start the Express server on port 5000.
The Vite dev server proxies `/api` to it.

## Pages

| Route | Who | What it does |
|---|---|---|
| `/` | Everyone | Search medicines, filter by category, see price and which pharmacies stock it |
| `/login` | Pharmacy user | Sign in with email, Google or Facebook |
| `/dashboard` | Pharmacy user | Stock summary, add, edit, delete medicines, low-stock and expiry flags |

Google and Facebook buttons initiate OAuth at `/api/auth/google` and `/api/auth/facebook` when the real backend is enabled. The backend must implement these routes, handle provider credentials and callbacks, create an application session, and return the user to the dashboard. This ZIP contains only the frontend; in demo mode the buttons explain that social sign-in is unavailable.

## API the frontend expects

Send the JWT as `Authorization: Bearer <token>`. Errors should return JSON like `{ "message": "..." }`.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user: { id, name, role, pharmacy_id } }` |
| GET | `/api/categories` | | `[{ id, name }]` |
| GET | `/api/medicines?search=&category=` | | `[{ id, name, generic_name, category_id, category_name, availability: [{ inventory_id, pharmacy_id, pharmacy_name, quantity, price, status, expiry_date }] }]` |
| GET | `/api/inventory` | (signed-in user's pharmacy, from token) | `[{ id, name, generic_name, category_id, category_name, quantity, price, status, expiry_date }]` |
| POST | `/api/inventory` | `{ name, generic_name, category_id, quantity, price, status, expiry_date }` | created item (create the medicine row if the name is new) |
| PUT | `/api/inventory/:id` | same as POST | updated item |
| DELETE | `/api/inventory/:id` | | `204` |

`status` is one of `in_stock`, `low`, `out_of_stock`.

## Docker and CI

- `Dockerfile` builds the app and serves it with nginx. `nginx.conf` forwards `/api` to a compose service named `backend` on port 5000.
- `.github/workflows/frontend-ci.yml` runs tests and a build on every push and pull request.
  It expects this project to live in a `frontend/` folder of your repo, with `.github/` moved to the repo root.
  Run `npm install` once and commit `package-lock.json` so `npm ci` works.

## Project layout

```
src/
  main.jsx, App.jsx      app shell and routes
  auth.jsx               login state and protected routes
  api.js, mockData.js    real API calls and demo data
  utils.js               status and date helpers (tested in utils.test.js)
  pages/                 Search, Login, Dashboard
  components/            StatusBadge, ItemForm
  styles.css
```
