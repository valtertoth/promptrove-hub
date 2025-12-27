
-- Remove a foreign key constraint de materials para auth.users
-- Isso permite que fornecedores sejam identificados pelo ID da tabela fornecedor
ALTER TABLE public.materials DROP CONSTRAINT IF EXISTS materials_supplier_id_fkey;

-- Adicionar foreign key para a tabela fornecedor (opcional, para integridade)
-- Primeiro verificamos se a coluna pode aceitar os IDs dos fornecedores
