-- supabase-banners-schema.sql
-- Cria tabela banners para armazenar banners usados no site
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.banners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL, -- onde o banner aparece (ex: home, disclosure, etc)
  url_mobile text,
  url_desktop text,
  image text, -- fallback/alternate image
  alt text,
  href text,
  rota text,
  height text,
  meta jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at_banners()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_banners_set_updated_at ON public.banners;
CREATE TRIGGER trigger_banners_set_updated_at
BEFORE UPDATE ON public.banners
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_updated_at_banners();

CREATE INDEX IF NOT EXISTS idx_banners_type ON public.banners (type);

-- Fim
