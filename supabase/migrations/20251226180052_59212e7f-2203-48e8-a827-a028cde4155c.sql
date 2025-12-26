-- Adiciona a trava de segurança que faltou na tabela projetos
ALTER TABLE public.projetos
ADD CONSTRAINT fk_projetos_especificador
FOREIGN KEY (especificador_id)
REFERENCES public.especificador(id)
ON DELETE CASCADE;

-- Adiciona a trava de segurança que faltou na tabela itens_projeto
ALTER TABLE public.itens_projeto
ADD CONSTRAINT fk_itens_projeto_produto
FOREIGN KEY (produto_id)
REFERENCES public.produtos(id)
ON DELETE CASCADE;