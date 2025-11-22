-- Criar bucket público para imagens de materiais
INSERT INTO storage.buckets (id, name, public)
VALUES ('material-images', 'material-images', true);

-- Política: Qualquer pessoa pode ver as imagens
CREATE POLICY "Imagens de materiais são públicas"
ON storage.objects
FOR SELECT
USING (bucket_id = 'material-images');

-- Política: Usuários autenticados podem fazer upload
CREATE POLICY "Usuários autenticados podem fazer upload de imagens"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'material-images');

-- Política: Usuários autenticados podem atualizar imagens
CREATE POLICY "Usuários autenticados podem atualizar imagens"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'material-images');

-- Política: Usuários autenticados podem deletar imagens
CREATE POLICY "Usuários autenticados podem deletar imagens"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'material-images');