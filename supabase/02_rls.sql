-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================

-- products ---------------------------------------------------
alter table products enable row level security;

-- Anyone (including unauthenticated visitors) can read products
create policy "products_read_public"
  on products for select
  using (true);

-- Only authenticated admins can insert/update/delete
create policy "products_write_admin"
  on products for all
  using (
    exists (
      select 1 from allowed_admins
      where email = auth.email()
    )
  )
  with check (
    exists (
      select 1 from allowed_admins
      where email = auth.email()
    )
  );

-- allowed_admins ---------------------------------------------
alter table allowed_admins enable row level security;

-- Anon role must be able to read to check if an email is whitelisted
-- (this check happens before the magic link is sent, so no session exists yet)
create policy "allowed_admins_read_public"
  on allowed_admins for select
  using (true);

-- Only authenticated admins can insert/update/delete rows
-- (must be split by operation — FOR ALL on this table causes infinite recursion
--  because the USING sub-query reads allowed_admins, re-triggering the same policy)
create policy "allowed_admins_insert_admin"
  on allowed_admins for insert
  with check (
    exists (select 1 from allowed_admins where email = auth.email())
  );

create policy "allowed_admins_update_admin"
  on allowed_admins for update
  using (
    exists (select 1 from allowed_admins where email = auth.email())
  )
  with check (
    exists (select 1 from allowed_admins where email = auth.email())
  );

create policy "allowed_admins_delete_admin"
  on allowed_admins for delete
  using (
    exists (select 1 from allowed_admins where email = auth.email())
  );
