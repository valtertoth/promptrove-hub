-- Adicionar novas colunas à tabela fabrica
ALTER TABLE public.fabrica 
ADD COLUMN IF NOT EXISTS banner_url text,
ADD COLUMN IF NOT EXISTS production_time text,
ADD COLUMN IF NOT EXISTS minimum_order text,
ADD COLUMN IF NOT EXISTS regions text;