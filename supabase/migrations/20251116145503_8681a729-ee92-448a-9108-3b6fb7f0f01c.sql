-- Drop and recreate the view without SECURITY DEFINER (defaults to SECURITY INVOKER which is safer)
DROP VIEW IF EXISTS public.especificadores_publicos;

CREATE VIEW public.especificadores_publicos 
WITH (security_invoker = true)
AS
SELECT 
  id,
  nome,
  tipo,
  cidade,
  estado,
  pais,
  descricao,
  portfolio_url,
  especialidades,
  regioes,
  created_at
FROM public.especificador
WHERE aprovado = true AND ativo = true;

-- Grant SELECT access to the view
GRANT SELECT ON public.especificadores_publicos TO anon, authenticated;

COMMENT ON VIEW public.especificadores_publicos IS 'Public view of approved specifiers with only non-sensitive information. Contact details are hidden for privacy.';