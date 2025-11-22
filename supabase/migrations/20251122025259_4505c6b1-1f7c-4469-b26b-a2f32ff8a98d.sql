-- Create commercial_connections table
CREATE TABLE public.commercial_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  factory_id UUID NOT NULL REFERENCES public.fabrica(id) ON DELETE CASCADE,
  specifier_id UUID NOT NULL REFERENCES public.especificador(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  level TEXT NOT NULL DEFAULT 'standard',
  application_data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.commercial_connections ENABLE ROW LEVEL SECURITY;

-- Policy: Especificadores podem criar suas conexões
CREATE POLICY "Especificadores podem criar conexões"
ON public.commercial_connections
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.especificador
    WHERE especificador.id = commercial_connections.specifier_id
    AND especificador.user_id = auth.uid()
  )
);

-- Policy: Especificadores podem ver suas conexões
CREATE POLICY "Especificadores podem ver suas conexões"
ON public.commercial_connections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.especificador
    WHERE especificador.id = commercial_connections.specifier_id
    AND especificador.user_id = auth.uid()
  )
);

-- Policy: Fábricas podem ver suas conexões
CREATE POLICY "Fábricas podem ver suas conexões"
ON public.commercial_connections
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fabrica
    WHERE fabrica.id = commercial_connections.factory_id
    AND fabrica.user_id = auth.uid()
  )
);

-- Policy: Fábricas podem editar suas conexões
CREATE POLICY "Fábricas podem editar suas conexões"
ON public.commercial_connections
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.fabrica
    WHERE fabrica.id = commercial_connections.factory_id
    AND fabrica.user_id = auth.uid()
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_commercial_connections_updated_at
BEFORE UPDATE ON public.commercial_connections
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();