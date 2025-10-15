-- Adiciona coluna identifier_exists (para Google Merchant) se ainda não existir
-- Regra: FALSE quando GTIN e MPN estão ambos vazios/nulos. TRUE caso contrário.
-- Ajuste nomes de tabela/colunas conforme seu schema se diferente.

-- 1. Criar a coluna (nullable inicialmente) se não existir
ALTER TABLE products
ADD COLUMN IF NOT EXISTS identifier_exists BOOLEAN;

-- 2. Popular a coluna baseada em gtin e mpn
UPDATE products
SET identifier_exists = CASE 
  WHEN (COALESCE(NULLIF(TRIM(gtin), ''), '') = '' AND COALESCE(NULLIF(TRIM(mpn), ''), '') = '') THEN FALSE
  ELSE TRUE
END;

-- 3. (Opcional) Definir DEFAULT para futuros inserts
ALTER TABLE products
ALTER COLUMN identifier_exists SET DEFAULT TRUE; -- padrão conservador

-- 4. (Opcional) Tornar NOT NULL após garantir preenchimento
UPDATE products SET identifier_exists = TRUE WHERE identifier_exists IS NULL;
ALTER TABLE products
ALTER COLUMN identifier_exists SET NOT NULL;

-- 5. (Opcional) Criar coluna computada em vez de física (postegr >= 12) - alternativa:
-- Se preferir não manter coluna física, remova passos acima e use:
-- ALTER TABLE products ADD COLUMN identifier_exists BOOLEAN GENERATED ALWAYS AS (
--   (NOT ( (COALESCE(NULLIF(TRIM(gtin), ''), '') = '') AND (COALESCE(NULLIF(TRIM(mpn), ''), '') = '') ))
-- ) STORED;

-- 6. View específica para feed Google Merchant (inclui fallback de identifier_exists = FALSE)
CREATE OR REPLACE VIEW products_merchant_feed AS
SELECT 
  p.id,
  p.name AS title,
  p.price,
  p.currency,
  p.gtin,
  p.mpn,
  COALESCE(p.identifier_exists, (NOT ( (COALESCE(NULLIF(TRIM(p.gtin), ''), '') = '') AND (COALESCE(NULLIF(TRIM(p.mpn), ''), '') = '') ))) AS identifier_exists
FROM products p;

-- Teste rápido
-- SELECT id, title, gtin, mpn, identifier_exists FROM products_merchant_feed LIMIT 50;
