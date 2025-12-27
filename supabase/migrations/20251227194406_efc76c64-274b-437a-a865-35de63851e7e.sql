-- Corrigir RLS da tabela materials para usar fornecedor.id ao invés de user_id direto
DROP POLICY IF EXISTS "Fornecedor gerencia seus materiais" ON public.materials;

CREATE POLICY "Fornecedor gerencia seus materiais" 
ON public.materials 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fornecedor f 
    WHERE f.id = materials.supplier_id 
    AND f.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.fornecedor f 
    WHERE f.id = materials.supplier_id 
    AND f.user_id = auth.uid()
  )
);