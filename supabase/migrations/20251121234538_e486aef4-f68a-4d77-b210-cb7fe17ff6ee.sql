-- 1. Tabela de Materiais (Para o Fornecedor)
create table public.materials (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  supplier_id uuid references auth.users not null, -- Liga ao usuário logado
  name text not null,
  type text not null, -- Ex: Madeira, Tecido
  sku_supplier text,
  description text,
  image_url text,
  is_active boolean default true
);

-- 2. Tabela de Produtos (Para a Fábrica)
create table public.products (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  manufacturer_id uuid references auth.users not null, -- Liga ao usuário logado
  name text not null,
  category text not null,
  description text,
  sku_manufacturer text,
  dimensions text[], -- Array de textos para guardar várias medidas
  image_url text,
  is_active boolean default true
);

-- 3. Tabela de Relacionamento (Produto aceita X Materiais)
create table public.product_materials (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products not null,
  material_id uuid references public.materials not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Políticas de Segurança (RLS) - Para ninguém apagar dados do outro
alter table public.materials enable row level security;
alter table public.products enable row level security;
alter table public.product_materials enable row level security;

-- Política: Todo mundo pode VER os materiais (para selecionar)
create policy "Materiais são públicos para leitura"
on public.materials for select
to authenticated
using (true);

-- Política: Só o dono pode criar/editar seus materiais
create policy "Fornecedor gerencia seus materiais"
on public.materials for all
to authenticated
using (auth.uid() = supplier_id);

-- Política: Todo mundo pode VER os produtos (Vitrine)
create policy "Produtos são públicos para leitura"
on public.products for select
to authenticated
using (true);

-- Política: Só a fábrica dona pode criar/editar seus produtos
create policy "Fábrica gerencia seus produtos"
on public.products for all
to authenticated
using (auth.uid() = manufacturer_id);