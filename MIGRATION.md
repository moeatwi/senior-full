# Migration Checklist

## What was already done for you

- Removed all hardcoded admin emails — auth now relies solely on the Supabase `allowed_admins` table
- CORS no longer references old accounts — backend reads `FRONTEND_URL` from env
- `render.yaml` references replaced with `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` placeholders
- Both `.env` files wiped of old credentials and added to `.gitignore`
- Hardcoded old Render/GitHub URLs removed from source code

---

## Step 1 — Supabase new project setup

1. In your new Supabase project, go to **SQL Editor** and run:

```sql
create table allowed_admins (
  id uuid default gen_random_uuid() primary key,
  email text unique not null,
  created_at timestamptz default now()
);
```

2. Insert your admin email:

```sql
insert into allowed_admins (email) values ('YOUR_ADMIN_EMAIL');
```

3. Go to **Authentication → URL Configuration**:
   - Add your Render frontend URL to **Redirect URLs** (you get this after deploying — add it once you have it, e.g. `https://acs-frontend-xxxx.onrender.com/**`)

4. Collect these values from **Project Settings → API**:
   - `Project URL` → `SUPABASE_URL` / `REACT_APP_SUPABASE_URL`
   - `anon public` key → `REACT_APP_SUPABASE_ANON_KEY`
   - `service_role` key → `SUPABASE_SERVICE_KEY`

---

## Step 2 — Push to new GitHub

Run these commands from the project root (`ACS-main/`):

```bash
git init
git add .
git commit -m "initial commit"
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Deploy backend on Render

1. In Render, click **New → Web Service**, connect your GitHub repo.
2. Set **Root Directory** to `server`.
3. Build command: `npm install`
4. Start command: `node server.js`
5. Add these environment variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | from Supabase Step 1 |
| `SUPABASE_SERVICE_KEY` | from Supabase Step 1 |
| `FRONTEND_URL` | your Render frontend URL (add after Step 4, then redeploy) |
| `PORT` | `10000` |

6. Deploy. Copy the backend URL (e.g. `https://acs-backend-xxxx.onrender.com`).

---

## Step 4 — Deploy frontend on Render

1. In Render, click **New → Static Site**, connect the same GitHub repo.
2. Build command: `npm install && npm install @supabase/supabase-js && npm run build`
3. Publish directory: `build`
4. Add these environment variables:

| Key | Value |
|-----|-------|
| `REACT_APP_SUPABASE_URL` | from Supabase Step 1 |
| `REACT_APP_SUPABASE_ANON_KEY` | from Supabase Step 1 |
| `REACT_APP_API_URL` | backend URL from Step 3 |
| `CI` | `false` |

5. Deploy. Copy the frontend URL (e.g. `https://acs-frontend-xxxx.onrender.com`).

---

## Step 5 — Wire everything together

1. Go back to **backend service on Render** → update `FRONTEND_URL` to your frontend URL from Step 4 → **Manual Deploy**.
2. Go back to **Supabase → Authentication → URL Configuration** → add your frontend URL to Redirect URLs: `https://acs-frontend-xxxx.onrender.com/**`

---

## Step 6 — Local dev (optional)

Fill in `.env` at the project root:

```
REACT_APP_SUPABASE_URL=...
REACT_APP_SUPABASE_ANON_KEY=...
REACT_APP_API_URL=http://localhost:4000
```

Fill in `server/.env`:

```
SUPABASE_URL=...
SUPABASE_SERVICE_KEY=...
PORT=4000
```
