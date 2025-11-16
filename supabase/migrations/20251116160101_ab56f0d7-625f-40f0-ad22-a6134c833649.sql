-- Tabela para tipos de produtos aprovados
CREATE TABLE IF NOT EXISTS public.tipos_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  campos_especificos JSONB DEFAULT '[]'::jsonb,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para ambientes disponíveis
CREATE TABLE IF NOT EXISTS public.ambientes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL UNIQUE,
  descricao TEXT,
  ativo BOOLEAN DEFAULT true,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Tabela para sugestões de tipos de produtos (pendentes de aprovação)
CREATE TABLE IF NOT EXISTS public.sugestoes_tipo_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome_sugerido TEXT NOT NULL,
  descricao TEXT,
  fabrica_id UUID NOT NULL REFERENCES public.fabrica(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'aprovado', 'rejeitado')),
  mensagem_admin TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tipos_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sugestoes_tipo_produto ENABLE ROW LEVEL SECURITY;

-- Políticas para tipos_produto (público para leitura)
CREATE POLICY "Tipos de produtos ativos são públicos"
ON public.tipos_produto FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar tipos de produtos"
ON public.tipos_produto FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para ambientes (público para leitura)
CREATE POLICY "Ambientes ativos são públicos"
ON public.ambientes FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar ambientes"
ON public.ambientes FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para sugestões
CREATE POLICY "Fábricas podem criar sugestões"
ON public.sugestoes_tipo_produto FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fabrica
    WHERE fabrica.id = fabrica_id AND fabrica.user_id = auth.uid()
  )
);

CREATE POLICY "Fábricas podem ver suas sugestões"
ON public.sugestoes_tipo_produto FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.fabrica
    WHERE fabrica.id = fabrica_id AND fabrica.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem gerenciar sugestões"
ON public.sugestoes_tipo_produto FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_tipos_produto_updated_at
BEFORE UPDATE ON public.tipos_produto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sugestoes_tipo_produto_updated_at
BEFORE UPDATE ON public.sugestoes_tipo_produto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir tipos de produtos iniciais
INSERT INTO public.tipos_produto (nome, ordem) VALUES
  ('Mesa', 1),
  ('Mesa Lateral', 2),
  ('Mesa de Centro', 3),
  ('Cadeira', 4),
  ('Aparador', 5),
  ('Bistrô', 6),
  ('Cristaleira', 7),
  ('Balcão', 8),
  ('Banqueta', 9),
  ('Poltrona', 10),
  ('Sofá', 11),
  ('Estante', 12),
  ('Rack', 13),
  ('Buffet', 14),
  ('Cômoda', 15)
ON CONFLICT (nome) DO NOTHING;

-- Inserir ambientes iniciais
INSERT INTO public.ambientes (nome, ordem) VALUES
  ('Sala de Jantar', 1),
  ('Sala de Estar', 2),
  ('Varanda', 3),
  ('Cozinha', 4),
  ('Jardim', 5),
  ('Quarto', 6),
  ('Banheiro', 7),
  ('Hall', 8),
  ('Escritório', 9),
  ('Lavanderia', 10),
  ('Área Gourmet', 11)
ON CONFLICT (nome) DO NOTHING;