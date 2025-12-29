-- Adicionar campo tipo_entrega na tabela pedidos
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS tipo_entrega text DEFAULT 'transporte_normal';

-- Adicionar campo tipo_entrega na tabela itens_projeto também para manter consistência
ALTER TABLE public.itens_projeto
ADD COLUMN IF NOT EXISTS tipo_entrega text DEFAULT 'transporte_normal';

-- Comentário para documentar os valores válidos
COMMENT ON COLUMN public.pedidos.tipo_entrega IS 'transporte_normal ou dropshipping';