-- Allow authenticated users to insert their own role, but never 'admin'
create policy "Usuarios podem definir sua propria role"
  on public.user_roles
  for insert
  to authenticated
  with check (
    auth.uid() = user_id
    and role in ('fabrica','fornecedor','especificador')
  );