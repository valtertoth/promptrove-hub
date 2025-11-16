-- Adicionar política UPDATE para permitir usuários atualizarem suas próprias roles
CREATE POLICY "Usuarios podem atualizar sua propria role"
ON public.user_roles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id 
  AND role = ANY (ARRAY['fabrica'::app_role, 'fornecedor'::app_role, 'especificador'::app_role])
);