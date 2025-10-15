-- Adiciona campo is_active na tabela products
-- Produtos ativos aparecem no site, inativos ficam ocultos
-- Por padrão, produtos com imagem são ativos, sem imagem são inativos

ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Cria índice para consultas de produtos ativos
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);

-- Atualiza produtos existentes: inativos se não tiverem imagem
UPDATE public.products
SET is_active = (
  CASE 
    WHEN images IS NOT NULL 
         AND jsonb_array_length(images) > 0 
         AND images->0 IS NOT NULL 
         AND images->0 <> 'null'::jsonb
         AND images->0 <> '""'::jsonb
    THEN true
    ELSE false
  END
)
WHERE is_active IS NULL OR is_active = true;

-- Comentário na coluna
COMMENT ON COLUMN public.products.is_active IS 'Indica se o produto está ativo e visível no site. Produtos sem imagem são automaticamente marcados como inativos.';
