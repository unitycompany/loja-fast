-- supabase-brands-schema.sql
-- Cria tabela brands e provê script para popular a partir de products.brand
-- Execute no SQL Editor do Supabase

CREATE TABLE IF NOT EXISTS public.brands (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE,
  meta jsonb,
  logo jsonb,
  number_products integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at_brands()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_brands_set_updated_at ON public.brands;
CREATE TRIGGER trigger_brands_set_updated_at
BEFORE UPDATE ON public.brands
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_updated_at_brands();

-- índice por slug
CREATE INDEX IF NOT EXISTS idx_brands_slug ON public.brands (slug);

-- Garantir colunas adicionais esperadas pela aplicação
ALTER TABLE IF EXISTS public.brands
  ADD COLUMN IF NOT EXISTS "bgColor" text,
  ADD COLUMN IF NOT EXISTS "companyName" text,
  ADD COLUMN IF NOT EXISTS "imageCompany" text,
  ADD COLUMN IF NOT EXISTS description text;

-- Script para popular brands a partir dos products
-- Ele extrai brand.name de products.brand->'name', cria registros únicos em brands
-- e adiciona uma coluna brand_id na tabela products para referência.

ALTER TABLE IF EXISTS public.products ADD COLUMN IF NOT EXISTS brand_id uuid;

WITH extracted AS (
  SELECT DISTINCT (product->'brand'->>'name') AS brand_name
  FROM (
    SELECT to_jsonb(p.*) as product FROM public.products p
  ) t
  WHERE product->'brand'->>'name' IS NOT NULL
)
INSERT INTO public.brands (name, slug)
SELECT brand_name, lower(regexp_replace(brand_name, '\\s+', '-', 'g'))
FROM extracted
ON CONFLICT (slug) DO NOTHING;

-- Atualiza products.brand_id juntando pelo nome
UPDATE public.products p
SET brand_id = b.id
FROM public.brands b
WHERE (p.brand->>'name') = b.name;

-- Exemplo: verificação
-- SELECT p.slug, p.brand, b.id, b.name FROM public.products p LEFT JOIN public.brands b ON p.brand_id = b.id LIMIT 20;

-- Fim
