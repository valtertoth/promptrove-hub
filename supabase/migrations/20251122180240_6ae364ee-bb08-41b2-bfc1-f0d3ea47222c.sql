-- Adding business rules columns to commercial_connections
alter table public.commercial_connections 
add column if not exists commission_rate numeric(5,2), -- Ex: 10.50
add column if not exists authorized_regions text[], -- Array de cidades/estados
add column if not exists sales_model text, -- 'dropshipping', 'cross_docking', 'resale'
add column if not exists logistics_info jsonb; -- Detalhes de galpão/entrega do especificador