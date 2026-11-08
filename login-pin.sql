-- ACTUALIZACIÓN DE ACCESO POR APODO + PIN
-- Ejecutar DESPUÉS del supabase.sql original.
-- Conserva todas las filas, jugadores y puntuaciones.
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.liga_tildes_access (
 player_id uuid not null references public.liga_tildes_players(id) on delete cascade,
 user_id uuid not null references auth.users(id) on delete cascade,
 primary key(player_id,user_id)
);
alter table public.liga_tildes_access enable row level security;
-- Ningún usuario puede escribir ni consultar directamente la lista de sesiones.
revoke all on public.liga_tildes_access from anon,authenticated;

create table if not exists public.liga_tildes_pins (
 player_id uuid primary key references public.liga_tildes_players(id) on delete cascade,
 pin_hash text not null,
 failures integer not null default 0,
 locked_until timestamptz
);
alter table public.liga_tildes_pins enable row level security;
revoke all on public.liga_tildes_pins from anon,authenticated;

-- Función de permiso elevada: RLS no debe consultar directamente la tabla privada.
create or replace function public.liga_player_has_access(p_player_id uuid)
returns boolean language sql stable security definer set search_path=''
as $$ select exists (
 select 1 from public.liga_tildes_access a
 where a.player_id=p_player_id and a.user_id=auth.uid()
) $$;
revoke all on function public.liga_player_has_access(uuid) from public;
grant execute on function public.liga_player_has_access(uuid) to authenticated;

-- Permitir edición a las sesiones autorizadas además del creador original.
drop policy if exists "liga_update_own" on public.liga_tildes_players;
create policy "liga_update_own" on public.liga_tildes_players
for update to authenticated
using (
 owner_id = (select auth.uid()) or
 public.liga_player_has_access(id)
)
with check (
 owner_id = (select auth.uid()) or
 public.liga_player_has_access(id)
);

create or replace function public.liga_set_pin(p_nickname text, p_pin text)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_player uuid;
begin
 if auth.uid() is null then raise exception 'Sesión requerida'; end if;
 if p_pin !~ '^[0-9]{6,8}$' then raise exception 'El PIN debe tener entre 6 y 8 cifras'; end if;
 select id into v_player from public.liga_tildes_players
 where lower(nickname)=lower(trim(p_nickname))
 and (owner_id=auth.uid() or exists (
  select 1 from public.liga_tildes_access
  where player_id=id and user_id=auth.uid()
 )) for update;
 if v_player is null then raise exception 'No puedes modificar el PIN de este jugador'; end if;
 insert into public.liga_tildes_pins(player_id,pin_hash,failures,locked_until)
 values(v_player,extensions.crypt(p_pin,extensions.gen_salt('bf',10)),0,null)
 on conflict(player_id) do update set pin_hash=excluded.pin_hash,failures=0,locked_until=null;
 insert into public.liga_tildes_access(player_id,user_id)
 values(v_player,auth.uid()) on conflict do nothing;
 return true;
end $$;

create or replace function public.liga_login_player(p_nickname text,p_pin text)
returns table(nickname text,avatar text,score numeric,games integer,hits integer)
language plpgsql security definer set search_path='' as $$
declare v_player public.liga_tildes_players%rowtype;
declare v_pin public.liga_tildes_pins%rowtype;
begin
 if auth.uid() is null then raise exception 'Sesión requerida'; end if;
 select * into v_player from public.liga_tildes_players p
 where lower(p.nickname)=lower(trim(p_nickname));
 if not found then return; end if;
 select * into v_pin from public.liga_tildes_pins p where p.player_id=v_player.id for update;
 if not found then return; end if;
 if v_pin.locked_until is not null and v_pin.locked_until>now()
 then return; end if;
 if v_pin.pin_hash is distinct from extensions.crypt(p_pin,v_pin.pin_hash) then
  update public.liga_tildes_pins
  set failures=case when failures>=4 then 0 else failures+1 end,
  locked_until=case when failures>=4 then now()+interval '15 minutes' else null end
  where player_id=v_player.id;
  return;
 end if;
 update public.liga_tildes_pins set failures=0,locked_until=null where player_id=v_player.id;
 insert into public.liga_tildes_access(player_id,user_id)
 values(v_player.id,auth.uid()) on conflict do nothing;
 return query select v_player.nickname,v_player.avatar,v_player.score,v_player.games,v_player.hits;
end $$;
revoke all on function public.liga_set_pin(text,text) from public;
revoke all on function public.liga_login_player(text,text) from public;
grant execute on function public.liga_set_pin(text,text) to authenticated;
grant execute on function public.liga_login_player(text,text) to authenticated;
