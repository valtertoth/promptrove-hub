-- Inserir perfis dos usuários existentes na tabela profiles
insert into public.profiles (id, email, nome)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'nome', 'Usuário Sem Nome')
from auth.users
on conflict (id) do nothing;

-- Inserir roles dos usuários na tabela user_roles (se ainda não existirem)
insert into public.user_roles (user_id, role)
select 
  id,
  coalesce((raw_user_meta_data->>'role')::app_role, 'especificador'::app_role)
from auth.users
where not exists (
  select 1 from public.user_roles where user_id = auth.users.id
);