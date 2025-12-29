-- Adicionar opções de pagamento na tabela fabrica
ALTER TABLE public.fabrica
ADD COLUMN IF NOT EXISTS opcoes_pagamento jsonb DEFAULT '[]'::jsonb;

-- Adicionar campos de pagamento na tabela pedidos
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS tipo_pagamento text,
ADD COLUMN IF NOT EXISTS comprovante_pagamento_url text;

-- Comentários explicativos
COMMENT ON COLUMN public.fabrica.opcoes_pagamento IS 'Array com opções de pagamento: vista_100, vista_50_50, boleto_30d, boleto_30_60d, boleto_30_60_90d';
COMMENT ON COLUMN public.pedidos.tipo_pagamento IS 'Tipo de pagamento escolhido pelo especificador';
COMMENT ON COLUMN public.pedidos.comprovante_pagamento_url IS 'URL do comprovante de pagamento enviado pelo especificador';