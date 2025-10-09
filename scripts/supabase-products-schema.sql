-- supabase-products-schema.sql
-- Arquivo SQL completo para criar a tabela `products` no Supabase/Postgres
-- Inclui: extensões necessárias, tabela, índices, triggers para tsvector e updated_at, e exemplos de INSERT/UPSERT.
-- Execute no SQL Editor do Supabase (ou via psql conectado ao DB do Supabase).

-- 1) Extensões necessárias
CREATE EXTENSION IF NOT EXISTS "pgcrypto"; -- para gen_random_uuid()

-- 2) Criar tabela products
CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  name text NOT NULL,
  shortdescription text,
  price numeric(12,2),
  currency text,
  category text,
  category_slug text,
  subcategory text,
  category_path jsonb,
  brand jsonb,
  brand_id uuid,
  brand_slug text,
  "brandName" text,
  sku text,
  gtin text,
  mpn text,
  availability text,
  condition text,
  stock numeric(12,2),
  description text,
  long_description text,
  description_html text,
  dimensions jsonb,
  weight jsonb,
  images jsonb,
  additional_images jsonb,
  properties jsonb,
  units jsonb,
  measures jsonb,
  default_measure_id text,
  default_unit_key text,
  shipping jsonb,
  seo jsonb,
  merchant jsonb,
  search_terms jsonb,
  faqs jsonb,
  schema_org jsonb,
  tsv tsvector,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2.1) Migração rápida para tabelas existentes: garante que as colunas estejam presentes
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS shortdescription text,
  ADD COLUMN IF NOT EXISTS category_slug text,
  ADD COLUMN IF NOT EXISTS brand_id uuid,
  ADD COLUMN IF NOT EXISTS brand_slug text,
  ADD COLUMN IF NOT EXISTS "brandName" text,
  ADD COLUMN IF NOT EXISTS stock numeric(12,2);

-- 3) Triggers / functions
-- Atualiza a coluna updated_at em UPDATE
CREATE OR REPLACE FUNCTION public.trigger_set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_set_updated_at ON public.products;
CREATE TRIGGER trigger_products_set_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.trigger_set_updated_at();

-- Função para popular tsvector a partir de name + description
CREATE OR REPLACE FUNCTION public.products_tsv_trigger()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.tsv := to_tsvector('portuguese', coalesce(NEW.name,'') || ' ' || coalesce(NEW.description,''));
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_products_tsv ON public.products;
CREATE TRIGGER trigger_products_tsv
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW
EXECUTE PROCEDURE public.products_tsv_trigger();

-- 4) Índices úteis
-- índice por slug
CREATE INDEX IF NOT EXISTS idx_products_slug ON public.products (slug);
-- índice por price para consultas ordenadas
CREATE INDEX IF NOT EXISTS idx_products_price ON public.products USING btree (price);
-- indice tsv (full-text)
CREATE INDEX IF NOT EXISTS idx_products_tsv ON public.products USING gin (tsv);
-- índices GIN para colunas jsonb que podem ser consultadas por contains
CREATE INDEX IF NOT EXISTS idx_products_search_terms_gin ON public.products USING gin (search_terms jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_products_images_gin ON public.products USING gin (images jsonb_path_ops);
CREATE INDEX IF NOT EXISTS idx_products_merchant_gin ON public.products USING gin (merchant jsonb_path_ops);

-- OBS: jsonb_path_ops é eficiente para operações @> e consultas por chave/valor.

-- 5) Exemplos de INSERT e UPSERT
-- Exemplo simples de INSERT (preencha os valores conforme seu JSON). Note o cast ::jsonb para colunas JSONB.

