-- NOOK — schema initial
-- Foyers (households) + membres, produits, achats, tickets, stock estime,
-- corrections manuelles. Toutes les tables metier sont scopees par
-- household_id pour supporter un foyer multi-adultes/multi-appareils
-- partageant la meme memoire (RLS via household_members).

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- households / household_members
-- ---------------------------------------------------------------------

create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null default 'Mon foyer',
  created_at timestamptz not null default now()
);

create table household_members (
  household_id uuid not null references households(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'member')),
  joined_at timestamptz not null default now(),
  primary key (household_id, user_id)
);

create index household_members_user_id_idx on household_members(user_id);

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------

create table products (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  category text not null default 'Maison' check (category in (
    'Frais', 'Fruits & Legumes', 'Surgeles', 'Epicerie', 'Boissons',
    'Hygiene', 'Entretien', 'Bebe', 'Animaux', 'Bricolage', 'Maison'
  )),
  brand text,
  barcode text,
  average_shelf_life_days integer check (average_shelf_life_days is null or average_shelf_life_days > 0),
  created_at timestamptz not null default now()
);

create index products_household_id_idx on products(household_id);
create index products_household_category_idx on products(household_id, category);
create unique index products_household_name_idx on products(household_id, lower(name));

-- ---------------------------------------------------------------------
-- tickets
-- ---------------------------------------------------------------------

create table tickets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  store_name text,
  purchase_date date not null,
  file_path text,
  total_amount numeric(10, 2) check (total_amount is null or total_amount >= 0),
  imported_at timestamptz not null default now()
);

create index tickets_household_id_idx on tickets(household_id);

-- ---------------------------------------------------------------------
-- purchases
-- ---------------------------------------------------------------------

create table purchases (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  quantity numeric(10, 2) not null default 1 check (quantity > 0),
  purchase_date date not null,
  price numeric(10, 2) check (price is null or price >= 0),
  source_ticket_id uuid references tickets(id) on delete set null,
  created_at timestamptz not null default now()
);

create index purchases_household_id_idx on purchases(household_id);
create index purchases_product_date_idx on purchases(product_id, purchase_date);
create index purchases_source_ticket_idx on purchases(source_ticket_id);

-- ---------------------------------------------------------------------
-- estimated_stock
-- ---------------------------------------------------------------------

create table estimated_stock (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  estimated_quantity numeric(10, 2) not null default 0 check (estimated_quantity >= 0),
  confidence_score numeric(4, 3) not null default 0 check (confidence_score >= 0 and confidence_score <= 1),
  last_calculation_date timestamptz not null default now(),
  unique (product_id)
);

create index estimated_stock_household_id_idx on estimated_stock(household_id);

-- ---------------------------------------------------------------------
-- stock_corrections (manual +/-, "termine", "encore disponible")
-- ---------------------------------------------------------------------

create table stock_corrections (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  type text not null check (type in ('increment', 'decrement', 'finished', 'still_available')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index stock_corrections_product_id_idx on stock_corrections(product_id);
create index stock_corrections_household_id_idx on stock_corrections(household_id);

-- ---------------------------------------------------------------------
-- helper: is the current user a member of a given household?
-- ---------------------------------------------------------------------

create or replace function is_household_member(target_household_id uuid)
returns boolean
language sql
security definer
stable
as $$
  select exists (
    select 1 from household_members
    where household_id = target_household_id
      and user_id = auth.uid()
  );
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table households enable row level security;
alter table household_members enable row level security;
alter table products enable row level security;
alter table tickets enable row level security;
alter table purchases enable row level security;
alter table estimated_stock enable row level security;
alter table stock_corrections enable row level security;

create policy "members can read their households"
  on households for select
  using (is_household_member(id));

create policy "owners can update their households"
  on households for update
  using (is_household_member(id));

create policy "members can read their membership rows"
  on household_members for select
  using (user_id = auth.uid() or is_household_member(household_id));

create policy "products scoped to household"
  on products for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "tickets scoped to household"
  on tickets for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "purchases scoped to household"
  on purchases for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "estimated_stock scoped to household"
  on estimated_stock for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

create policy "stock_corrections scoped to household"
  on stock_corrections for all
  using (is_household_member(household_id))
  with check (is_household_member(household_id));

-- ---------------------------------------------------------------------
-- Auto-provision a solo household on signup
-- ---------------------------------------------------------------------

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into households (name) values ('Mon foyer')
    returning id into new_household_id;

  insert into household_members (household_id, user_id, role)
    values (new_household_id, new.id, 'owner');

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ---------------------------------------------------------------------
-- Storage bucket for imported tickets
-- ---------------------------------------------------------------------

insert into storage.buckets (id, name, public)
  values ('tickets', 'tickets', false)
  on conflict (id) do nothing;

create policy "household members can read their ticket files"
  on storage.objects for select
  using (
    bucket_id = 'tickets'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

create policy "household members can upload ticket files"
  on storage.objects for insert
  with check (
    bucket_id = 'tickets'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );

create policy "household members can delete their ticket files"
  on storage.objects for delete
  using (
    bucket_id = 'tickets'
    and is_household_member((storage.foldername(name))[1]::uuid)
  );
