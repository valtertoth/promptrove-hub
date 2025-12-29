-- Adicionar campos de workflow/etapas ao pedido
ALTER TABLE public.pedidos
ADD COLUMN IF NOT EXISTS etapa_pagamento TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS etapa_fabricacao TIMESTAMP WITH TIME ZONE DEFAULT NULL,
ADD COLUMN IF NOT EXISTS etapa_expedicao TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Comentário para documentar as etapas do workflow
COMMENT ON COLUMN public.pedidos.data_envio IS 'Data de recebimento do pedido pela fábrica (status: enviado)';
COMMENT ON COLUMN public.pedidos.etapa_pagamento IS 'Data de confirmação do pagamento';
COMMENT ON COLUMN public.pedidos.etapa_fabricacao IS 'Data de início da fabricação';
COMMENT ON COLUMN public.pedidos.etapa_expedicao IS 'Data de expedição do produto';
COMMENT ON COLUMN public.pedidos.data_entrega IS 'Data de entrega final ao cliente';