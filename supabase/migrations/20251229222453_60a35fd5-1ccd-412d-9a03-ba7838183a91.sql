-- Criar bucket para comprovantes de pagamento
INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes', 'comprovantes', false)
ON CONFLICT (id) DO NOTHING;

-- Policy para especificadores enviarem comprovantes
CREATE POLICY "Especificadores podem enviar comprovantes"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'comprovantes' 
  AND auth.uid() IS NOT NULL
);

-- Policy para especificadores verem seus comprovantes
CREATE POLICY "Especificadores podem ver seus comprovantes"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'comprovantes' 
  AND auth.uid() IS NOT NULL
);

-- Policy para fábricas verem comprovantes de pedidos delas
CREATE POLICY "Fabricas podem ver comprovantes de pedidos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'comprovantes' 
  AND auth.uid() IS NOT NULL
);