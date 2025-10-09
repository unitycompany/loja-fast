Importando produtos para o Supabase

Como usar o script `import-products.js`:

1. Crie/edite um arquivo .env local (não comitar) e defina:

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

2. No PowerShell, execute:

$env:SUPABASE_URL='https://your-project-ref.supabase.co'
$env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'
node .\scripts\import-products.js

3. O script fará upsert dos produtos por `slug`.

Como verificar arrays/objects no Supabase SQL:

-- Selecionar imagens e propriedades do produto
SELECT id, slug, images, properties, units, measures FROM public.products WHERE slug = 'montante-drywall-m48-3-00-m';

-- Verificar se images é um array e contém keys
SELECT jsonb_typeof(images) as images_type, jsonb_array_length(images) as images_len FROM public.products WHERE slug = 'montante-drywall-m48-3-00-m';

Se os arrays/objects não aparecerem como esperado:
- Verifique o payload enviado pelo script (o script não faz stringify agora — supabase-js deve mapear JS objects para jsonb automaticamente).
- Se já existem registros antigos com campos nulos/strings, re-run do upsert deve sobrescrever (o ON CONFLICT atual faz set de colunas). Se não estiver sobrescrevendo, podemos rodar uma query UPDATE manual para setar os campos JSONB a partir de um JSON temporário.

*** FIM ***

Importando brands para o Supabase

Como usar o script `import-brands.js`:

1. Crie/edite um arquivo .env local (não comitar) e defina as variáveis necessárias:

SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

2. No PowerShell (ou terminal), execute:

$env:SUPABASE_URL='https://your-project-ref.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'; node .\scripts\import-brands.js

3. O script fará upsert das marcas por `slug`, tentará vincular `products.brand_id` onde `products.brand->>'name'` bater com o nome da marca, e recalculará `number_products` contando produtos vinculados.

Verificações úteis (SQL no Supabase):

-- Ver marcas e contagem
SELECT id, name, slug, number_products FROM public.brands ORDER BY name LIMIT 50;

-- Ver produtos sem brand_id (para diagnosticar links faltantes)
SELECT id, slug, brand FROM public.products WHERE brand_id IS NULL LIMIT 30;

Importando categories para o Supabase

Como usar o script `import-categories.js`:

1. Execute o arquivo de schema `scripts/supabase-categories-schema.sql` no SQL Editor do Supabase (cria a tabela `public.categories`).

2. Em seguida, rode o script de import localmente (usa SERVICE ROLE key):

$env:SUPABASE_URL='https://your-project-ref.supabase.co'; $env:SUPABASE_SERVICE_ROLE_KEY='your-service-role-key'; node .\scripts\import-categories.js

3. Verifique os registros:

SELECT id, data FROM public.categories ORDER BY created_at DESC LIMIT 50;

