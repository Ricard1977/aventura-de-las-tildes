-- Ejecuta este archivo en Supabase > SQL Editor; activa Anonymous Sign-ins.
create table if not exists public.players (
  user_id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null check (char_length(nickname) between 3 and 18),
  avatar text not null default '🦊',
  score numeric(9,1) not null default 0,
  games integer not null default 0,
  hits integer not null default 0,
  updated_at timestamptz not null default now()
);
create unique index if not exists players_nickname_lower_idx on public.players(lower(nickname));
alter table public.players enable row level security;
create policy "Leaderboard is readable" on public.players for select to anon, authenticated using (true);
create policy "Players insert their own profile" on public.players for insert to authenticated with check (auth.uid() = user_id);
create policy "Players update only their profile" on public.players for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);
-- Nota: el cliente calcula puntuaciones; para evitar trampas se necesita validación del lado del servidor.
