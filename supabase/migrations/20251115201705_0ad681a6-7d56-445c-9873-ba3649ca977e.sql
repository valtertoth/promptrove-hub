-- Criar enum para tipos de usuário
CREATE TYPE public.app_role AS ENUM ('admin', 'fabrica', 'fornecedor', 'especificador');

-- Criar enum para tipo de material
CREATE TYPE public.tipo_material AS ENUM ('tecido', 'corda', 'aluminio', 'madeira', 'ferro', 'lamina', 'acabamento', 'outro');

-- Criar enum para tipo de especificador
CREATE TYPE public.tipo_especificador AS ENUM ('loja', 'arquiteto', 'designer', 'influenciador', 'representante');

-- Criar enum para plano
CREATE TYPE public.plano_tipo AS ENUM ('normal', 'pro', 'premium');

-- Tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE(user_id, role)
);

-- Função para verificar role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Tabela de fábricas
CREATE TABLE public.fabrica (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  descricao TEXT,
  logo_url TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  email TEXT NOT NULL,
  telefone TEXT,
  site TEXT,
  redes_sociais JSONB DEFAULT '{}',
  faqs JSONB DEFAULT '[]',
  regioes_autorizadas JSONB DEFAULT '[]',
  plano plano_tipo DEFAULT 'normal',
  ativo BOOLEAN DEFAULT true,
  perfil_completo_percentual INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de fornecedores
CREATE TABLE public.fornecedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  nome TEXT NOT NULL,
  tipo_material tipo_material NOT NULL,
  descricao TEXT,
  materiais JSONB DEFAULT '[]',
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  plano plano_tipo DEFAULT 'normal',
  contato JSONB DEFAULT '{}',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de especificadores
CREATE TABLE public.especificador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  tipo tipo_especificador NOT NULL,
  nome TEXT NOT NULL,
  cpf_cnpj TEXT,
  email TEXT NOT NULL,
  telefone TEXT,
  portfolio_url TEXT,
  instagram TEXT,
  cidade TEXT,
  estado TEXT,
  pais TEXT DEFAULT 'Brasil',
  descricao TEXT,
  requisitos_pendentes JSONB DEFAULT '[]',
  aprovado BOOLEAN DEFAULT false,
  especialidades JSONB DEFAULT '[]',
  regioes JSONB DEFAULT '[]',
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de produtos
CREATE TABLE public.produtos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabrica_id UUID REFERENCES public.fabrica(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  tipo_produto TEXT,
  ambientes JSONB DEFAULT '[]',
  imagens JSONB DEFAULT '[]',
  descricao TEXT,
  descricao_gerada_ia TEXT,
  tempo_fabricacao_dias INTEGER,
  ativo BOOLEAN DEFAULT true,
  tags JSONB DEFAULT '[]',
  categorias JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de variações de produto
CREATE TABLE public.variacoes_produto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  medidas JSONB DEFAULT '{}',
  acabamentos JSONB DEFAULT '[]',
  acabamentos_sugeridos_ia JSONB DEFAULT '[]',
  arquivos_referencia JSONB DEFAULT '[]',
  imagens JSONB DEFAULT '[]',
  preco_sugerido DECIMAL(10,2),
  estoque INTEGER DEFAULT 0,
  sku TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de relação fábrica-especificador
CREATE TABLE public.fabrica_especificador (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  fabrica_id UUID REFERENCES public.fabrica(id) ON DELETE CASCADE NOT NULL,
  especificador_id UUID REFERENCES public.especificador(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'pendente', -- pendente, aprovado, rejeitado
  requisitos_cumpridos JSONB DEFAULT '[]',
  mensagem TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(fabrica_id, especificador_id)
);

-- Tabela de avaliações
CREATE TABLE public.avaliacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_avaliado TEXT NOT NULL, -- 'fabrica', 'especificador', 'fornecedor'
  referencia_id UUID NOT NULL,
  autor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nota INTEGER CHECK (nota >= 1 AND nota <= 5),
  comentario TEXT,
  indicadores JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de fornecedores associados a produtos
CREATE TABLE public.produto_fornecedor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  produto_id UUID REFERENCES public.produtos(id) ON DELETE CASCADE NOT NULL,
  fornecedor_id UUID REFERENCES public.fornecedor(id) ON DELETE CASCADE NOT NULL,
  material_utilizado TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(produto_id, fornecedor_id)
);

-- Enable RLS em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrica ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fornecedor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.especificador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produtos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.variacoes_produto ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fabrica_especificador ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.avaliacoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.produto_fornecedor ENABLE ROW LEVEL SECURITY;

-- RLS Policies para profiles
CREATE POLICY "Usuários podem ver seu próprio perfil" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuários podem atualizar seu próprio perfil" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Perfis públicos são visíveis" ON public.profiles FOR SELECT USING (true);

-- RLS Policies para user_roles
CREATE POLICY "Usuários podem ver suas próprias roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins podem gerenciar roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para fabrica
CREATE POLICY "Fábricas podem ver seus dados" ON public.fabrica FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fábricas podem atualizar seus dados" ON public.fabrica FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários autenticados podem criar fábrica" ON public.fabrica FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Fábricas ativas são públicas" ON public.fabrica FOR SELECT USING (ativo = true);

-- RLS Policies para fornecedor
CREATE POLICY "Fornecedores podem ver seus dados" ON public.fornecedor FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Fornecedores podem atualizar seus dados" ON public.fornecedor FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários autenticados podem criar fornecedor" ON public.fornecedor FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Fornecedores ativos são públicos" ON public.fornecedor FOR SELECT USING (ativo = true);

-- RLS Policies para especificador
CREATE POLICY "Especificadores podem ver seus dados" ON public.especificador FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Especificadores podem atualizar seus dados" ON public.especificador FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Usuários autenticados podem criar especificador" ON public.especificador FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Especificadores aprovados são públicos" ON public.especificador FOR SELECT USING (aprovado = true);

-- RLS Policies para produtos
CREATE POLICY "Fábricas podem gerenciar seus produtos" ON public.produtos FOR ALL USING (
  EXISTS (SELECT 1 FROM public.fabrica WHERE fabrica.id = produtos.fabrica_id AND fabrica.user_id = auth.uid())
);
CREATE POLICY "Produtos ativos são públicos" ON public.produtos FOR SELECT USING (ativo = true);
CREATE POLICY "Admins podem gerenciar produtos" ON public.produtos FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies para variacoes_produto
CREATE POLICY "Fábricas podem gerenciar variações" ON public.variacoes_produto FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.produtos 
    JOIN public.fabrica ON produtos.fabrica_id = fabrica.id 
    WHERE produtos.id = variacoes_produto.produto_id AND fabrica.user_id = auth.uid()
  )
);
CREATE POLICY "Variações são públicas" ON public.variacoes_produto FOR SELECT USING (true);

