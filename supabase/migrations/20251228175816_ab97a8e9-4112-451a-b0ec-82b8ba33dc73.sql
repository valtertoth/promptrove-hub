-- Tabela de acordos de comissão entre Fábrica e Especificador
CREATE TABLE public.acordos_comissao (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    connection_id UUID NOT NULL REFERENCES public.commercial_connections(id) ON DELETE CASCADE,
    percentual_solicitado NUMERIC(5,2) NOT NULL CHECK (percentual_solicitado >= 0 AND percentual_solicitado <= 100),
    percentual_aprovado NUMERIC(5,2) CHECK (percentual_aprovado >= 0 AND percentual_aprovado <= 100),
    status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado', 'expirado')),
    solicitado_por TEXT NOT NULL DEFAULT 'especificador',
    data_solicitacao TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    data_resposta TIMESTAMP WITH TIME ZONE,
    data_vigencia_inicio TIMESTAMP WITH TIME ZONE,
    data_vigencia_fim TIMESTAMP WITH TIME ZONE,
    observacoes_especificador TEXT,
    observacoes_fabricante TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de pedidos do Especificador para a Fábrica
CREATE TABLE public.pedidos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_pedido TEXT UNIQUE NOT NULL,
    connection_id UUID NOT NULL REFERENCES public.commercial_connections(id) ON DELETE CASCADE,
    especificador_id UUID NOT NULL REFERENCES public.especificador(id) ON DELETE CASCADE,
    fabrica_id UUID NOT NULL REFERENCES public.fabrica(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'enviado', 'em_analise', 'aprovado', 'em_producao', 'enviado_cliente', 'entregue', 'cancelado')),
    cliente_nome TEXT NOT NULL,
    cliente_email TEXT,
    cliente_telefone TEXT,
    cliente_endereco JSONB DEFAULT '{}',
    valor_total NUMERIC(12,2) DEFAULT 0,
    valor_comissao NUMERIC(12,2) DEFAULT 0,
    percentual_comissao NUMERIC(5,2),
    observacoes TEXT,
    data_envio TIMESTAMP WITH TIME ZONE,
    data_aprovacao TIMESTAMP WITH TIME ZONE,
    data_previsao_entrega TIMESTAMP WITH TIME ZONE,
    data_entrega TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela de itens do pedido
CREATE TABLE public.itens_pedido (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pedido_id UUID NOT NULL REFERENCES public.pedidos(id) ON DELETE CASCADE,
    produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
    variacao_id UUID REFERENCES public.variacoes_produto(id) ON DELETE SET NULL,
    quantidade INTEGER NOT NULL DEFAULT 1,
    preco_unitario NUMERIC(12,2) NOT NULL,
    preco_total NUMERIC(12,2) NOT NULL,
    personalizacoes JSONB DEFAULT '[]',
    observacoes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.acordos_comissao ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pedidos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.itens_pedido ENABLE ROW LEVEL SECURITY;

-- Policies para acordos_comissao
CREATE POLICY "Especificadores podem ver seus acordos" ON public.acordos_comissao
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.commercial_connections cc
        JOIN public.especificador e ON cc.specifier_id = e.id
        WHERE cc.id = acordos_comissao.connection_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Especificadores podem solicitar acordos" ON public.acordos_comissao
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.commercial_connections cc
        JOIN public.especificador e ON cc.specifier_id = e.id
        WHERE cc.id = acordos_comissao.connection_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Fábricas podem ver acordos relacionados" ON public.acordos_comissao
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.commercial_connections cc
        JOIN public.fabrica f ON cc.factory_id = f.id
        WHERE cc.id = acordos_comissao.connection_id AND f.user_id = auth.uid()
    )
);

CREATE POLICY "Fábricas podem responder acordos" ON public.acordos_comissao
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.commercial_connections cc
        JOIN public.fabrica f ON cc.factory_id = f.id
        WHERE cc.id = acordos_comissao.connection_id AND f.user_id = auth.uid()
    )
);

-- Policies para pedidos
CREATE POLICY "Especificadores podem ver seus pedidos" ON public.pedidos
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.especificador WHERE id = pedidos.especificador_id AND user_id = auth.uid())
);

