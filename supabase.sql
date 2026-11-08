-- LA LIGA DE LAS TILDES · Clasificación compartida
-- Ejecutar en el SQL Editor del proyecto Supabase elegido.
-- Crea una tabla NUEVA. No borra ni modifica tablas de otras aplicaciones.
create table if not exists public.liga_tildes_players (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 3 and 18),
  avatar text not null default '🦊',
  score numeric(10,1) not null default 0,
  games integer not null default 0,
  hits integer not null default 0,
  updated_at timestamptz not null default now()
);
create unique index if not exists liga_tildes_players_nickname_unique
  on public.liga_tildes_players (lower(nickname));
create index if not exists liga_tildes_players_score_idx
  on public.liga_tildes_players (score desc);
alter table public.liga_tildes_players enable row level security;
drop policy if exists "liga_public_read" on public.liga_tildes_players;
create policy "liga_public_read" on public.liga_tildes_players
  for select to anon, authenticated using (true);
drop policy if exists "liga_insert_own" on public.liga_tildes_players;
create policy "liga_insert_own" on public.liga_tildes_players
  for insert to authenticated with check (auth.uid() = owner_id);
drop policy if exists "liga_update_own" on public.liga_tildes_players;
create policy "liga_update_own" on public.liga_tildes_players
  for update to authenticated using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);
-- IMPORTANTE: Authentication > Providers > Anonymous Sign-Ins debe estar activado.
-- Los puntos se validan en el navegador: apto como juego educativo, no antifraude.
