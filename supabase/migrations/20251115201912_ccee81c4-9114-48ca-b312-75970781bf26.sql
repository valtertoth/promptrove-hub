-- Corrigir função calcular_perfil_completo_fabrica com search_path seguro  
CREATE OR REPLACE FUNCTION public.calcular_perfil_completo_fabrica(fabrica_id UUID)
RETURNS INTEGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_campos INTEGER := 10;
  campos_preenchidos INTEGER := 0;
BEGIN
  SELECT 
    (CASE WHEN nome IS NOT NULL AND nome != '' THEN 1 ELSE 0 END) +
    (CASE WHEN descricao IS NOT NULL AND descricao != '' THEN 1 ELSE 0 END) +
    (CASE WHEN logo_url IS NOT NULL AND logo_url != '' THEN 1 ELSE 0 END) +
    (CASE WHEN cidade IS NOT NULL AND cidade != '' THEN 1 ELSE 0 END) +
    (CASE WHEN estado IS NOT NULL AND estado != '' THEN 1 ELSE 0 END) +
    (CASE WHEN email IS NOT NULL AND email != '' THEN 1 ELSE 0 END) +
    (CASE WHEN telefone IS NOT NULL AND telefone != '' THEN 1 ELSE 0 END) +
    (CASE WHEN site IS NOT NULL AND site != '' THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(faqs) > 0 THEN 1 ELSE 0 END) +
    (CASE WHEN jsonb_array_length(regioes_autorizadas) > 0 THEN 1 ELSE 0 END)
  INTO campos_preenchidos
  FROM public.fabrica
  WHERE id = fabrica_id;
  
  RETURN (campos_preenchidos * 100 / total_campos);
END;
$$;