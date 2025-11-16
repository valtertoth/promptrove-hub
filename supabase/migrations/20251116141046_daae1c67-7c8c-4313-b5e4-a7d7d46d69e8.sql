-- Adicionar política DELETE para permitir usuários removerem suas próprias roles
CREATE POLICY "Usuarios podem deletar suas proprias roles"
ON public.user_roles
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);