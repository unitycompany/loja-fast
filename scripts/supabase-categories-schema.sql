-- supabase-categories-schema.sql
-- Cria tabela categories para armazenar o JSON de categorias exatamente como no arquivo
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.categories (
  id text PRIMARY KEY,
  data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at_categories()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_categories_set_updated_at ON public.categories;
CREATE TRIGGER trigger_categories_set_updated_at
BEFORE UPDATE ON public.categories
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_updated_at_categories();

-- Fim
