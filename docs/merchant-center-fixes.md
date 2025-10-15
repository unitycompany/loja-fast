# 🔧 Correções de Erros - Google Merchant Center

## ❌ Problemas Identificados e Soluções

### 1. ❌ Faltando dados do inventário

**Erro:** "Missing inventory data" ou "Availability ausente"

**Causa:** Produtos sem informações de disponibilidade, preço ou condição.

**Solução Implementada:**
- ✅ Todos os produtos agora incluem `g:availability`
- ✅ Todos os produtos incluem `g:price`
- ✅ Todos os produtos incluem `g:condition`
- ✅ Campo `g:shipping_weight` adicionado

**O que verificar nos seus produtos:**

```javascript
// Cada produto deve ter:
{
  "price": 29.90,              // Obrigatório
  "availability": "in_stock",   // Obrigatório: in_stock, out_of_stock, preorder
  "condition": "new",           // Obrigatório: new, used, refurbished
  "stock": 100,                 // Opcional mas recomendado
  "weight": {
    "value": 1.5,
    "unit": "kg"
  }
}
```

---

### 2. ❌ Não é possível mostrar imagem

**Erro:** "Image not found" ou "Cannot display image"

**Causa:** 
- URL da imagem inválida ou inacessível
- Imagem não está pública
- Domínio da imagem diferente do domínio do link

**Solução Implementada:**
- ✅ URLs de imagem corrigidas para usar Supabase Storage
- ✅ Fallback para imagens padrão quando necessário
- ✅ Validação de URLs antes de incluir no feed

**Como corrigir suas imagens:**

#### Opção 1: Usar Supabase Storage (Recomendado)

1. **Torne o bucket público:**
   ```sql
   -- Execute no Supabase SQL Editor
   UPDATE storage.buckets 
   SET public = true 
   WHERE name = 'product-images';
   ```

2. **Configure políticas de acesso:**
   ```sql
   -- Permitir leitura pública
   CREATE POLICY "Public Access"
   ON storage.objects FOR SELECT
   USING (bucket_id = 'product-images');
   ```

3. **Teste a URL:**
   ```
   https://rfpvhpaoaaqjuojcssdf.supabase.co/storage/v1/object/public/product-images/seu-produto.jpg
   ```

#### Opção 2: Usar CDN Externa

Se preferir usar CDN (Cloudinary, ImageKit, etc.):

```javascript
{
  "imageUrl": "https://res.cloudinary.com/seu-cloud/image/upload/produto.jpg"
}
```

#### Opção 3: Hospedar na Vercel

1. Coloque imagens em `public/assets/products/`
2. URL será: `https://loja-fast.vercel.app/assets/products/produto.jpg`

**Requisitos das Imagens:**
- ✅ Mínimo: 250x250 pixels
- ✅ Recomendado: 800x800 pixels ou maior
- ✅ Formatos: JPG, PNG, GIF, WebP
- ✅ Tamanho máximo: 16MB
- ✅ HTTPS obrigatório
- ✅ Domínio público e acessível

---

### 3. ❌ Domínio incompatível com link

**Erro:** "Domain mismatch" ou "Link and image domain mismatch"

**Causa:** A URL da imagem está em domínio diferente da URL do produto.

**Solução Implementada:**
- ✅ Variável `VITE_SITE_URL` configurada
- ✅ Domínio consistente em todos os links
- ✅ URLs absolutas para imagens e produtos

**Configuração necessária:**

1. **Adicione no `.env`:**
   ```bash
   VITE_SITE_URL=https://loja-fast.vercel.app
   VITE_SUPABASE_URL=https://rfpvhpaoaaqjuojcssdf.supabase.co
   ```

2. **Configure na Vercel:**
   - Dashboard → Settings → Environment Variables
   - Adicione `VITE_SITE_URL` com o valor acima
   - Marque para Production, Preview e Development

3. **Verifique o domínio no Google Merchant:**
   - Tools → Business Information
   - Verifique que `https://loja-fast.vercel.app` está verificado
   - Se não, clique em "Verify and claim website"

**URLs devem ser consistentes:**
```xml
<g:link>https://loja-fast.vercel.app/produto/produto-x</g:link>
<g:image_link>https://loja-fast.vercel.app/assets/produto-x.jpg</g:image_link>
```

**OU use Supabase para imagens:**
```xml
<g:link>https://loja-fast.vercel.app/produto/produto-x</g:link>
<g:image_link>https://SEU_PROJETO.supabase.co/storage/v1/object/public/product-images/produto-x.jpg</g:image_link>
```

---

## ✅ Novos Campos Adicionados

### g:brand (Obrigatório)
```xml
<g:brand>Knauf</g:brand>
```
- Se não tiver marca, usa "Sem marca"

### g:identifier_exists (Obrigatório)
```xml
<g:identifier_exists>yes</g:identifier_exists>
```
- `yes` = tem GTIN/EAN
- `no` = não tem (Google permite para produtos sem código)

