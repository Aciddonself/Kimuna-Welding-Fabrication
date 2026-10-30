-- ============================================================
--  KIMUNA · Supabase / PostgreSQL schema
--  Run in the Supabase SQL editor (SQL → New query → paste).
-- ============================================================

create extension if not exists "pgcrypto";

-- ---------- admin users (JWT identity, bcrypt password) ----------
create table if not exists admin_users (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  password_hash text not null,
  full_name     text,
  role          text not null default 'editor' check (role in ('superadmin','editor')),
  last_login_at timestamptz,
  created_at    timestamptz not null default now()
);

-- ---------- quote / contact-form requests ----------
create table if not exists quotes (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text not null,
  service    text not null,
  message    text not null,
  status     text not null default 'new' check (status in ('new','contacted','quoted','closed')),
  notes      text default '',
  created_at timestamptz not null default now()
);

-- ---------- projects (public gallery) ----------
create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  description text default '',
  category    text not null check (category in ('steel','fabrication','furniture','civil')),
  image_url   text not null,
  location    text default '',
  year        text default '',
  published   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- furniture / products ----------
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  description text default '',
  price       integer not null check (price >= 0),
  category    text not null check (category in ('office','home','hospitality','school')),
  image_url   text not null,
  stock       boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------- training sign-ups ----------
create table if not exists training_enquiries (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  phone      text not null,
  email      text not null,
  programme  text not null check (programme in ('technical','safety')),
  cohort     text default '',
  status     text not null default 'new' check (status in ('new','contacted','enrolled')),
  created_at timestamptz not null default now()
);

-- ---------- testimonials ----------
create table if not exists testimonials (
  id        uuid primary key default gen_random_uuid(),
  name      text not null,
  role      text default '',
  quote     text not null,
  rating    smallint not null default 5 check (rating between 1 and 5),
  approved  boolean not null default false,
  hidden    boolean not null default false,
  created_at timestamptz not null default now()
);

-- ---------- single-row site settings ----------
create table if not exists site_settings (
  id         smallint primary key default 1 check (id = 1),
  phone1     text not null default '+256 772 284451',
  phone2     text not null default '+256 791 696970',
  email      text not null default 'kqualityw@gmail.com',
  address    text not null default 'Diika Road, Bweyale Town Council, Kiryandongo District, Uganda',
  facebook   text default '',
  instagram  text default '',
  linkedin   text default '',
  x          text default '',
  updated_at timestamptz not null default now()
);
insert into site_settings (id) values (1) on conflict do nothing;

-- ---------- indexes ----------
create index if not exists quotes_status_idx  on quotes (status);
create index if not exists quotes_created_idx on quotes (created_at desc);
create index if not exists projects_pub_idx   on projects (published, created_at desc);
create index if not exists products_cat_idx   on products (category);

-- ============================================================
--  Row Level Security: public site reads, API writes with the
--  service-role key (never exposed to the browser).
-- ============================================================
alter table quotes               enable row level security;
alter table projects             enable row level security;
alter table products             enable row level security;
alter table training_enquiries   enable row level security;
alter table testimonials         enable row level security;
alter table site_settings        enable row level security;
alter table admin_users          enable row level security;

-- anon may read published content only
create policy "public read projects"  on projects   for select using (published = true);
create policy "public read products"  on products   for select using (true);
create policy "public read testimonials" on testimonials for select using (approved = true and hidden = false);
create policy "public read settings"  on site_settings for select using (true);

-- everything else goes through the service-role key on the server,
-- which bypasses RLS. Enable anon inserts for the contact form:
create policy "public insert quotes"  on quotes     for insert with check (true);
create policy "public insert training" on training_enquiries for insert with check (true);

-- ============================================================
--  Storage bucket for project/product images (Dashboard → Storage)
-- ============================================================
-- insert into storage.buckets (id, name, public) values ('kimuna-media','kimuna-media', true);
-- create policy "public read media" on storage.objects for select using (bucket_id = 'kimuna-media');
