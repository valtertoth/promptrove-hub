-- Criar tabela de categorias de material (similar a tipos_produto e ambientes)
CREATE TABLE public.categorias_material (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome text NOT NULL UNIQUE,
  descricao text,
  ativo boolean DEFAULT true,
  ordem integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.categorias_material ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Admins podem gerenciar categorias de material"
ON public.categorias_material
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Categorias de material ativas são públicas"
ON public.categorias_material
FOR SELECT
USING (ativo = true);

-- Inserir categorias iniciais baseadas no enum existente
INSERT INTO public.categorias_material (nome, descricao, ordem) VALUES
  ('Tecido', 'Tecidos para estofamento e revestimento', 1),
  ('Corda', 'Cordas náuticas e similares', 2),
  ('Alumínio', 'Estruturas e acabamentos em alumínio', 3),
  ('Madeira', 'Madeiras maciças e derivados', 4),
  ('Ferro', 'Estruturas metálicas em ferro', 5),
  ('Lâmina', 'Lâminas de madeira e revestimentos', 6),
  ('Acabamento', 'Acabamentos e vernizes', 7),
  ('Outro', 'Outros tipos de materiais', 8);

-- Criar tabela de sugestões de categorias de material
CREATE TABLE public.sugestoes_categoria_material (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  fabrica_id uuid REFERENCES public.fabrica(id) ON DELETE CASCADE,
  fornecedor_id uuid REFERENCES public.fornecedor(id) ON DELETE CASCADE,
  nome_sugerido text NOT NULL,
  descricao text,
  status text DEFAULT 'pendente',
  mensagem_admin text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT chk_sugestao_origem CHECK (fabrica_id IS NOT NULL OR fornecedor_id IS NOT NULL)
);

-- Habilitar RLS
ALTER TABLE public.sugestoes_categoria_material ENABLE ROW LEVEL SECURITY;

-- Políticas para sugestões de categorias de material
CREATE POLICY "Admins podem gerenciar sugestões de categorias"
ON public.sugestoes_categoria_material
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Fábricas podem criar sugestões de categorias"
ON public.sugestoes_categoria_material
FOR INSERT
WITH CHECK (
  fabrica_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM fabrica WHERE id = sugestoes_categoria_material.fabrica_id AND user_id = auth.uid())
);

CREATE POLICY "Fábricas podem ver suas sugestões de categorias"
ON public.sugestoes_categoria_material
FOR SELECT
USING (
  fabrica_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM fabrica WHERE id = sugestoes_categoria_material.fabrica_id AND user_id = auth.uid())
);

CREATE POLICY "Fornecedores podem criar sugestões de categorias"
ON public.sugestoes_categoria_material
FOR INSERT
WITH CHECK (
  fornecedor_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM fornecedor WHERE id = sugestoes_categoria_material.fornecedor_id AND user_id = auth.uid())
);

CREATE POLICY "Fornecedores podem ver suas sugestões de categorias"
ON public.sugestoes_categoria_material
FOR SELECT
USING (
  fornecedor_id IS NOT NULL AND 
  EXISTS (SELECT 1 FROM fornecedor WHERE id = sugestoes_categoria_material.fornecedor_id AND user_id = auth.uid())
);

-- Trigger para updated_at
CREATE TRIGGER update_categorias_material_updated_at
  BEFORE UPDATE ON public.categorias_material
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sugestoes_categoria_material_updated_at
  BEFORE UPDATE ON public.sugestoes_categoria_material
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Adicionar coluna categoria_id na tabela materials para relacionar com a nova tabela
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS categoria_id uuid REFERENCES public.categorias_material(id);

-- Atualizar materials existentes para usar a nova tabela de categorias (mapeando o campo type)
-- Isso será feito via código após a migração