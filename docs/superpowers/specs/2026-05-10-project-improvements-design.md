# ACS — Project Improvements Design Spec
**Date:** 2026-05-10  
**Deadline:** 7 days from spec date  
**Goal:** Feature breadth to satisfy LIU senior project report structure  
**Approach:** Foundation-first (Day 1–2 schema + auth, then features in waves)

---

## Section 1: Architecture

### What stays
- React 19 + Create React App frontend
- Node.js / Express backend (`server/`)
- Supabase (PostgreSQL + Auth + Storage + Realtime)
- Existing pages: Home, Shop, ProductDetail, Cart, Search, About, Admin, Login, AuthCallback

### Frontend additions
- 4 new pages: `/wishlist`, `/compare`, `/chat`, `/account`
- 3 new contexts: `NotificationContext`, `CompareContext`, extended `AuthContext`
- 2 new global components: notification bell in Navbar, floating AI chat widget
- Dark mode: `data-bs-theme` toggle on `<html>`, localStorage-persisted

### Backend additions
- New route file: `server/ai.js` — proxies questions to Claude API with product catalog as context
- Mounted at `/api/ai` in `server/server.js`
- All other new features (cart, wishlist, reviews, chat, notifications) use Supabase JS client directly from frontend, consistent with existing `AdminService.js` pattern

### Supabase additions
- 12 new tables (see Section 2)
- 1 Storage bucket: `product-images` (public read, authenticated write)
- Realtime enabled on: `messages`, `notifications`
- Row Level Security (RLS) enforced on all customer-facing tables

---

## Section 2: Database Schema

### Modified existing tables

#### `products`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
pid           varchar UNIQUE NOT NULL
name          varchar NOT NULL
category_id   uuid REFERENCES categories(id) ON DELETE RESTRICT
brand_id      uuid REFERENCES brands(id) ON DELETE RESTRICT
subcategory   varchar
price         float NOT NULL CHECK (price >= 0)
stock         int NOT NULL DEFAULT 0 CHECK (stock >= 0)
availability  varchar
description   text
image         varchar  -- kept as cover/fallback; deprecated once product_images is populated
specs         text
featured      boolean DEFAULT false
newarrival    boolean DEFAULT false
bestseller    boolean DEFAULT false
created_at    timestamp DEFAULT now()
```

#### `allowed_admins`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
email         varchar UNIQUE NOT NULL
created_at    timestamp DEFAULT now()
```
> Soft reference to `auth.users.email` — Supabase does not allow FK into the `auth` schema. Enforced at application level in `AuthContext.isEmailWhitelisted()`. Cleanup on user deletion requires an Edge Function trigger.

---

### New tables

#### `user_profiles`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
display_name  varchar
phone         varchar
role          varchar NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'admin'))
created_at    timestamp DEFAULT now()
```

#### `categories`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
name          varchar UNIQUE NOT NULL
image_url     varchar
created_at    timestamp DEFAULT now()
```

#### `brands`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
name          varchar UNIQUE NOT NULL
logo_url      varchar
created_at    timestamp DEFAULT now()
```

#### `product_images`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
product_pid   varchar NOT NULL REFERENCES products(pid) ON DELETE CASCADE
image_url     varchar NOT NULL   -- Supabase Storage public URL
display_order int NOT NULL DEFAULT 0
created_at    timestamp DEFAULT now()
```
> `display_order = 0` is the primary image, replacing `products.image` as the canonical cover.

#### `wishlist`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
product_pid   varchar NOT NULL REFERENCES products(pid) ON DELETE CASCADE
added_at      timestamp DEFAULT now()
UNIQUE (user_id, product_pid)
```

#### `cart_items`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
product_pid   varchar NOT NULL REFERENCES products(pid) ON DELETE CASCADE
quantity      int NOT NULL DEFAULT 1 CHECK (quantity >= 1)
added_at      timestamp DEFAULT now()
UNIQUE (user_id, product_pid)
```
> UNIQUE enforces one row per product per user — quantity updates the existing row on duplicate add.

#### `quote_requests`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
status        varchar NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'reviewed', 'responded'))
created_at    timestamp DEFAULT now()
```

#### `quote_request_items`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
quote_request_id  uuid NOT NULL REFERENCES quote_requests(id) ON DELETE CASCADE
product_pid       varchar NOT NULL REFERENCES products(pid) ON DELETE RESTRICT
quantity          int NOT NULL CHECK (quantity >= 1)
```
> RESTRICT on `products.pid`: admin cannot delete a product referenced in any quote request.

#### `product_reviews`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
product_pid   varchar NOT NULL REFERENCES products(pid) ON DELETE CASCADE
rating        int NOT NULL CHECK (rating BETWEEN 1 AND 5)
comment       text
created_at    timestamp DEFAULT now()
UNIQUE (user_id, product_pid)
```

#### `conversations`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
status        varchar NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
created_at    timestamp DEFAULT now()
```

