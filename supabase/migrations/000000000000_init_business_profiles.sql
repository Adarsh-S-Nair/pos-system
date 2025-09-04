-- Create extension helpers (safe if already present)
create extension if not exists "uuid-ossp";

-- 1) Business profiles table
create table if not exists public.business_profiles (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null,                             -- auth.users.id (user who owns the store)
  name text not null,
  tagline text,
  address1 text,
  city text,
  region text,
  postal text,
  timezone text not null,
  currency text not null default 'USD',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional: each owner gets only one profile for now (lift later if needed)
create unique index if not exists uq_business_profiles_owner on public.business_profiles (owner_id);

-- 2) Timestamps trigger
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end
$$;

drop trigger if exists t_business_profiles_updated on public.business_profiles;
create trigger t_business_profiles_updated
before update on public.business_profiles
for each row execute procedure public.set_updated_at();

-- 3) RLS + policies (owner-only)
alter table public.business_profiles enable row level security;

-- If you want to allow selects only to the owner:
drop policy if exists "business_profiles_select_own" on public.business_profiles;
create policy "business_profiles_select_own"
on public.business_profiles
for select
using (auth.uid() = owner_id);

drop policy if exists "business_profiles_modify_own" on public.business_profiles;
create policy "business_profiles_modify_own"
on public.business_profiles
for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

-- 4) Helper trigger to default owner_id = auth.uid() if not provided
create or replace function public.set_owner_id_default()
returns trigger language plpgsql as $$
begin
  if new.owner_id is null then
    new.owner_id := auth.uid();
  end if;
  return new;
end
$$;

drop trigger if exists t_business_profiles_owner on public.business_profiles;
create trigger t_business_profiles_owner
before insert on public.business_profiles
for each row execute procedure public.set_owner_id_default();

-- Notes:
-- - Client inserts can pass owner_id or omit it; the trigger fills it from JWT (auth.uid()).
-- - Policies restrict access to only the owner’s row.


