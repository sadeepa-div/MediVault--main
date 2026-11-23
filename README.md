# Medi_vault

A web app that connects people with pharmacies so they can find and order medicine easily.

- **Frontend:** React 18 + Vite, React Router, Recharts (charts), Lucide icons
- **Backend:** Node.js + Express REST API, JWT login, bcrypt passwords, Multer image uploads
- **Database:** MySQL 8 (schema + seed data in `database/`)

## Features

### Customers
- Search medicine by name, generic name, category or pharmacy; filter by category, city and stock; sort by price
- Each item shows its image, price, availability, shop name and shop contact number
- Medicine details page with description, prescription flag, the pharmacy's address and hours, and a price comparison with other pharmacies that sell the same medicine
- Cart (one cart across many pharmacies; checkout makes one order per pharmacy)
- Payment methods: cash on delivery, card, bank transfer (shows each pharmacy's bank name, account number and account owner name)
- Order history with a status tracker, cancelling pending orders
- Feedback with 1 to 5 stars on medicines, pharmacies and completed orders
- Notifications when an order changes status

### Pharmacy owners
- Sign up with name, email, phone, birthday, ID (NIC) number, address, pharmacy name and pharmacy licence ("valid ID") number. Accounts stay **pending until an admin approves them**.
- Login with username (or email) and password
- Dashboard with sales analysis: revenue, orders, average order, daily revenue chart, best sellers, payment method split
- Shop open/closed toggle
- Order list with item, customer and payment details; confirm, mark ready, complete, reject, mark as paid
- Add, edit and delete medicines with photos
- Inventory with low-stock and out-of-stock alerts and quick restocking
- Read customer feedback with rating breakdown
- Notification alerts for new orders, low stock and new feedback
- Profile: owner photo, name, address, contact number, email, shop photo, shop details, opening hours, and bank account (bank name, account number, account owner name)

### Admin
- Approve or reject pharmacy owner sign-ups after checking their details
- Overall sales analysis for all medicine across all pharmacies: revenue over time, revenue by pharmacy, leaderboard, sales by category, top-selling medicines
- User list

## Setup

You need **Node.js 18+** and **MySQL 8**.

### 1. Create the database

```bash
mysql -u root -p < database/schema.sql
mysql -u root -p medi_vault < database/seed.sql
```

(In MySQL Workbench you can open and run the two files in the same order.)

The seed data adds 5 pharmacies (2 waiting for approval), 47 medicines, 70 sample orders over the last 45 days and some feedback, so the dashboards have something to show.

### 2. Configure and start the API

```bash
cd server
cp .env.example .env      # then put your MySQL password in .env
npm install
npm run dev               # http://localhost:5000
```

### 3. Start the React app

In a second terminal:

```bash
cd client
npm install
npm run dev               # http://localhost:5173
```

Open http://localhost:5173.

### Demo logins

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Pharmacy owner | `cityhealth`, `lifecare`, `wellness` | `owner123` |
| Owner waiting for approval | `greenleaf`, `medplus` | `owner123` |
| Customer | `nimal`, `kasuni`, `ruwan` | `user123` |

The login page also has one-click demo buttons.

### Production build

```bash
cd client && npm run build
cd ../server && npm start   # serves the API and the built React app on http://localhost:5000
```

## Project structure

```
database/      schema.sql (tables) and seed.sql (sample data)
server/        Express API
  src/routes/  auth, catalog (public), customer, owner, admin, notifications
  uploads/     uploaded medicine, owner and shop photos
  scripts/     gen_seed.js regenerates seed.sql
client/        React app
  src/pages/           customer pages
  src/pages/owner/     pharmacy owner dashboard
  src/pages/admin/     admin dashboard
  src/components/      shared UI
screenshots/   screenshots of the main pages
```

## Notes and assumptions

- **Card payment is a demo.** No money is charged. Connect a real gateway (for example PayHere or Stripe) before going live.
- **Bank transfer:** "Order details → account number, bank name, owner name" in the requirements was read as the pharmacy's bank account that customers pay into. Owners set it in their profile, customers see it at checkout and on the order, and owners mark the order as paid when the money arrives.
- Prices are in Sri Lankan rupees (Rs.) and the ID number is treated as a NIC number. Both are easy to change.
- Medicines without an uploaded photo show a coloured illustration based on their category.
- Delivery is free. There is no delivery fee or courier tracking yet.
