-- Permitir admin deletar fornecedores
CREATE POLICY "Admins podem deletar fornecedores"
ON public.fornecedor
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admin deletar fábricas  
CREATE POLICY "Admins podem deletar fábricas"
ON public.fabrica
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Permitir admin deletar especificadores
CREATE POLICY "Admins podem deletar especificadores"
ON public.especificador
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));