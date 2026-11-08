-- Ejecutar en el SQL Editor del proyecto Supabase.
-- Protege la administración mediante una cuenta Supabase Auth de adulto.
create table if not exists public.liga_tildes_admins (
 user_id uuid primary key references auth.users(id) on delete cascade
);
alter table public.liga_tildes_admins enable row level security;
revoke all on public.liga_tildes_admins from anon,authenticated;

create or replace function public.liga_admin_check()
returns boolean language sql stable security definer set search_path=''
as $$ select exists(
 select 1 from public.liga_tildes_admins a where a.user_id=auth.uid()
) $$;
revoke all on function public.liga_admin_check() from public;
grant execute on function public.liga_admin_check() to authenticated;

create or replace function public.liga_admin_delete_player(p_nickname text)
returns boolean language plpgsql security definer set search_path=''
as $$
declare deleted_count integer;
begin
 if auth.uid() is null or not exists
 (select 1 from public.liga_tildes_admins a where a.user_id=auth.uid())
 then raise exception 'Permiso de administrador requerido'; end if;
 delete from public.liga_tildes_players p
 where lower(p.nickname)=lower(trim(p_nickname));
 get diagnostics deleted_count=row_count;
 return deleted_count=1;
end $$;
revoke all on function public.liga_admin_delete_player(text) from public;
grant execute on function public.liga_admin_delete_player(text) to authenticated;

-- PASO DE ASIGNACIÓN DEL ADMINISTRADOR:
-- 1. Crea una cuenta adulta en Authentication > Users > Add user.
-- 2. Confirma su correo.
-- 3. Copia su User UID y ejecuta ESTA instrucción, sustituyendo el texto:
-- insert into public.liga_tildes_admins(user_id) values ('AQUI_TU_USER_UID');
-- No publiques el correo ni la contraseña en el repositorio.
