# ACS Frontend Redesign — Handoff Document

> **Scope:** Complete dark-theme visual overhaul of the React 19 / Bootstrap 5.3 / CRA frontend for All Connections Store (networking products e-commerce, Lebanon).
> **Design Dials:** DESIGN_VARIANCE: 8 / MOTION_INTENSITY: 5 / VISUAL_DENSITY: 5
> **Aesthetic family:** Dark tech / premium B2B — NOT AI purple gradient slop. Orange (#f07228) is the one accent. Zinc-dark neutrals. No warm beige, no glassmorphism on everything.

---

## 1. WHAT HAS ALREADY BEEN DONE (do NOT redo)

### 1A. Bug Fixes (from the full audit pass)
- `server/index.js` — Fixed `SUPABASE_KEY` → `SUPABASE_SERVICE_KEY`; CORS locked to allowlist (localhost:3000 + FRONTEND_URL env var)
- `src/components/NavBar.js` — Fixed `auth.isAuthenticated` (undefined) → `auth.user`
- `src/pages/Home.js` — Fixed `/Shop` → `/shop` (React Router is case-sensitive); added `formatPrice` using `Intl.NumberFormat`
- `src/components/Footer.js` — Fixed `/Shop` → `/shop`; fixed logo from external CDN → local asset
- `src/context/ProductContext.js` — Fixed null-crash in fallback search (`.toLowerCase()` on null description field)
- `src/pages/Admin.js` — Fixed deprecated `onKeyPress` → `onKeyDown`
- `src/pages/Contact.js` — Fixed social links to real business URLs; removed inline `background: '#f7f7f9'` that fought dark theme; hero changed to `.page-hero`

### 1B. Design Files Written
- `src/App.css` — COMPLETE REWRITE. This is the single source of truth for the design system:
  - CSS custom properties (all tokens: `--bg-base #0b0c10`, `--accent #f07228`, etc.)
  - Full Bootstrap 5 overrides for dark theme (card, form, button, badge, table, alert, modal, pagination, list-group, input-group, breadcrumb, spinner)
  - Global body font (Plus Jakarta Sans via Google Fonts @import)
  - Scrollbar, `.App`, `.main-content`, `.page-hero`, `.spinner` utilities
  - Keyframes: spin, fade-up, fade-in, glow-pulse, slide-in-left
- `src/styles/NavBar.css` — Dark glassmorphic navbar (blur backdrop, border-bottom, 64px desktop / 56px mobile)
- `src/styles/Home.css` — Full dark hero (dvh-based height, accent glow orb, eyebrow chip, stats row) + brand grid + products grid + split new/best + trust cards
- `src/styles/ProductCard.css` — Dark surface card, orange border on hover, image scale
- `src/styles/Footer.css` — Dark footer using CSS variables throughout
- `src/styles/ProductDetail.css` — Dark breadcrumb, image wrapper, price pill, specs table, purchase box, related grid
- `src/styles/Search.css` — Dark search shell classes + dark search cards + badge variants
- `src/styles/About.css` — Dark hero (with accent radial glow), dark brand/value/stat cards

### 1C. JSX Files Updated
- `src/components/NavBar.js` — Rewritten to use `.acs-navbar`, `.navbar-search-form`, `.navbar-search-input`, `.navbar-search-btn`, `.navbar-cart-btn`, `.navbar-cart-badge`, `.navbar-right`, `.nav-link-admin`
- `src/App.js` — Added `<Toaster position="top-right" richColors />` from `sonner` (CRITICAL FIX — toasts were silently failing everywhere before this)
- `src/pages/LoginPage.js` — Rewritten to use Bootstrap classes (was a mass of inline light-colored styles that broke the dark theme)

---

## 2. WHAT STILL NEEDS TO BE DONE

### PRIORITY 1 — Functionality / Correctness (must verify these work)

#### 2.1 Build verification
The build has NOT been run after the CSS/JSX changes. Run `npm start` in root dir and check:
- Navbar renders correctly (blur, dark bg, orange accent on Admin link, search input expands on focus)
- Toaster shows toast when submitting the contact form (this was silently broken before)
- All routes load without white-flash (body bg is `#0b0c10` so there should be no flash)
- Cart badge appears correctly on the bag icon
- Logo loads from `/assets/brands/logo.png` (local)

#### 2.2 NavBar mobile collapse
The `.navbar-right` div is inside `collapse navbar-collapse`. On mobile it gets `width: 100%` and stacks the search + cart below the nav links. Verify this works visually. If the search input is too wide on small screens, add `max-width: 100%` to `.navbar-search-input` in mobile breakpoint.

#### 2.3 Admin link CSS specificity conflict
In NavBar.js, the admin button has classes: `nav-link nav-link-admin btn p-0 border-0`. Bootstrap's `.border-0` may override the `border: 1px solid var(--accent-border) !important` in `.nav-link-admin`. If the orange border doesn't show, change the NavBar.js class to just `nav-link nav-link-admin` and remove `btn p-0 border-0`, since the CSS already handles the appearance.

#### 2.4 `sonner` Toaster theme
The `<Toaster richColors />` will use light theme by default. Add `theme="dark"` prop: `<Toaster position="top-right" richColors theme="dark" />` in `src/App.js`.

---

### PRIORITY 2 — Design Taste (the redesign is not visually complete without these)

#### 2.5 Home.js JSX — Add eyebrow chip and hero stats (HIGH IMPACT)
The CSS for `.hero-eyebrow` and `.hero-stats` is written but the JSX doesn't render them. This is the biggest visible gap — the hero looks unfinished without the eyebrow tag and the social proof stats row.

**Current hero-content in Home.js:**
```jsx
<div className="hero-content">
  <h1 className="hero-title">
    Your Trusted Partner for
    <span className="hero-title-highlight"> Networking Solutions</span>
  </h1>
  <p className="hero-description">...</p>
  <div className="hero-buttons">...</div>
</div>
```

**What it should be:**
```jsx
<div className="hero-content">
  <div className="hero-eyebrow">
    Lebanon's #1 Networking Distributor
  </div>
  <h1 className="hero-title">
    Your Trusted Partner for
    <span className="hero-title-highlight"> Networking Solutions</span>
  </h1>
  <p className="hero-description">
    Discover top networking equipment from leading brands. From WiFi routers to enterprise switches, we have everything you need.
  </p>
  <div className="hero-buttons">
    <Link to="/shop" className="hero-button hero-button-primary">
      Shop Now
      <svg className="hero-button-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
    <Link to="/about" className="hero-button hero-button-secondary">
      Learn More
    </Link>
  </div>
  <div className="hero-stats">
    <div>
      <div className="hero-stat-value">10+</div>
      <div className="hero-stat-label">Years in business</div>
    </div>
    <div>
      <div className="hero-stat-value">6</div>
      <div className="hero-stat-label">Premium brands</div>
    </div>
    <div>
      <div className="hero-stat-value">1000+</div>
      <div className="hero-stat-label">Happy customers</div>
    </div>
  </div>
</div>
```

#### 2.6 Home.js JSX — Add section eyebrows (MEDIUM IMPACT)
The CSS has `.section-eyebrow` but JSX doesn't use it. Each section header should have a small orange all-caps label above the title.

**For "Shop by Brand" section:**
```jsx
<div className="section-header">
  <div className="section-eyebrow">Our Partners</div>
  <h2 className="section-title">Shop by Brand</h2>
  <p className="section-description">Explore our collection of premium networking brands</p>
</div>
```

**For "Featured Products" section:**
```jsx
<div className="section-header">
  <div className="section-eyebrow">Curated Selection</div>
  <h2 className="section-title">Featured Products</h2>
  <p className="section-description">Hand-picked products for your networking needs</p>
</div>
```

**Trust section — add a header:**
```jsx
{/* Before the trust-grid div, add: */}
<div className="section-header">
  <div className="section-eyebrow">Why Choose Us</div>
  <h2 className="section-title">Built on Trust</h2>
</div>
```

#### 2.7 Hero background image — replace Unsplash URL (MEDIUM IMPACT)
The hero currently loads from `https://images.unsplash.com/photo-...`. This is:
- A dependency on an external CDN (breaks if offline / URL expires)
- A very generic networking photo

**Options (pick one):**
- Replace with a local image in `public/assets/` (best)
- Or, since the image is just 14% opacity with saturation 0.3, it's almost invisible anyway — remove the `<img>` entirely and let the CSS gradient + accent glow do the visual work. This is cleaner and faster.

To remove the img: in `Home.js`, delete the `<img>` tag inside `.hero-background`. The `.hero-overlay` div still provides the gradient layer, and the `::after` pseudo-element provides the orange glow orb.

#### 2.8 About.js — Page hero still uses Bootstrap `bg-dark` (LOW IMPACT)
`About.js` line 20: `<section className="py-5 text-center bg-dark text-white">` — this works (App.css overrides `.bg-dark` to `var(--bg-surface)`) but it's inconsistent. Should use the `.page-hero` class like Contact.js now does:
```jsx
<section className="page-hero text-center">
  <div className="container">
    <h1 className="display-4 fw-bold">About Us</h1>
    <p className="lead mt-3">Your trusted networking solutions partner since 2013</p>
  </div>
</section>
```

#### 2.9 Shop.js — Page hero uses `bg-dark` (LOW IMPACT)
Same as above. `Shop.js` line 72: `<section className="py-5 text-center bg-dark text-white">` → Change to `<section className="page-hero text-center">`.

#### 2.10 CartPage.js — Inline styles / Bootstrap (LOW IMPACT)
CartPage uses Bootstrap table classes which are overridden in App.css. Should be acceptable. But do a visual check — if the table background leaks through as white, add: `background: transparent !important` to `.table > :not(caption) > * > *` (already in App.css, should work).

---

### PRIORITY 3 — Polish (nice to have, do after P1+P2)

#### 2.11 Motion — Subtle entrance animations
The `motion` package is installed (`npm install motion --legacy-peer-deps` completed). Consider adding motion to:
- Hero content: `initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}`
- Brand cards: stagger animation on load
- Product cards in Home: stagger

**Only use `motion` components in leaf client components.** Since this is CRA (not Next.js), there are no Server Components to worry about — all components are client-side already. Import from `motion/react`: `import { motion } from "motion/react"`.

**MOTION_INTENSITY is 5 — keep it restrained.** No springs, no physics, no infinite loops. Simple fade-up on mount, nothing more.

#### 2.12 Admin.css — Minor update
`src/styles/Admin.css` only has `.product-thumb` and `.product-name`. The Admin page uses Bootstrap classes extensively (table, form-control, btn, badge, card). All of these are overridden in App.css dark theme. The Admin page should look acceptable. But verify:
- The `product-name` class in Admin.css has `color` unset — it will inherit from Bootstrap which App.css overrides to `var(--text-primary)`. Fine.
- The product image thumbnails in the table should show on dark background correctly.

#### 2.13 Contact.js — The form labels
Contact.js uses `className="form-label fw-semibold"`. App.css overrides `.form-label { color: var(--text-secondary) }`. But `fw-semibold` doesn't change color, so labels will be `--text-secondary` (grey). That's correct for dark theme — no action needed.

#### 2.14 404 page
The catch-all `*` route in App.js renders a bare `<div className="container py-5 text-center">` with "Page Not Found". This will show on dark bg correctly (text inherits `--text-primary`). Acceptable as-is.

---

## 3. DESIGN SYSTEM REFERENCE

```css
/* All CSS variables are in src/App.css :root */

/* Backgrounds */
--bg-base:    #0b0c10   /* page background */
--bg-surface: #111318   /* cards, sections */
--bg-raised:  #191b23   /* inputs, raised elements */
--bg-overlay: #21242e   /* hover states, overlays */

/* Accent — ONE accent color, used everywhere, no exceptions */
--accent:        #f07228
--accent-hover:  #ff8c3e
--accent-dim:    rgba(240, 114, 40, 0.12)  /* backgrounds */
--accent-glow:   rgba(240, 114, 40, 0.28)  /* glow effects */
--accent-border: rgba(240, 114, 40, 0.4)   /* borders */

/* Text */
--text-primary:   #ebebf0   /* headings, main content */
--text-secondary: #8b8b9e   /* descriptions, labels */
--text-muted:     #4a4a5e   /* timestamps, hints */

/* Borders */
--border:        rgba(255,255,255,0.07)   /* subtle separators */
--border-mid:    rgba(255,255,255,0.11)   /* inputs, cards */
--border-strong: rgba(255,255,255,0.18)   /* active/hover borders */

/* Radii (PICK ONE SCALE and stick to it) */
--r-sm: 8px    /* buttons, inputs, small elements */
--r-md: 12px   /* cards, containers */
--r-lg: 16px   /* large cards */
--r-xl: 24px   /* modals, image wrappers */

/* Transitions */
--t:      0.28s cubic-bezier(0.16, 1, 0.3, 1)   /* standard */
--t-fast: 0.15s cubic-bezier(0.16, 1, 0.3, 1)   /* hover states */

/* Shadows */
--shadow-sm:     0 2px 8px rgba(0,0,0,0.45)
--shadow-md:     0 8px 24px rgba(0,0,0,0.55)
--shadow-lg:     0 20px 60px rgba(0,0,0,0.65)
--shadow-accent: 0 8px 28px rgba(240,114,40,0.3)  /* orange CTA glow */
```

---

## 4. DESIGN TASTE RULES TO ENFORCE (from design-taste-frontend skill)

These are the cardinal rules for this project. Violating them makes the UI look like "AI slop."

### COLOR CONSISTENCY LOCK
The accent is `#f07228`. This is the ONLY accent. No blue CTAs appearing in section 5. No teal badges. No random purple. Every interactive element that needs emphasis uses this exact orange. Badge `bg-primary` → orange. Active nav → orange. Price text → orange. Hover borders → orange. Everything else is a neutral.

### SHAPE CONSISTENCY LOCK
One border-radius scale. The scale is: buttons/inputs = `--r-sm (8px)`, cards = `--r-lg (16px)`, image wrappers = `--r-xl (24px)`. Do NOT mix. No pill buttons next to square cards. No 4px radius inputs next to 24px cards.

### BUTTON CONTRAST CHECK (mandatory before shipping)
Every button must pass WCAG AA:
- `.btn-primary` (orange bg) + white text → ✅ passes (ratio ~4.5:1)
- `.btn-outline-primary` (transparent bg, orange text) → check against `--bg-surface` and `--bg-raised` backgrounds — should pass at the font weights used
- Ghost buttons over photographic hero backgrounds → the hero overlay is dark enough that white text buttons are fine

### TYPOGRAPHY — No Serif Injection
The typeface is Plus Jakarta Sans (sans). Do NOT add a serif font for "premium feel." Do NOT use Fraunces, Instrument Serif, or any other LLM-default display serif. Bold sans display IS the premium move for a B2B tech brand.

### ANTI-CENTER BIAS
The hero is left-aligned (content in left half, glow orb in right half). Do NOT change the hero to centered layout. Centered heroes are the default and make every site look the same.

### NO AI PURPLE
There is no purple, violet, or blue anywhere in this design. The brand color is orange. If you find yourself reaching for blue because "it looks tech," stop and use orange or a neutral instead.

### MOTION RESTRAINT (MOTION_INTENSITY: 5)
If adding motion: fade-up on mount (opacity + translateY), 0.4-0.6s duration. No bounce, no spring physics, no rotate, no infinite loops, no scroll-jacking. The `motion` package is installed, use `motion/react`.

---

## 5. FILE MAP — WHAT EACH FILE DOES

```
src/
  App.css                     ← Design system (tokens + Bootstrap overrides). Do not touch without strong reason.
  App.js                      ← Provider tree + routing + <Toaster />

  components/
    NavBar.js                 ← Updated — uses .acs-navbar classes
    Footer.js                 ← Updated — logo fixed, social links real

  pages/
    Home.js                   ← NEEDS JSX updates (eyebrow, stats — see §2.5, §2.6)
    Shop.js                   ← Minor: hero class (see §2.9)
    About.js                  ← Minor: hero class (see §2.8)
    Contact.js                ← Updated — removed inline light styles
    LoginPage.js              ← Rewritten — now uses Bootstrap classes
    ProductDetail.js          ← Not touched — uses custom CSS classes, should look dark
    Search.js                 ← Not touched — uses custom CSS classes, should look dark
    Admin.js                  ← Not touched — Bootstrap-heavy, overridden in App.css
    CartPage.js               ← Not touched — Bootstrap table, overridden in App.css
    AuthCallback.js           ← Not touched — spinner + redirect

  styles/
    NavBar.css                ← COMPLETE REWRITE ✅
    Home.css                  ← COMPLETE REWRITE ✅
    ProductCard.css           ← COMPLETE REWRITE ✅
    Footer.css                ← COMPLETE REWRITE ✅
    ProductDetail.css         ← COMPLETE REWRITE ✅
    Search.css                ← COMPLETE REWRITE ✅
    About.css                 ← COMPLETE REWRITE ✅
    Admin.css                 ← Unchanged (minimal, Bootstrap handles it)
    Contact.css               ← Unchanged but UNUSED (Contact.js doesn't import it)

  context/
    ProductContext.js         ← Fixed: null-guard in search fallback
    AuthContext.js            ← Not touched
    CartContext.js            ← Not touched

  services/
    productService.js         ← REST client (used by ProductContext)
    AdminService.js           ← Supabase direct (used by Admin page)

server/
  index.js                    ← FIXED: service key + CORS allowlist
  products.js                 ← Not touched (search route correctly before :pid)
  auth.js                     ← Not touched
```

---

## 6. KNOWN RISKS / WATCH OUT FOR

1. **Bootstrap `collapse` and custom CSS**: The mobile menu collapse uses Bootstrap's `.show` class toggled by React state. If Bootstrap's JS bundle interferes (it shouldn't in CRA — Bootstrap JS is not imported, only CSS), the collapse won't animate. Current approach is pure React state + CSS class toggle, which is correct.

2. **`sticky-top` z-index**: The navbar uses Bootstrap's `sticky-top` which sets `z-index: 1020`. The blur effect requires the navbar to be positioned (it is — sticky). If modals appear behind the navbar, add `z-index: 1030` to modals (already in Bootstrap's defaults).

3. **Toaster theme prop**: Added `<Toaster position="top-right" richColors />` but did NOT add `theme="dark"`. The sonner Toaster's `richColors` on dark background may look inconsistent. Add `theme="dark"` to the Toaster props.

4. **`motion` peer dep conflict**: Installed with `--legacy-peer-deps`. If anyone runs `npm install` without the flag and it fails, they need to use `npm install --legacy-peer-deps` or pin the React 19 compat version of motion.

5. **Plus Jakarta Sans loading**: Loaded via CSS `@import` (Google Fonts CDN). If the user is offline, falls back to system sans-serif. This is acceptable for a business site. The `font-display: swap` is handled by Google Fonts' CDN response headers.

6. **Hero Unsplash image**: `Home.js` loads `https://images.unsplash.com/photo-1745847768408-b7b83796cae6?w=1200`. This is an external dependency. If this URL goes 404 the `<img>` shows nothing (which is fine since the image is nearly invisible at 14% opacity). Consider removing the img and relying on the CSS gradient + glow orb (see §2.7).

---

## 7. HOW TO VERIFY THE REDESIGN LOOKS CORRECT

After making the remaining JSX changes (§2.5–2.9), start the dev server:
```bash
npm start
```

Check these routes in order:
1. `/` (Home) — Hero must be full-screen height, dark, orange glow orb right side, left-aligned text with eyebrow chip + stats row
2. `/shop` — Dark header, dark filter sidebar, product grid dark cards
3. `/product/:pid` — Dark breadcrumb, dark image wrapper, orange price pill, dark purchase box
4. `/about` — Dark hero with accent glow, dark brand cards, dark stat cards
5. `/contact` — Dark hero (`.page-hero`), dark card form (no light background)
6. `/search?q=tp-link` — Dark search header, dark product cards in results
7. `/login` — Dark centered card, dark input, orange submit button
8. `/cart` — Dark table, correct Bootstrap override

**Quick visual checklist:**
- [ ] Body background is `#0b0c10` (near-black, not pure black, not white)
- [ ] Navbar has blur/glass effect (visible when scrolled over content)
- [ ] All card borders are subtle (`rgba(255,255,255,0.07)`)
- [ ] Hover state on cards shows orange border
- [ ] All prices display as orange text
- [ ] All CTAs are orange (no blue buttons anywhere)
- [ ] Toast appears in top-right when submitting the contact form
- [ ] Cart badge shows on bag icon when items added
- [ ] Mobile: hamburger menu opens, search + cart stack below links
