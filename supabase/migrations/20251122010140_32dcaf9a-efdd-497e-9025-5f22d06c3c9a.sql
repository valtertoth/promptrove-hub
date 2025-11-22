-- Add supplier_name column to materials table
ALTER TABLE public.materials 
ADD COLUMN supplier_name TEXT;