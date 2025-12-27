-- Remover políticas restritivas e recriar como permissivas para tipos_produto
DROP POLICY IF EXISTS "Tipos de produtos ativos são públicos" ON public.tipos_produto;
DROP POLICY IF EXISTS "Admins podem gerenciar tipos de produtos" ON public.tipos_produto;

CREATE POLICY "Tipos de produtos ativos são públicos" 
ON public.tipos_produto 
FOR SELECT 
TO public
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar tipos de produtos" 
ON public.tipos_produto 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

-- Remover políticas restritivas e recriar como permissivas para ambientes
DROP POLICY IF EXISTS "Ambientes ativos são públicos" ON public.ambientes;
DROP POLICY IF EXISTS "Admins podem gerenciar ambientes" ON public.ambientes;

CREATE POLICY "Ambientes ativos são públicos" 
ON public.ambientes 
FOR SELECT 
TO public
USING (ativo = true);

CREATE POLICY "Admins podem gerenciar ambientes" 
ON public.ambientes 
FOR ALL 
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));