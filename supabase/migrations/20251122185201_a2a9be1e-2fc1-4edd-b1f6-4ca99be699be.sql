-- 1. Limpar políticas antigas da tabela de conexões para evitar conflitos
drop policy if exists "Permitir Criar Solicitação" on commercial_connections;
drop policy if exists "Permitir Ver Solicitações" on commercial_connections;
drop policy if exists "Permitir Fábrica Atualizar" on commercial_connections;
drop policy if exists "Especificador cria solicitação" on commercial_connections;
drop policy if exists "Especificador vê suas conexões" on commercial_connections;
drop policy if exists "Fábrica vê e edita solicitações" on commercial_connections;
drop policy if exists "Fábrica vê e edita solicitações para ela" on commercial_connections;
drop policy if exists "enable_insert_for_own_requests" on commercial_connections;
drop policy if exists "enable_select_for_involved_parties" on commercial_connections;
drop policy if exists "enable_update_for_factory" on commercial_connections;

-- 2. Garantir que RLS está ativo
alter table public.commercial_connections enable row level security;

-- 3. NOVA POLÍTICA DE CRIAÇÃO (INSERT)
-- Permite criar conexão se o especificador pertence ao usuário autenticado
create policy "enable_insert_for_own_requests"
on public.commercial_connections
for insert
to authenticated
with check ( 
  exists (
    select 1 from especificador 
    where id = specifier_id and user_id = auth.uid()
  )
);

-- 4. NOVA POLÍTICA DE VISUALIZAÇÃO (SELECT)
-- Permite ver se você é o especificador OU a fábrica envolvida
create policy "enable_select_for_involved_parties"
on public.commercial_connections
for select
to authenticated
using ( 
  exists (
    select 1 from especificador 
    where id = specifier_id and user_id = auth.uid()
  )
  OR
  exists (
    select 1 from fabrica 
    where id = factory_id and user_id = auth.uid()
  )
);

-- 5. NOVA POLÍTICA DE ATUALIZAÇÃO (UPDATE)
-- Permite que a fábrica atualize solicitações direcionadas a ela
create policy "enable_update_for_factory"
on public.commercial_connections
for update
to authenticated
using ( 
  exists (
    select 1 from fabrica 
    where id = factory_id and user_id = auth.uid()
  )
);