### g:mpn (Obrigatório)
```xml
<g:mpn>SKU-12345</g:mpn>
```
- Usa o SKU ou ID do produto

### g:google_product_category (Obrigatório)
```xml
<g:google_product_category>Materiais de Construção > Construção a Seco</g:google_product_category>
```
- Categoria padrão do Google Shopping

### g:shipping_weight (Recomendado)
```xml
<g:shipping_weight>1.5 kg</g:shipping_weight>
```
- Peso para cálculo de frete

---

## 🔍 Como Verificar se Está Correto

### 1. Teste o Feed

Abra no navegador:
```
https://loja-fast.vercel.app/api/product-feed.xml
```

### 2. Verifique um Produto no XML

Procure por `<item>` e verifique se tem todos os campos:

```xml
<item>
  <g:id>produto-123</g:id>
  <g:title>Nome do Produto</g:title>
  <g:description>Descrição completa</g:description>
  <g:link>https://loja-fast.vercel.app/produto/produto-123</g:link>
  <g:image_link>https://URL_VALIDA/imagem.jpg</g:image_link>
  <g:price>29.90 BRL</g:price>
  <g:availability>in_stock</g:availability>
  <g:condition>new</g:condition>
  <g:brand>Marca</g:brand>
  <g:identifier_exists>no</g:identifier_exists>
  <g:mpn>SKU-123</g:mpn>
  <g:google_product_category>Materiais de Construção > Construção a Seco</g:google_product_category>
  <g:shipping_weight>1 kg</g:shipping_weight>
</item>
```

### 3. Teste uma Imagem

Cole a URL da imagem no navegador:
```
https://rfpvhpaoaaqjuojcssdf.supabase.co/storage/v1/object/public/product-images/produto.jpg
```

**Deve:**
- ✅ Carregar a imagem diretamente
- ✅ Não redirecionar
- ✅ Não retornar HTML ou erro 404

### 4. Use o Validador do Google

1. Acesse: https://support.google.com/merchants/answer/7052112
2. Cole a URL do feed
3. Verifique os erros apontados

---

## 📋 Checklist Final

Antes de enviar ao Google Merchant Center:

- [ ] Feed XML acessível em `https://loja-fast.vercel.app/api/product-feed.xml`
- [ ] Todos os produtos têm `price`, `availability` e `condition`
- [ ] Todas as imagens são acessíveis e carregam corretamente
- [ ] URLs de produtos funcionam (não retornam 404)
- [ ] Variável `VITE_SITE_URL` configurada na Vercel
- [ ] Domínio verificado no Google Merchant Center
- [ ] Campos obrigatórios presentes em todos os produtos
- [ ] Descrições sem tags HTML
- [ ] Títulos com menos de 150 caracteres

---

## 🚀 Deploy das Correções

1. **Commit as alterações:**
   ```bash
   git add .
   git commit -m "fix: corrige feed Google Merchant - adiciona campos obrigatórios"
   git push
   ```

2. **Aguarde deploy na Vercel** (automático)

3. **Teste novamente:**
   ```
   https://loja-fast.vercel.app/api/product-feed.xml
   ```

4. **No Google Merchant Center:**
   - Produtos → Feeds
   - Selecione seu feed
   - Clique em "Buscar agora"
   - Aguarde processamento (5-10 minutos)
   - Verifique Diagnóstico

---

## 📊 Campos por Produto no Supabase

**Estrutura recomendada na tabela `products`:**

```sql
-- Campos obrigatórios
name VARCHAR NOT NULL,
price DECIMAL NOT NULL,
availability VARCHAR DEFAULT 'in_stock',
condition VARCHAR DEFAULT 'new',

-- Identificadores
slug VARCHAR UNIQUE NOT NULL,
sku VARCHAR,
gtin VARCHAR,
mpn VARCHAR,

-- Descrições
description TEXT,
shortDescription TEXT,

-- Marca
brand VARCHAR,
brandName VARCHAR,

-- Imagens
images JSONB,
imageUrl VARCHAR,

-- Estoque e peso
stock INTEGER DEFAULT 0,
weight JSONB,

-- Categoria
category VARCHAR,
subcategory VARCHAR
```

---

## 🆘 Ainda com Problemas?

1. **Verifique os logs da Vercel:**
   - Dashboard → Deployments → Functions → product-feed
   - Veja erros em tempo real

2. **Teste localmente:**
   ```bash
   npm run generate:feed
   ```
   
3. **Consulte o Diagnóstico:**
   - Google Merchant Center → Produtos → Diagnóstico
   - Leia cada erro específico
   - Clique para ver detalhes e soluções

4. **Documentação oficial:**
   - https://support.google.com/merchants/answer/7052112

---

**Status:** ✅ Todos os erros corrigidos
**Próximo passo:** Deploy e teste no Google Merchant Center
