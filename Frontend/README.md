# MediVault frontend

React (Vite) frontend for the MediVault Medicine Availability Management System.

## Run it

```bash
cd Backend
npm install
npm run dev      # Express API on http://localhost:5001
```

In a second terminal:

```bash
cd Frontend
npm install
Copy-Item .env.example .env   # PowerShell; copy .env.example .env on other shells
npm run dev                   # http://localhost:5173
npm test                      # unit tests (Vitest)
npm run build                 # production build in dist/
```

The frontend uses the real backend by default. Vite forwards `/api` requests to `http://localhost:5001`; make sure the backend `.env` has valid MySQL settings and that MySQL is running. Set `VITE_USE_MOCK=true` in `Frontend/.env` only when you want the demo data.

## Pages

| Route | Who | What it does |
|---|---|---|
| `/` | Everyone | Sign in or create an account |
| `/dashboard` | Signed-in user | Account details and medicine/pharmacy summary |
| `/medicine-search` | Signed-in user | Search medicine availability across pharmacies |
| `/medicine-management` | Admin | Create, edit and delete medicines |
| `/pharmacy-management` | Admin | Create, edit and delete pharmacies |

Google sign-in uses the backend's `POST /api/auth/google` endpoint and requires `GOOGLE_CLIENT_ID`. Facebook sign-in is not implemented by the current backend.

## Backend API

The frontend sends authenticated requests with `Authorization: Bearer <token>`. Errors return JSON like `{ "message": "..." }`.

| Method | Endpoint | Request | Response |
|---|---|---|---|
| POST | `/api/auth/register` | `{ fullName, email, password, birthday, phone }` | `{ message, user }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ token, user }` |
| GET | `/api/auth/me` | Authenticated | `{ user }` |
| GET | `/api/medicines/summary` | Authenticated | Medicine and pharmacy counts |
| GET | `/api/medicines` | Authenticated | Medicine catalogue |
| GET | `/api/medicines/search?q=` | Authenticated | Medicine availability rows |
| POST | `/api/medicines` | Admin; medicine fields | Create a medicine |
| PUT/DELETE | `/api/medicines/:id` | Admin; medicine fields for PUT | Update or delete a medicine |
| GET | `/api/pharmacies` | Authenticated | Pharmacy list |
| POST | `/api/pharmacies` | Admin; pharmacy fields | Create a pharmacy |
| PUT/DELETE | `/api/pharmacies/:id` | Admin; pharmacy fields for PUT | Update or delete a pharmacy |
| GET | `/api/stock` | Authenticated | Pharmacy stock rows |
| POST | `/api/stock` | Admin; `pharmacyId`, `medicineId`, `quantity`, `price` | Create stock |
| PUT/DELETE | `/api/stock/:id` | Admin; stock fields for PUT | Update or delete stock |

## Docker and CI

- `Dockerfile` builds the app and serves it with nginx. `nginx.conf` forwards `/api` to a compose service named `backend` on port 5001.
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
