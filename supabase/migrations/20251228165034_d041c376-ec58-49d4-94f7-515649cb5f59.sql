-- Migração para unificar tabelas products e produtos
-- Estratégia: criar registros na tabela fabrica para fabricantes existentes

-- 1. Criar registros na tabela fabrica para cada manufacturer_id em products que não tem fabrica
INSERT INTO public.fabrica (id, user_id, nome, email, ativo, created_at)
SELECT 
  gen_random_uuid(),
  p.manufacturer_id,
  COALESCE(prof.nome, 'Fábrica'),
  COALESCE(prof.email, 'sem-email@temp.com'),
  true,
  NOW()
FROM (SELECT DISTINCT manufacturer_id FROM public.products) p
LEFT JOIN public.profiles prof ON prof.id = p.manufacturer_id
WHERE NOT EXISTS (
  SELECT 1 FROM public.fabrica f WHERE f.user_id = p.manufacturer_id
);

-- 2. Migrar dados existentes de products para produtos
INSERT INTO public.produtos (
  id,
  nome,
  tipo_produto,
  descricao,
  imagens,
  fabrica_id,
  ativo,
  created_at
)
SELECT 
  p.id,
  p.name as nome,
  p.category as tipo_produto,
  p.description as descricao,
  CASE 
    WHEN p.image_url IS NOT NULL THEN jsonb_build_array(p.image_url)
    ELSE '[]'::jsonb
  END as imagens,
  f.id as fabrica_id,  -- Agora usando o id da tabela fabrica
  COALESCE(p.is_active, true) as ativo,
  p.created_at
FROM public.products p
JOIN public.fabrica f ON f.user_id = p.manufacturer_id
ON CONFLICT (id) DO NOTHING;

-- 3. Migrar dados de product_materials para produto_materiais
INSERT INTO public.produto_materiais (
  id,
  produto_id,
  material_id,
  created_at
)
SELECT 
  pm.id,
  pm.product_id as produto_id,
  pm.material_id,
  pm.created_at
FROM public.product_materials pm
WHERE EXISTS (SELECT 1 FROM public.produtos WHERE id = pm.product_id)
ON CONFLICT (id) DO NOTHING;