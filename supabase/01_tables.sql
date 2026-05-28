-- ============================================================
-- TABLE: products
-- ============================================================
create table products (
  id            uuid        default gen_random_uuid() primary key,
  pid           text        unique not null,
  name          text        not null,
  category      text,
  subcategory   text,
  price         numeric     not null,
  stock         integer     not null default 0,
  availability  text,
  description   text,
  image         text,
  featured      boolean     not null default false,
  newarrival    boolean     not null default false,
  bestseller    boolean     not null default false,
  specs         jsonb,
  created_at    timestamptz not null default now()
);

-- ============================================================
-- TABLE: allowed_admins
-- ============================================================
create table allowed_admins (
  id         uuid        default gen_random_uuid() primary key,
  email      text        unique not null,
  created_at timestamptz not null default now()
);
