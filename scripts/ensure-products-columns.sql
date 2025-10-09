-- ensure-products-columns.sql
-- Executar este script no Supabase (SQL Editor) para garantir que a tabela `public.products`
-- contenha todas as colunas utilizadas pelo app. O script é idempotente graças ao `IF NOT EXISTS`.
-- Ajusta índices e defaults relevantes.

BEGIN;

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS name text,
  ADD COLUMN IF NOT EXISTS shortdescription text,
  ADD COLUMN IF NOT EXISTS price numeric(12,2),
  ADD COLUMN IF NOT EXISTS currency text,
  ADD COLUMN IF NOT EXISTS category text,
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS subcategory text,
  ADD COLUMN IF NOT EXISTS category_path jsonb,
  ADD COLUMN IF NOT EXISTS brand jsonb,
  ADD COLUMN IF NOT EXISTS brand_id uuid,
  ADD COLUMN IF NOT EXISTS brand_slug text,
  ADD COLUMN IF NOT EXISTS "brandName" text,
  ADD COLUMN IF NOT EXISTS sku text,
  ADD COLUMN IF NOT EXISTS gtin text,
  ADD COLUMN IF NOT EXISTS mpn text,
  ADD COLUMN IF NOT EXISTS availability text,
  ADD COLUMN IF NOT EXISTS condition text,
  ADD COLUMN IF NOT EXISTS stock numeric(12,2),
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS long_description text,
  ADD COLUMN IF NOT EXISTS description_html text,
  ADD COLUMN IF NOT EXISTS dimensions jsonb,
  ADD COLUMN IF NOT EXISTS weight jsonb,
  ADD COLUMN IF NOT EXISTS images jsonb,
  ADD COLUMN IF NOT EXISTS additional_images jsonb,
  ADD COLUMN IF NOT EXISTS properties jsonb,
  ADD COLUMN IF NOT EXISTS units jsonb,
  ADD COLUMN IF NOT EXISTS measures jsonb,
  ADD COLUMN IF NOT EXISTS default_measure_id text,
  ADD COLUMN IF NOT EXISTS default_unit_key text,
  ADD COLUMN IF NOT EXISTS shipping jsonb,
  ADD COLUMN IF NOT EXISTS seo jsonb,
  ADD COLUMN IF NOT EXISTS merchant jsonb,
  ADD COLUMN IF NOT EXISTS search_terms jsonb,
  ADD COLUMN IF NOT EXISTS faqs jsonb,
  ADD COLUMN IF NOT EXISTS schema_org jsonb,
  ADD COLUMN IF NOT EXISTS tsv tsvector,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now(),
  ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();

-- Garante unicidade de slug com índice único idempotente
CREATE UNIQUE INDEX IF NOT EXISTS idx_products_slug_unique ON public.products (slug);

-- Defaults e triggers de atualização
ALTER TABLE public.products
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.products_tsv_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.tsv := to_tsvector('portuguese', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_set_updated_at ON public.products;
CREATE TRIGGER trigger_products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_updated_at();

DROP TRIGGER IF EXISTS trigger_products_tsv ON public.products;
CREATE TRIGGER trigger_products_tsv
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.products_tsv_trigger();

-- Índices úteis (não falham se já existirem)
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products USING btree (price);
CREATE INDEX IF NOT EXISTS idx_products_brand_slug ON public.products (brand_slug);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products (category);
CREATE INDEX IF NOT EXISTS idx_products_subcategory ON public.products (subcategory);
CREATE INDEX IF NOT EXISTS idx_products_tsv ON public.products USING gin (tsv);
CREATE INDEX IF NOT EXISTS idx_products_search_terms_gin ON public.products USING gin (search_terms jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_products_images_gin ON public.products USING gin (images jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_products_merchant_gin ON public.products USING gin (merchant jsonb_path_ops);

COMMIT;
