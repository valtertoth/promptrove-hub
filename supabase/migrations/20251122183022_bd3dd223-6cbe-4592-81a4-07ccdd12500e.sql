-- 1. Preencher a tabela de Perfis (Quem são)
-- IMPORTANTE: A tabela profiles usa 'nome', não 'full_name'
insert into public.profiles (id, email, nome)
select 
  id, 
  email, 
  coalesce(raw_user_meta_data->>'nome', raw_user_meta_data->>'full_name', 'Usuário Importado')
from auth.users
on conflict (id) do nothing;

-- 2. Preencher a tabela de Funções (O que são)
-- Se o usuário não tiver função, definimos como 'especificador' por padrão
insert into public.user_roles (user_id, role)
select 
  id,
  coalesce((raw_user_meta_data->>'role')::app_role, 'especificador'::app_role)
from auth.users
where id not in (select user_id from public.user_roles);