INSERT INTO public.products (
  slug, name, shortdescription, price, currency, category, category_slug, subcategory,
  category_path, brand, brand_id, brand_slug, "brandName", sku, gtin, mpn,
  availability, condition, stock, description, long_description, description_html,
  dimensions, weight, images, additional_images, properties, units, measures,
  default_measure_id, shipping, seo, merchant, search_terms, faqs, schema_org
)
VALUES (
  'montante-drywall-m48-3-00-m',
  'Montante Drywall M48 - 3,00 m (Placo)',
  'Perfil estrutural em aço galvanizado para drywall.',
  12.90,
  'BRL',
  'Drywall',
  'drywall',
  'Montante M48',
  '["Construção a Seco","Perfis Drywall","Montante M48"]'::jsonb,
  '{"name": "Placo"}'::jsonb,
  'e0f29653-9a3c-4f50-81ff-111111111111',
  'placo',
  'Placo do Brasil',
  '123456',
  '7890000000000',
  'M48-3000',
  'in_stock',
  'new',
  150,
  'Montante de aço galvanizado M48 para estruturas em drywall...',
  'O Montante Drywall M48 (Placo) é produzido em aço galvanizado... ',
  '<h2>Montante Drywall M48 - 3,00 m (Placo)</h2><p>Perfil estrutural em <strong>aço galvanizado</strong>...</p>' ,
  '{"height":3000, "width":48, "depth":20, "unit":"mm"}'::jsonb,
  '{"value":1.2, "unit":"kg"}'::jsonb,
  '[{"url":"https://imagedelivery.net/1n9Gwvyk.../public","alt":"Montante..."}]'::jsonb,
  '[{"url":"https://imagedelivery.net/1n9Gwvyk.../public","alt":"Detalhe..."}]'::jsonb,
  '[{"name":"Material","value":"Aço galvanizado (Z275 ou equivalente)"}]'::jsonb,
  '[{"key":"un","label":"un","price":12.9,"baseQuantity":1,"defaultQuantity":1}]'::jsonb,
  '[{"id":"m1","label":"3,00 m","length":3000,"width":48,"depth":20,"unit":"mm"}]'::jsonb,
  'm1',
  '{"packageDimensions":{"length":3000,"width":50,"height":20,"unit":"mm"},"packageWeight":{"value":1.4,"unit":"kg"},"requiresFreightQuote": true}'::jsonb,
  '{"metaTitle":"Montante Drywall M48 3,00 m | Perfil em Aço Galvanizado Placo","metaDescription":"Montante M48 Placo para drywall..."}'::jsonb,
  '{"google_product_category_id":188, "material":"Steel","color":"Zinc","size":"48x3000mm"}'::jsonb,
  '["montante drywall","perfil m48","perfil drywall 48mm"]'::jsonb,
  '[{"q":"O Montante M48 pode ser usado em áreas úmidas?","a":"O perfil é metálico..."}]'::jsonb,
  '{"@context":"https://schema.org","@type":"Product","name":"Montante Drywall M48 - 3,00 m (Placo)"}'::jsonb
);

-- Exemplo de UPSERT por slug (insere ou atualiza)
INSERT INTO public.products (slug, name, price, currency, brand, "brandName", images, seo, stock)
VALUES (
  'montante-drywall-m48-3-00-m',
  'Montante Drywall M48 - 3,00 m (Placo)',
  12.90,
  'BRL',
  '{"name":"Placo"}'::jsonb,
  'Placo do Brasil',
  '[{"url":"https://imagedelivery.net/.../public"}]'::jsonb,
  '{"metaTitle":"Montante M48..."}'::jsonb,
  150
)
ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    price = EXCLUDED.price,
    currency = EXCLUDED.currency,
    brand = EXCLUDED.brand,
    "brandName" = EXCLUDED."brandName",
    images = EXCLUDED.images,
    seo = EXCLUDED.seo,
    stock = EXCLUDED.stock,
    updated_at = now();

-- 6) Notas e recomendações (executar manualmente no Supabase SQL editor)
-- - Se você pretende importar muitos produtos, prefira usar um script via supabase-js com a Service Role Key
--   ou use a funcionalidade de "Import" do Supabase (Data -> Import table) para JSON.
-- - Não coloque a Service Role Key no frontend. Use-a apenas para scripts de import/ETL no servidor.
-- - Se quiser fazer buscas textuais por nome/descrição, utilize a coluna `tsv` criada acima e crie índices adicionais conforme preciso.
-- - Caso queira normalizar brands ou criar tabelas relacionadas (units, measures, etc.), posso fornecer SQL adicional.

-- Fim do arquivo