#### `messages`
```sql
id                uuid PRIMARY KEY DEFAULT gen_random_uuid()
conversation_id   uuid NOT NULL REFERENCES conversations(id) ON DELETE CASCADE
sender_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL
content           text NOT NULL
is_read           boolean DEFAULT false
created_at        timestamp DEFAULT now()
```
> SET NULL on `sender_id`: message content preserved for admin audit trail if user account is deleted.

#### `notifications`
```sql
id            uuid PRIMARY KEY DEFAULT gen_random_uuid()
user_id       uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
type          varchar NOT NULL CHECK (type IN ('chat_reply', 'quote_update', 'review_response'))
message       text NOT NULL
link          varchar
is_read       boolean DEFAULT false
created_at    timestamp DEFAULT now()
```

---

### Cascade Summary

| Table | FK Target | ON DELETE |
|---|---|---|
| `user_profiles.user_id` | `auth.users.id` | CASCADE |
| `products.category_id` | `categories.id` | RESTRICT |
| `products.brand_id` | `brands.id` | RESTRICT |
| `product_images.product_pid` | `products.pid` | CASCADE |
| `wishlist.user_id` | `auth.users.id` | CASCADE |
| `wishlist.product_pid` | `products.pid` | CASCADE |
| `cart_items.user_id` | `auth.users.id` | CASCADE |
| `cart_items.product_pid` | `products.pid` | CASCADE |
| `quote_requests.user_id` | `auth.users.id` | CASCADE |
| `quote_request_items.quote_request_id` | `quote_requests.id` | CASCADE |
| `quote_request_items.product_pid` | `products.pid` | RESTRICT |
| `product_reviews.user_id` | `auth.users.id` | CASCADE |
| `product_reviews.product_pid` | `products.pid` | CASCADE |
| `conversations.user_id` | `auth.users.id` | CASCADE |
| `messages.conversation_id` | `conversations.id` | CASCADE |
| `messages.sender_id` | `auth.users.id` | SET NULL |
| `notifications.user_id` | `auth.users.id` | CASCADE |

---

### RLS Policies

| Table | Customer | Admin |
|---|---|---|
| `user_profiles` | read/write own row only | read/write all |
| `wishlist` | read/write own rows only | read all |
| `cart_items` | read/write own rows only | read all |
| `quote_requests` | read/write own rows only | read/write all |
| `quote_request_items` | read own rows only | read/write all |
| `product_reviews` | read all, write own only | read/write all |
| `conversations` | read/write own only | read/write all |
| `messages` | read/write own conversation only | read/write all |
| `notifications` | read/write own only | — |
| `categories` | read only | read/write |
| `brands` | read only | read/write |
| `product_images` | read only | read/write |

---

## Section 3: Feature Breakdown by Wave

### Day 1–2: Foundation
- Create all 12 new Supabase tables with constraints and cascades
- Enable RLS, write all policies per table above
- Create `product-images` Storage bucket (public read)
- Enable Realtime on `messages` and `notifications`
- Migrate `products.category` string → `category_id` FK; seed `categories` and `brands` from `src/data/products.js`
- Extend `AuthContext`: on login, upsert `user_profiles`, expose `role` and `userProfile`
- Create `NotificationContext`: Realtime subscription on `notifications` for logged-in user; exposes `{ unreadCount, notifications, markRead }`
- Add notification bell + dark mode toggle to `Navbar`

### Day 3–4: Auth-Dependent Features
- **Persistent cart**: replace `CartContext` in-memory state with Supabase `cart_items`; stock check on add
- **Request a Quote**: cart page button → inserts `quote_requests` + `quote_request_items`, clears cart, shows confirmation toast
- **Wishlist**: heart icon on `ProductCard`, `/wishlist` page, move-to-cart, login-gate redirect
- **Product reviews**: review form + star display on `ProductDetail`, live average from `product_reviews`
- **`/account` page**: tabs — Cart, Wishlist, Quote Requests (with status badge), Reviews
- **`user_profiles`**: auto-created on first login; display name + phone editable in `/account`

### Day 5: Realtime Features
- **Live chat**: `conversations` + `messages` tables; `/chat` page for customers; admin Messages tab (shared inbox); Supabase Realtime on `messages`
- **Notification bell wiring**: admin reply to chat → insert `notifications` row → customer bell updates live
- **Quote status flow**: admin updates status → insert notification → customer sees update in `/account` and bell
- **Admin Reviews tab**: list all reviews, delete action

### Day 6: Auth-Independent Features
- **Categories + brands**: admin CRUD tabs; RESTRICT warning on delete; `src/data/products.js` retired
- **Multiple images**: Supabase Storage uploader in admin product form; gallery + thumbnail strip on `ProductDetail`
- **Advanced filtering**: price range slider, multi-select brands/categories, active filter chips, live results count — all client-side
- **Dark mode**: `data-bs-theme` on `<html>`, sun/moon icon in navbar, localStorage
- **Product comparison**: `CompareContext` (localStorage, max 3); "Add to Compare" on `ProductCard`; `/compare` side-by-side table; category mismatch warning
- **Related products**: category-first Supabase query on `ProductDetail`; horizontal scrollable strip; in-stock only
- **Recently viewed**: localStorage push on every `ProductDetail` visit; strip at bottom of detail page
- **Dynamic shop filters**: categories and brands fetched from Supabase, not static file

