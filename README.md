# All Connections Store (ACS)

A full-stack e-commerce web application for a networking-equipment retailer.
Customers can browse, filter, and search a product catalogue, view detailed
specifications, build a shopping cart, and place orders via WhatsApp. A protected
admin dashboard lets authorized administrators manage products and admin access.

## Tech Stack

- **Frontend:** React 19 (Create React App), React Router 7, Bootstrap 5, Motion, Sonner
- **Backend:** Node.js, Express
- **Database & Auth:** Supabase (PostgreSQL, authentication, email)

## Project Structure

```
.
├── src/              # React frontend (pages, components, context, services)
├── public/           # Static assets and index.html
├── server/           # Express REST API (products + auth routers)
└── supabase/         # SQL schema and row-level-security policies
```

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project (PostgreSQL + Auth)

### 1. Database
Run the SQL files in `supabase/` against your Supabase project, in order:
`01_tables.sql`, `02_rls.sql`, then `03_seed_admin.sql` (after replacing the
placeholder with an admin email).

### 2. Backend
```bash
cd server
npm install
cp .env.example .env      # then fill in your Supabase values
npm run dev               # starts the API on http://localhost:4000
```

### 3. Frontend
```bash
npm install
cp .env.example .env      # then fill in your Supabase + API values
npm start                 # starts the app on http://localhost:3000
```

## Environment Variables

**Frontend (`.env`)**
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
REACT_APP_API_URL=http://localhost:4000
```

**Backend (`server/.env`)**
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
PORT=4000
```

## Available Scripts

**Frontend (root):** `npm start`, `npm run build`, `npm test`
**Backend (`server/`):** `npm run dev`, `npm start`