CREATE POLICY "Especificadores podem criar pedidos" ON public.pedidos
FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM public.especificador WHERE id = pedidos.especificador_id AND user_id = auth.uid())
);

CREATE POLICY "Especificadores podem atualizar seus pedidos" ON public.pedidos
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.especificador WHERE id = pedidos.especificador_id AND user_id = auth.uid())
);

CREATE POLICY "Fábricas podem ver pedidos direcionados" ON public.pedidos
FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.fabrica WHERE id = pedidos.fabrica_id AND user_id = auth.uid())
);

CREATE POLICY "Fábricas podem atualizar pedidos direcionados" ON public.pedidos
FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.fabrica WHERE id = pedidos.fabrica_id AND user_id = auth.uid())
);

-- Policies para itens_pedido
CREATE POLICY "Especificadores podem ver itens de seus pedidos" ON public.itens_pedido
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pedidos p
        JOIN public.especificador e ON p.especificador_id = e.id
        WHERE p.id = itens_pedido.pedido_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Especificadores podem criar itens em seus pedidos" ON public.itens_pedido
FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM public.pedidos p
        JOIN public.especificador e ON p.especificador_id = e.id
        WHERE p.id = itens_pedido.pedido_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Especificadores podem atualizar itens de seus pedidos" ON public.itens_pedido
FOR UPDATE USING (
    EXISTS (
        SELECT 1 FROM public.pedidos p
        JOIN public.especificador e ON p.especificador_id = e.id
        WHERE p.id = itens_pedido.pedido_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Especificadores podem deletar itens de seus pedidos" ON public.itens_pedido
FOR DELETE USING (
    EXISTS (
        SELECT 1 FROM public.pedidos p
        JOIN public.especificador e ON p.especificador_id = e.id
        WHERE p.id = itens_pedido.pedido_id AND e.user_id = auth.uid()
    )
);

CREATE POLICY "Fábricas podem ver itens de pedidos direcionados" ON public.itens_pedido
FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM public.pedidos p
        JOIN public.fabrica f ON p.fabrica_id = f.id
        WHERE p.id = itens_pedido.pedido_id AND f.user_id = auth.uid()
    )
);

-- Função para gerar número de pedido sequencial
CREATE OR REPLACE FUNCTION public.gerar_numero_pedido()
RETURNS TRIGGER AS $$
DECLARE
    ano_atual TEXT;
    sequencia INTEGER;
    novo_numero TEXT;
BEGIN
    ano_atual := TO_CHAR(NOW(), 'YYYY');
    
    SELECT COALESCE(MAX(CAST(SUBSTRING(numero_pedido FROM 5 FOR 6) AS INTEGER)), 0) + 1
    INTO sequencia
    FROM public.pedidos
    WHERE numero_pedido LIKE 'PED' || ano_atual || '%';
    
    novo_numero := 'PED' || ano_atual || LPAD(sequencia::TEXT, 6, '0');
    NEW.numero_pedido := novo_numero;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER trigger_gerar_numero_pedido
BEFORE INSERT ON public.pedidos
FOR EACH ROW
WHEN (NEW.numero_pedido IS NULL OR NEW.numero_pedido = '')
EXECUTE FUNCTION public.gerar_numero_pedido();

-- Trigger para updated_at
CREATE TRIGGER update_acordos_comissao_updated_at
BEFORE UPDATE ON public.acordos_comissao
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pedidos_updated_at
BEFORE UPDATE ON public.pedidos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_acordos_comissao_connection ON public.acordos_comissao(connection_id);
CREATE INDEX idx_acordos_comissao_status ON public.acordos_comissao(status);
CREATE INDEX idx_pedidos_connection ON public.pedidos(connection_id);
CREATE INDEX idx_pedidos_especificador ON public.pedidos(especificador_id);
CREATE INDEX idx_pedidos_fabrica ON public.pedidos(fabrica_id);
CREATE INDEX idx_pedidos_status ON public.pedidos(status);
CREATE INDEX idx_itens_pedido_pedido ON public.itens_pedido(pedido_id);