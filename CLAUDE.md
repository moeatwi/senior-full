# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**All Connections Store (ACS)** — a networking products e-commerce site. React 19 frontend (Create React App) + Node.js/Express backend, both connected to Supabase (PostgreSQL + Auth).

## Commands

### Frontend (root directory)
```bash
npm install          # Install dependencies
npm start            # Dev server at http://localhost:3000
npm run build        # Production build
npm test             # Run tests
```

### Backend (`server/` directory)
```bash
cd server
npm install
npm run dev          # Dev with nodemon (hot reload)
npm start            # Production start
```

### Environment Variables

**Frontend** — create `.env` in the root:
```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
REACT_APP_API_URL=http://localhost:4000
```

**Backend** — create `.env` in `server/`:
```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
PORT=4000
```

## Architecture

### Data Flow — Two Separate Service Layers

There are **two distinct `productService` objects** that serve different purposes:

- **`src/services/productService.js`** — REST client; fetches products from the Express backend via `REACT_APP_API_URL`. Used by `ProductContext` for all public-facing pages (Shop, Home, Search, ProductDetail).

- **`src/services/AdminService.js`** — Supabase JS client (direct DB access); used exclusively by the Admin panel for authenticated CRUD. Also exports `adminService` for managing the `allowed_admins` table.

### Context Providers (Provider Order Matters)

`App.js` wraps the app in three nested providers:
1. `AuthProvider` — outermost; holds Supabase auth session, exposes `user`, `login` (OTP magic link), `logout`, `isAdmin`
2. `ProductProvider` — fetches all products from backend on mount via `productService.getAllProducts()`
3. `CartProvider` — in-memory cart state only; **no persistence** (cart resets on page refresh)

### Admin Authentication Flow

Admin access uses **Supabase magic link (OTP)** — no password:
1. User enters email on `/login`
2. `AuthContext.login()` checks email against `allowed_admins` Supabase table
3. If allowed, sends OTP email; link redirects to `/auth/callback`
4. `ProtectedRoute` wraps `/admin` — re-checks `isAdmin()` on every access (async whitelist check against Supabase)

### Backend Structure

The Express server (`server/server.js`) initializes a single Supabase admin client with the service key and passes it as a dependency to two router factories:
- `createAuthRouter(supabase)` → `/api/auth` (signup/login/logout — mostly unused by frontend)
- `createProductsRouter(supabase)` → `/api/products` (public CRUD + search)

The backend uses ESM (`"type": "module"` in `server/package.json`).

### Product Schema

Products are identified by `pid` (a custom string like `tplink-1234567890`) used in URLs (`/product/:productId`) and as the primary key in admin operations. The Supabase auto-generated `id` (UUID) also exists but is secondary. Key fields: `pid`, `name`, `category`, `subcategory`, `price`, `stock`, `availability`, `description`, `image`, `specs`, `featured`, `newarrival`, `bestseller`.

### Static Data

`src/data/products.js` exports `categories` (array of `{id, name}` objects). Product data itself is stored in Supabase, not in static files.

### Deployment

Deployed on Render (`render.yaml`): backend as a Node web service, frontend as a static site. CORS in `server.js` explicitly allows `localhost:3000`, the Render frontend URL, and a GitHub Pages URL.