-- RLS Policies para fabrica_especificador
CREATE POLICY "Fábricas podem gerenciar suas relações" ON public.fabrica_especificador FOR ALL USING (
  EXISTS (SELECT 1 FROM public.fabrica WHERE fabrica.id = fabrica_especificador.fabrica_id AND fabrica.user_id = auth.uid())
);
CREATE POLICY "Especificadores podem ver suas candidaturas" ON public.fabrica_especificador FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.especificador WHERE especificador.id = fabrica_especificador.especificador_id AND especificador.user_id = auth.uid())
);
CREATE POLICY "Especificadores podem criar candidaturas" ON public.fabrica_especificador FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.especificador WHERE especificador.id = fabrica_especificador.especificador_id AND especificador.user_id = auth.uid())
);

-- RLS Policies para avaliacoes
CREATE POLICY "Usuários podem criar avaliações" ON public.avaliacoes FOR INSERT WITH CHECK (auth.uid() = autor_id);
CREATE POLICY "Avaliações são públicas" ON public.avaliacoes FOR SELECT USING (true);
CREATE POLICY "Autores podem editar suas avaliações" ON public.avaliacoes FOR UPDATE USING (auth.uid() = autor_id);

-- RLS Policies para produto_fornecedor
CREATE POLICY "Fábricas podem vincular fornecedores" ON public.produto_fornecedor FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.produtos 
    JOIN public.fabrica ON produtos.fabrica_id = fabrica.id 
    WHERE produtos.id = produto_fornecedor.produto_id AND fabrica.user_id = auth.uid()
  )
);
CREATE POLICY "Relações são públicas" ON public.produto_fornecedor FOR SELECT USING (true);

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fabrica_updated_at BEFORE UPDATE ON public.fabrica FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fornecedor_updated_at BEFORE UPDATE ON public.fornecedor FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_especificador_updated_at BEFORE UPDATE ON public.especificador FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_produtos_updated_at BEFORE UPDATE ON public.produtos FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_variacoes_updated_at BEFORE UPDATE ON public.variacoes_produto FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_fabrica_especificador_updated_at BEFORE UPDATE ON public.fabrica_especificador FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para criar profile quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nome, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'nome', 'Novo Usuário'), NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Função para calcular percentual de perfil completo da fábrica
CREATE OR REPLACE FUNCTION public.calcular_perfil_completo_fabrica(fabrica_id UUID)
RETURNS INTEGER AS $$
DECLARE
  total_campos INTEGER := 10;
  campos_preenchidos INTEGER := 0;
BEGIN
  SELECT 
    (CASE WHEN nome IS NOT NULL AND nome != '' THEN 1 ELSE 0 END) +
    (CASE WHEN descricao IS NOT NULL AND descricao != '' THEN 1 ELSE 0 END) +
    (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) +
    (CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 ELSE 0 END) +
    (CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 ELSE 0 END) +
    (CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) +
    (CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 0 END) +
    (CASE WHEN site IS NOT NULL AND site != '' THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(faqs) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(regioes_autorizadas) > 0 THEN 1 ELSE 0 END)
  INTO campos_preenchidos
  FROM public.fabrica
  WHERE id = fabrica_id;
  
  RETURN (campos_preenchidos * 100 / total_campos);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;