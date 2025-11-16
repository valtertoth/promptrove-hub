-- Create a public view for especificadores that only exposes non-sensitive information
CREATE OR REPLACE VIEW public.especificadores_publicos AS
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

-- Drop the existing public policy on especificador table
DROP POLICY IF EXISTS "Especificadores aprovados são públicos" ON public.especificador;

-- Add a more restrictive comment explaining the change
COMMENT ON VIEW public.especificadores_publicos IS 'Public view of approved specifiers with only non-sensitive information. Contact details are hidden for privacy.';