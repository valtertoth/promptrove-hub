-- 1. Remove duplicatas se existirem (limpeza)
delete from public.user_roles a using public.user_roles b
where a.id < b.id and a.user_id = b.user_id;

-- 2. Adiciona a regra de unicidade (Obrigatoria para UPSERT)
alter table public.user_roles
add constraint user_roles_user_id_key unique (user_id);

-- 3. Garante que perfis também tenham unicidade
alter table public.profiles
drop constraint if exists profiles_pkey;
alter table public.profiles
add primary key (id);