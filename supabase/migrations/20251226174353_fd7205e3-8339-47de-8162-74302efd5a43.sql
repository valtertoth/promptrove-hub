-- Criar tabela de projetos
CREATE TABLE public.projetos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_projeto TEXT NOT NULL,
  cliente TEXT,
  especificador_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.projetos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para projetos
CREATE POLICY "Especificadores podem ver seus projetos"
ON public.projetos
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM especificador 
  WHERE especificador.id = projetos.especificador_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem criar projetos"
ON public.projetos
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM especificador 
  WHERE especificador.id = projetos.especificador_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem atualizar seus projetos"
ON public.projetos
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM especificador 
  WHERE especificador.id = projetos.especificador_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem deletar seus projetos"
ON public.projetos
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM especificador 
  WHERE especificador.id = projetos.especificador_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Admins podem gerenciar projetos"
ON public.projetos
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Criar tabela de itens do projeto
CREATE TABLE public.itens_projeto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  projeto_id UUID NOT NULL REFERENCES public.projetos(id) ON DELETE CASCADE,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  quantidade INTEGER NOT NULL DEFAULT 1,
  ambiente TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.itens_projeto ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para itens_projeto (herdam do projeto pai)
CREATE POLICY "Especificadores podem ver itens de seus projetos"
ON public.itens_projeto
FOR SELECT
USING (EXISTS (
  SELECT 1 FROM projetos 
  JOIN especificador ON especificador.id = projetos.especificador_id
  WHERE projetos.id = itens_projeto.projeto_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem criar itens em seus projetos"
ON public.itens_projeto
FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM projetos 
  JOIN especificador ON especificador.id = projetos.especificador_id
  WHERE projetos.id = itens_projeto.projeto_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem atualizar itens de seus projetos"
ON public.itens_projeto
FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM projetos 
  JOIN especificador ON especificador.id = projetos.especificador_id
  WHERE projetos.id = itens_projeto.projeto_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Especificadores podem deletar itens de seus projetos"
ON public.itens_projeto
FOR DELETE
USING (EXISTS (
  SELECT 1 FROM projetos 
  JOIN especificador ON especificador.id = projetos.especificador_id
  WHERE projetos.id = itens_projeto.projeto_id 
  AND especificador.user_id = auth.uid()
));

CREATE POLICY "Admins podem gerenciar itens de projetos"
ON public.itens_projeto
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at em projetos
CREATE TRIGGER update_projetos_updated_at
BEFORE UPDATE ON public.projetos
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();