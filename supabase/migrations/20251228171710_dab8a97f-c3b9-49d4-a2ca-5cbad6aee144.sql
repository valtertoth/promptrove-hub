-- Adicionar campos para gestão granular de cidades autorizadas
-- authorized_cities: JSONB com estrutura { "UF": { "all": boolean, "cities": ["cidade1", "cidade2"] } }
-- Exemplo: { "SP": { "all": true }, "RJ": { "all": false, "cities": ["Rio de Janeiro", "Niterói"] } }

ALTER TABLE public.commercial_connections 
ADD COLUMN IF NOT EXISTS authorized_cities JSONB DEFAULT '{}'::jsonb;

-- Adicionar campos de endereço completo ao application_data
COMMENT ON COLUMN public.commercial_connections.authorized_cities IS 
'Estrutura de cidades autorizadas por estado. Formato: { "UF": { "all": boolean, "cities": string[] } }. 
Se "all" for true, todas as cidades do estado estão autorizadas. 
Se "all" for false, apenas as cidades listadas em "cities" estão autorizadas.';