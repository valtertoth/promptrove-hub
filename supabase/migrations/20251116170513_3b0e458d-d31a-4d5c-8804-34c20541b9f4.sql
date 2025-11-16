-- Criar tabela de personalizações de produto (componentes como Tampo, Base, etc)
CREATE TABLE public.personalizacoes_produto (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  produto_id UUID NOT NULL REFERENCES public.produtos(id) ON DELETE CASCADE,
  nome_componente TEXT NOT NULL, -- Ex: "Tampo", "Base", "Estrutura"
  descricao TEXT,
  fornecedor_id UUID REFERENCES public.fornecedor(id) ON DELETE SET NULL,
  material TEXT, -- Ex: "Madeira Maciça Peroba-Rosa"
  acabamento TEXT, -- Ex: "Cor Natural"
  observacoes TEXT,
  ordem INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.personalizacoes_produto ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para personalizacoes_produto
CREATE POLICY "Fábricas podem gerenciar personalizações de seus produtos"
ON public.personalizacoes_produto
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.produtos
    JOIN public.fabrica ON produtos.fabrica_id = fabrica.id
    WHERE produtos.id = personalizacoes_produto.produto_id
    AND fabrica.user_id = auth.uid()
  )
);

CREATE POLICY "Personalizações são públicas"
ON public.personalizacoes_produto
FOR SELECT
USING (true);

-- Criar tabela de convites para fornecedores
CREATE TABLE public.convites_fornecedor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  fabrica_id UUID NOT NULL REFERENCES public.fabrica(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  nome_empresa TEXT,
  mensagem TEXT,
  status TEXT DEFAULT 'pendente', -- pendente, aceito, rejeitado
  token TEXT UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (now() + interval '7 days'),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.convites_fornecedor ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para convites_fornecedor
CREATE POLICY "Fábricas podem gerenciar seus convites"
ON public.convites_fornecedor
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.fabrica
    WHERE fabrica.id = convites_fornecedor.fabrica_id
    AND fabrica.user_id = auth.uid()
  )
);

CREATE POLICY "Convites são visíveis por token"
ON public.convites_fornecedor
FOR SELECT
USING (true);

-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  tipo TEXT NOT NULL, -- 'sugestao_aprovada', 'sugestao_rejeitada', 'convite_fornecedor', etc
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  lida BOOLEAN DEFAULT false,
  data_leitura TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para notificacoes
CREATE POLICY "Usuários podem ver suas notificações"
ON public.notificacoes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar suas notificações"
ON public.notificacoes
FOR UPDATE
USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at em personalizacoes_produto
CREATE TRIGGER update_personalizacoes_produto_updated_at
BEFORE UPDATE ON public.personalizacoes_produto
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para criar notificação quando sugestão de tipo é aprovada
CREATE OR REPLACE FUNCTION public.notificar_sugestao_tipo_aprovada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o status mudou para aprovado, criar notificação
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    SELECT 
      f.user_id,
      'sugestao_aprovada',
      'Sugestão Aprovada! 🎉',
      CASE 
        WHEN NEW.mensagem_admin IS NOT NULL AND NEW.mensagem_admin != ''
        THEN 'Sua sugestão "' || NEW.nome_sugerido || '" foi aprovada! Mensagem do admin: ' || NEW.mensagem_admin
        ELSE 'Sua sugestão "' || NEW.nome_sugerido || '" foi aprovada e já está disponível no sistema!'
      END,
      jsonb_build_object(
        'sugestao_id', NEW.id,
        'tipo', 'tipo_produto',
        'nome_sugerido', NEW.nome_sugerido
      )
    FROM public.fabrica f
    WHERE f.id = NEW.fabrica_id;
  END IF;
  
  -- Se o status mudou para rejeitado, criar notificação
  IF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status != 'rejeitado') THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    SELECT 
      f.user_id,
      'sugestao_rejeitada',
      'Sugestão Não Aprovada',
      CASE 
        WHEN NEW.mensagem_admin IS NOT NULL AND NEW.mensagem_admin != ''
        THEN 'Sua sugestão "' || NEW.nome_sugerido || '" não foi aprovada. Mensagem do admin: ' || NEW.mensagem_admin
        ELSE 'Sua sugestão "' || NEW.nome_sugerido || '" não foi aprovada.'
      END,
      jsonb_build_object(
        'sugestao_id', NEW.id,
        'tipo', 'tipo_produto',
        'nome_sugerido', NEW.nome_sugerido
      )
    FROM public.fabrica f
    WHERE f.id = NEW.fabrica_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificações de sugestões de tipo
CREATE TRIGGER notificar_sugestao_tipo_status
AFTER UPDATE ON public.sugestoes_tipo_produto
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION public.notificar_sugestao_tipo_aprovada();

-- Função para criar notificação quando sugestão de campo é aprovada
CREATE OR REPLACE FUNCTION public.notificar_sugestao_campo_aprovada()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Se o status mudou para aprovado, criar notificação
  IF NEW.status = 'aprovado' AND (OLD.status IS NULL OR OLD.status != 'aprovado') THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    SELECT 
      f.user_id,
      'sugestao_aprovada',
      'Sugestão Aprovada! 🎉',
      CASE 
        WHEN NEW.mensagem_admin IS NOT NULL AND NEW.mensagem_admin != ''
        THEN 'Sua sugestão de ' || NEW.nome_campo || ' "' || NEW.valor_sugerido || '" foi aprovada! Mensagem do admin: ' || NEW.mensagem_admin
        ELSE 'Sua sugestão de ' || NEW.nome_campo || ' "' || NEW.valor_sugerido || '" foi aprovada e já está disponível!'
      END,
      jsonb_build_object(
        'sugestao_id', NEW.id,
        'tipo', 'campo_produto',
        'nome_campo', NEW.nome_campo,
        'valor_sugerido', NEW.valor_sugerido
      )
    FROM public.fabrica f
    WHERE f.id = NEW.fabrica_id;
  END IF;
  
  -- Se o status mudou para rejeitado, criar notificação
  IF NEW.status = 'rejeitado' AND (OLD.status IS NULL OR OLD.status != 'rejeitado') THEN
    INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, metadata)
    SELECT 
      f.user_id,
      'sugestao_rejeitada',
      'Sugestão Não Aprovada',
      CASE 
        WHEN NEW.mensagem_admin IS NOT NULL AND NEW.mensagem_admin != ''
        THEN 'Sua sugestão de ' || NEW.nome_campo || ' "' || NEW.valor_sugerido || '" não foi aprovada. Mensagem do admin: ' || NEW.mensagem_admin
        ELSE 'Sua sugestão de ' || NEW.nome_campo || ' "' || NEW.valor_sugerido || '" não foi aprovada.'
      END,
      jsonb_build_object(
        'sugestao_id', NEW.id,
        'tipo', 'campo_produto',
        'nome_campo', NEW.nome_campo,
        'valor_sugerido', NEW.valor_sugerido
      )
    FROM public.fabrica f
    WHERE f.id = NEW.fabrica_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger para notificações de sugestões de campo
CREATE TRIGGER notificar_sugestao_campo_status
AFTER UPDATE ON public.sugestoes_campo_produto
FOR EACH ROW
WHEN (NEW.status IS DISTINCT FROM OLD.status)
EXECUTE FUNCTION public.notificar_sugestao_campo_aprovada();