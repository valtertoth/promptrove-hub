-- Políticas RLS para product_materials

-- Política: Todo mundo pode VER os relacionamentos produto-material
create policy "Relacionamentos produto-material são públicos"
on public.product_materials for select
to authenticated
using (true);

-- Política: Fábrica pode criar relacionamentos para seus produtos
create policy "Fábrica pode vincular materiais aos seus produtos"
on public.product_materials for insert
to authenticated
with check (
  exists (
    select 1 from public.products
    where products.id = product_materials.product_id
    and products.manufacturer_id = auth.uid()
  )
);

-- Política: Fábrica pode deletar relacionamentos de seus produtos
create policy "Fábrica pode desvincular materiais de seus produtos"
on public.product_materials for delete
to authenticated
using (
  exists (
    select 1 from public.products
    where products.id = product_materials.product_id
    and products.manufacturer_id = auth.uid()
  )
);