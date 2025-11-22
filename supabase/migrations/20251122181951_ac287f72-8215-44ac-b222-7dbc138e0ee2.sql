-- 1. Remover políticas antigas
drop policy if exists "Especificadores podem criar conexões" on public.commercial_connections;
drop policy if exists "Especificadores podem ver suas conexões" on public.commercial_connections;
drop policy if exists "Fábricas podem editar suas conexões" on public.commercial_connections;
drop policy if exists "Fábricas podem ver suas conexões" on public.commercial_connections;
drop policy if exists "Permitir Criar Solicitação" on public.commercial_connections;
drop policy if exists "Permitir Ver Solicitações" on public.commercial_connections;
drop policy if exists "Permitir Fábrica Atualizar" on public.commercial_connections;

-- 2. Garantir que RLS está habilitado
alter table public.commercial_connections enable row level security;

-- 3. Permitir que especificadores criem conexões (verificando user_id via tabela especificador)
create policy "Permitir Criar Solicitação"
on public.commercial_connections
for insert
to authenticated
with check (
  exists (
    select 1 from especificador
    where id = commercial_connections.specifier_id
    and user_id = auth.uid()
  )
);

-- 4. Permitir ver solicitações se você for o especificador OU a fábrica
create policy "Permitir Ver Solicitações"
on public.commercial_connections
for select
to authenticated
using (
  exists (
    select 1 from especificador
    where id = commercial_connections.specifier_id
    and user_id = auth.uid()
  )
  or exists (
    select 1 from fabrica
    where id = commercial_connections.factory_id
    and user_id = auth.uid()
  )
);

-- 5. Permitir que a fábrica atualize suas conexões
create policy "Permitir Fábrica Atualizar"
on public.commercial_connections
for update
to authenticated
using (
  exists (
    select 1 from fabrica
    where id = commercial_connections.factory_id
    and user_id = auth.uid()
  )
);