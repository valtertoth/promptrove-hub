-- Tabela para sugestões de valores de campos específicos
CREATE TABLE IF NOT EXISTS public.sugestoes_campo_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabrica_id UUID NOT NULL REFERENCES public.fabrica(id) ON DELETE CASCADE,
  tipo_produto_id UUID NOT NULL REFERENCES public.tipos_produto(id) ON DELETE CASCADE,
  nome_campo TEXT NOT NULL,
  valor_sugerido TEXT NOT NULL,
  descricao TEXT,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  mensagem_admin TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- RLS policies
ALTER TABLE public.sugestoes_campo_produto ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fábricas podem criar sugestões de campos"
  ON public.sugestoes_campo_produto
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.fabrica
      WHERE fabrica.id = sugestoes_campo_produto.fabrica_id
      AND fabrica.user_id = auth.uid()
    )
  );

CREATE POLICY "Fábricas podem ver suas sugestões de campos"
  ON public.sugestoes_campo_produto
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.fabrica
      WHERE fabrica.id = sugestoes_campo_produto.fabrica_id
      AND fabrica.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins podem gerenciar sugestões de campos"
  ON public.sugestoes_campo_produto
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices
CREATE INDEX idx_sugestoes_campo_fabrica ON public.sugestoes_campo_produto(fabrica_id);
CREATE INDEX idx_sugestoes_campo_tipo ON public.sugestoes_campo_produto(tipo_produto_id);
CREATE INDEX idx_sugestoes_campo_status ON public.sugestoes_campo_produto(status);