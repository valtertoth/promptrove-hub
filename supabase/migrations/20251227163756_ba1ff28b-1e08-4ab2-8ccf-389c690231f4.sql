-- Criar tabela para vincular materiais aos produtos (tabela produtos)
CREATE TABLE public.produto_materiais (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  material_id UUID NOT NULL REFERENCES public.materials(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(produto_id, material_id)
);

-- Habilitar RLS
ALTER TABLE public.produto_materiais ENABLE ROW LEVEL SECURITY;

-- Política: Materiais vinculados são públicos para leitura
CREATE POLICY "Relacionamentos produto-material são públicos"
ON public.produto_materiais
FOR SELECT
USING (true);

-- Política: Fábricas podem vincular materiais aos seus produtos
CREATE POLICY "Fábrica pode vincular materiais aos seus produtos"
ON public.produto_materiais
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.produtos p
    JOIN public.fabrica f ON p.fabrica_id = f.id
    WHERE p.id = produto_materiais.produto_id
    AND f.user_id = auth.uid()
  )
);

-- Política: Fábricas podem desvincular materiais de seus produtos
CREATE POLICY "Fábrica pode desvincular materiais de seus produtos"
ON public.produto_materiais
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.produtos p
    JOIN public.fabrica f ON p.fabrica_id = f.id
    WHERE p.id = produto_materiais.produto_id
    AND f.user_id = auth.uid()
  )
);