-- 1. Destravar Roles (Permitir apagar usuário e levar a role junto)
ALTER TABLE public.user_roles
DROP CONSTRAINT IF EXISTS user_roles_user_id_fkey;

ALTER TABLE public.user_roles
ADD CONSTRAINT user_roles_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 2. Destravar Especificadores
ALTER TABLE public.especificador
DROP CONSTRAINT IF EXISTS especificador_user_id_fkey;

ALTER TABLE public.especificador
ADD CONSTRAINT especificador_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 3. Destravar Fabricas
ALTER TABLE public.fabrica
DROP CONSTRAINT IF EXISTS fabrica_user_id_fkey;

ALTER TABLE public.fabrica
ADD CONSTRAINT fabrica_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 4. Destravar Fornecedores
ALTER TABLE public.fornecedor
DROP CONSTRAINT IF EXISTS fornecedor_user_id_fkey;

ALTER TABLE public.fornecedor
ADD CONSTRAINT fornecedor_user_id_fkey
FOREIGN KEY (user_id) REFERENCES auth.users(id)
ON DELETE CASCADE;

-- 5. Destravar Perfis (Profiles)
ALTER TABLE public.profiles
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_id_fkey
FOREIGN KEY (id) REFERENCES auth.users(id)
ON DELETE CASCADE;