### Day 7: AI + Admin Analytics + Polish + Screenshots
- **AI assistant**: `server/ai.js`, `/api/ai` route, Claude API (claude-haiku-4-5), product catalog injected as context, rate-limited (10 req/IP/min), floating chat widget on all pages
- **Admin Analytics tab**: total users, open conversations, most wishlisted, most reviewed, new users this week, conversations today
- **Admin product analytics**: sortable table — name, wishlist count, review count, avg rating, stock
- **Admin `allowed_admins` tab**: also manages `user_profiles.role`
- **Polish**: loading skeletons, empty states, error boundaries, toast confirmations on all mutations
- **Screenshots**: every page in light + dark mode for report Chapter 4

---

## Section 4: Routes & Pages

### New routes
```
/wishlist        <WishlistPage />     ProtectedRoute (any logged-in user)
/compare         <ComparePage />      Public
/chat            <ChatPage />         ProtectedRoute (any logged-in user)
/account         <AccountPage />      ProtectedRoute (any logged-in user)
```

### Upgraded existing routes
```
/shop            + price slider, multi-select, filter chips, live count, dynamic filters
/product/:pid    + image gallery, star rating, review form, related products, recently viewed
/cart            + Supabase persistence, stock validation, Request a Quote button
/auth/callback   + user_profiles upsert on first login
/admin           + 5 new tabs: Categories, Brands, Reviews, Messages, Analytics
```

### New global components
```
Navbar           + dark mode toggle (sun/moon icon)
                 + notification bell with unread badge
                 + Chat link → /chat
AI widget        Floating bottom-right button, expands to chat panel
                 Present on all pages, no auth required
                 Message history in component state only (no DB)
```

### New contexts
```
NotificationContext   Realtime sub on notifications; { unreadCount, notifications, markRead }
CompareContext         localStorage, max 3 products; { compareList, addToCompare,
                       removeFromCompare, clearCompare }
```

### Removed
- `src/data/products.js` categories array → replaced by live Supabase query
- Single image URL input in admin product form → replaced by Supabase Storage multi-image uploader

---

## Section 5: AI Assistant

### Purpose
Floating chat widget on all pages. Customers ask natural language questions about networking products ("best access point for a warehouse under $150?") and receive answers grounded in the actual product catalog.

### Architecture
```
Customer question
      ↓
POST /api/ai { question }
      ↓
server/ai.js:
  1. Fetch all products from Supabase (name, description, specs, price, stock, availability)
  2. Filter to in-stock only before injecting
  3. Build system prompt with catalog as context
  4. Send to Claude API (claude-haiku-4-5 — fast, cost-effective)
  5. Stream response back to frontend
      ↓
Widget renders streamed response with typing indicator
```

### System prompt constraints
- Recommend only products currently in stock
- Always include product name and price in recommendations
- Redirect off-topic questions politely
- Never invent products not in the catalog

### Rate limiting
- Max 10 requests per IP per minute
- Returns HTTP 429 with friendly message if exceeded

### Environment variable required
```
ANTHROPIC_API_KEY=...   # in server/.env
```

### Widget behavior
- Floating button bottom-right (chat bubble icon), expands to 400px panel
- Message history in React state only — clears on page refresh, no DB persistence
- No auth required — available to guests and logged-in users alike
- Visually distinct from the customer↔admin live chat (different icon, different color)

---

## Feature Inventory

| # | Feature | New DB Entity | Auth Required | Day |
|---|---|---|---|---|
| 1 | Customer auth + role | `user_profiles` | — | 1–2 |
| 2 | Persistent cart + stock validation + Request a Quote | `cart_items`, `quote_requests`, `quote_request_items` | Yes | 3–4 |
| 3 | Wishlist | `wishlist` | Yes | 3–4 |
| 4 | Product reviews + live star average + admin delete | `product_reviews` | Yes | 3–4 |
| 5 | Live chat (Supabase Realtime) | `conversations`, `messages` | Yes | 5 |
| 6 | In-app notification bell (Supabase Realtime) | `notifications` | Yes | 5 |
| 7 | AI chat assistant (RAG on catalog) | — | No | 7 |
| 8 | Admin analytics dashboard | — | Admin | 7 |
| 9 | Product comparison | — | No | 6 |
| 10 | Multiple images via Supabase Storage | `product_images` | Admin (write) | 6 |
| 11 | Advanced filtering (slider, multi-select, chips) | — | No | 6 |
| 12 | Customer /account page + quote status | — | Yes | 3–4 |
| 13 | Categories + brands in DB + admin CRUD | `categories`, `brands` | Admin (write) | 6 |
| 14 | Dark mode | — | No | 6 |
| 15 | Related products | — | No | 6 |
| 16 | Recently viewed | — | No | 6 |
