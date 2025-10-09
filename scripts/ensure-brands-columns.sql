-- ensure-brands-columns.sql
-- Idempotent: garante colunas esperadas pela aplicação na tabela brands
-- Execute no SQL Editor do Supabase (qualquer número de vezes)

-- Garante função de UUID e default da coluna id
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
ALTER TABLE IF EXISTS public.brands
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE IF EXISTS public.brands
  ADD COLUMN IF NOT EXISTS "bgColor" text,
  ADD COLUMN IF NOT EXISTS "companyName" text,
  ADD COLUMN IF NOT EXISTS "imageCompany" text,
  ADD COLUMN IF NOT EXISTS description text;
