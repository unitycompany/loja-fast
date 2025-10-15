# Meta Tags SEO para Produtos - Guia Completo

## 📋 Visão Geral

Cada produto no Supabase possui um campo `seo` (tipo JSONB) que armazena todas as meta tags para otimização de SEO e compartilhamento social. Este guia explica como configurar essas meta tags corretamente.

## 🗂️ Estrutura do Campo SEO

O campo `seo` é um objeto JSON com a seguinte estrutura:

```json
{
  "title": "Título do Produto para SEO",
  "meta_title": "Título alternativo para meta tag",
  "description": "Descrição completa do produto para SEO",
  "meta_description": "Descrição curta otimizada (150-160 caracteres)",
  "canonical_url": "https://seusite.com/produto/slug-do-produto",
  "canonicalUrl": "https://seusite.com/produto/slug-do-produto",
  
  "og_title": "Título para Open Graph (Facebook, WhatsApp, LinkedIn)",
  "ogTitle": "Título para Open Graph",
  "og_description": "Descrição para Open Graph",
  "ogDescription": "Descrição para Open Graph",
  "og_image": "https://url-da-imagem-1200x630.jpg",
  "ogImage": "https://url-da-imagem-1200x630.jpg",
  "og_type": "product",
  "ogType": "product",
  "image_alt": "Texto alternativo da imagem",
  "imageAlt": "Texto alternativo da imagem",
  
  "twitter_card": "summary_large_image",
  "twitterCard": "summary_large_image",
  "twitter_title": "Título para Twitter Card",
  "twitterTitle": "Título para Twitter Card",
  "twitter_description": "Descrição para Twitter",
  "twitterDescription": "Descrição para Twitter",
  "twitter_image": "https://url-da-imagem-twitter.jpg",
  "twitterImage": "https://url-da-imagem-twitter.jpg",
  
  "keywords": ["palavra-chave-1", "palavra-chave-2", "palavra-chave-3"],
  "search_terms": ["termo-busca-1", "termo-busca-2"],
  "noindex": false
}
```

## 📝 Campos Detalhados

### Meta Tags Primárias

#### `title` ou `meta_title`
- **Tipo**: String
- **Tamanho recomendado**: 50-60 caracteres
- **Descrição**: Título principal do produto para SEO
- **Exemplo**: `"Argamassa AC3 Weber 20kg - Quartzolit"`
- **Uso**: Tag `<title>` e `<meta name="title">`

#### `description` ou `meta_description`
- **Tipo**: String
- **Tamanho recomendado**: 150-160 caracteres
- **Descrição**: Descrição do produto otimizada para SEO
- **Exemplo**: `"Argamassa colante AC3 de alta qualidade para assentamento de porcelanatos e cerâmicas. Ideal para áreas internas e externas. Embalagem 20kg."`
- **Uso**: Tag `<meta name="description">`

#### `canonical_url` ou `canonicalUrl`
- **Tipo**: String (URL completa)
- **Descrição**: URL canônica do produto para evitar conteúdo duplicado
- **Exemplo**: `"https://fastsistemas.com.br/produto/argamassa-ac3-weber-20kg"`
- **Uso**: Tag `<link rel="canonical">`

### Open Graph (Facebook, WhatsApp, LinkedIn)

#### `og_title` ou `ogTitle`
- **Tipo**: String
- **Tamanho recomendado**: 40-60 caracteres
- **Descrição**: Título exibido quando o produto é compartilhado
- **Exemplo**: `"Argamassa AC3 Weber 20kg | Fast Sistemas"`
- **Uso**: `<meta property="og:title">`

#### `og_description` ou `ogDescription`
- **Tipo**: String
- **Tamanho recomendado**: 55-65 caracteres
- **Descrição**: Descrição para preview de compartilhamento
- **Exemplo**: `"Argamassa colante AC3 para porcelanatos. Alta aderência e qualidade."`
- **Uso**: `<meta property="og:description">`

#### `og_image` ou `ogImage`
- **Tipo**: String (URL da imagem)
- **Dimensões recomendadas**: 1200x630px
- **Formato**: JPG ou PNG
- **Tamanho máximo**: 8MB
- **Descrição**: Imagem exibida no preview de compartilhamento
- **Exemplo**: `"https://storage.supabase.co/produtos/argamassa-ac3.jpg"`
- **Uso**: `<meta property="og:image">`

#### `og_type` ou `ogType`
- **Tipo**: String
- **Valores**: `"product"`, `"website"`, `"article"`
- **Padrão**: `"product"`
- **Uso**: `<meta property="og:type">`

#### `image_alt` ou `imageAlt`
- **Tipo**: String
- **Descrição**: Texto alternativo da imagem OG
- **Exemplo**: `"Argamassa AC3 Weber embalagem 20kg"`
- **Uso**: `<meta property="og:image:alt">`

### Twitter Cards

#### `twitter_card` ou `twitterCard`
- **Tipo**: String
- **Valores**: `"summary_large_image"`, `"summary"`, `"player"`, `"app"`
- **Padrão**: `"summary_large_image"`
- **Uso**: `<meta name="twitter:card">`

#### `twitter_title` ou `twitterTitle`
- **Tipo**: String
- **Descrição**: Título para Twitter Card
- **Uso**: `<meta name="twitter:title">`

#### `twitter_description` ou `twitterDescription`
- **Tipo**: String
- **Descrição**: Descrição para Twitter Card
- **Uso**: `<meta name="twitter:description">`

#### `twitter_image` ou `twitterImage`
- **Tipo**: String (URL da imagem)
- **Dimensões recomendadas**: 1200x600px
- **Uso**: `<meta name="twitter:image">`

### Palavras-chave e Indexação

#### `keywords`
- **Tipo**: Array de strings
- **Descrição**: Palavras-chave para SEO
- **Exemplo**: `["argamassa", "ac3", "quartzolit", "porcelanato", "cerâmica"]`
- **Uso**: `<meta name="keywords">`

#### `search_terms`
- **Tipo**: Array de strings
- **Descrição**: Termos de busca alternativos
- **Exemplo**: `["cola para porcelanato", "massa para assentar", "argamassa colante"]`

#### `noindex`
- **Tipo**: Boolean
- **Padrão**: `false`
- **Descrição**: Se `true`, impede indexação do produto pelos motores de busca
- **Uso**: `<meta name="robots" content="noindex">`

## 🛠️ Como Configurar

### 1. Via Interface do Supabase

1. Acesse o Supabase Studio
2. Vá para Table Editor > products
3. Selecione o produto desejado
4. No campo `seo`, adicione o JSON:

```json
{
  "title": "Seu Título Aqui",
  "meta_description": "Sua descrição aqui com até 160 caracteres",
  "og_image": "https://url-da-imagem.jpg",
  "keywords": ["palavra1", "palavra2", "palavra3"]
}
```

### 2. Via SQL

```sql
UPDATE products 
SET seo = '{
  "title": "Argamassa AC3 Weber 20kg",
  "meta_description": "Argamassa colante AC3 de alta qualidade para porcelanatos",
  "og_image": "https://storage.supabase.co/produtos/argamassa-ac3.jpg",
  "og_title": "Argamassa AC3 Weber 20kg | Fast Sistemas",
  "og_description": "Argamassa colante AC3 para porcelanatos. Alta aderência.",
  "twitter_card": "summary_large_image",
  "keywords": ["argamassa", "ac3", "quartzolit", "porcelanato"]
}'::jsonb
WHERE slug = 'argamassa-ac3-weber-20kg';
```

### 3. Via Script de Importação

Use o script `generate-seo-metatags.mjs` para gerar automaticamente meta tags para produtos sem SEO:

```bash
node scripts/generate-seo-metatags.mjs
```

Este script:
- Busca produtos sem campo `seo`
- Gera meta tags automaticamente baseado em nome, descrição, marca, categoria
- Atualiza os produtos no Supabase

### 4. Durante a Importação de Produtos

Ao usar `import-products.js`, adicione o campo `seo` no JSON de cada produto:

```json
{
  "slug": "argamassa-ac3-weber-20kg",
  "name": "Argamassa AC3 Weber 20kg",
  "price": 45.90,
  "seo": {
    "title": "Argamassa AC3 Weber 20kg - Quartzolit",
    "meta_description": "Argamassa colante AC3 de alta aderência...",
    "og_image": "https://...",
    "keywords": ["argamassa", "ac3", "quartzolit"]
  }
}
```

## ✅ Boas Práticas

### Títulos (Title / OG Title / Twitter Title)
- ✅ Mantenha entre 50-60 caracteres
- ✅ Inclua palavras-chave principais no início
- ✅ Seja descritivo e atraente
- ✅ Inclua a marca quando relevante
- ❌ Não use ALL CAPS
- ❌ Não repita palavras desnecessariamente

### Descrições (Description / OG Description / Twitter Description)
- ✅ Mantenha entre 150-160 caracteres
- ✅ Inclua call-to-action quando apropriado
- ✅ Mencione benefícios principais
- ✅ Seja natural e legível
- ❌ Não use keyword stuffing
- ❌ Não deixe frases incompletas

### Imagens (OG Image / Twitter Image)
- ✅ Use dimensões corretas: 1200x630px (OG) / 1200x600px (Twitter)
- ✅ Formato JPG ou PNG
- ✅ Tamanho máximo: 8MB (recomendado < 300KB)
- ✅ Imagens de alta qualidade e bem iluminadas
- ✅ Inclua logo ou marca quando apropriado
- ❌ Não use imagens pixeladas
- ❌ Não use texto muito pequeno na imagem

### Keywords
- ✅ Use 5-10 palavras-chave relevantes
- ✅ Inclua variações e sinônimos
- ✅ Considere termos de busca long-tail
- ✅ Pesquise palavras-chave antes
- ❌ Não repita as mesmas palavras
- ❌ Não use palavras irrelevantes

## 🧪 Como Testar

### 1. Facebook / WhatsApp / LinkedIn
**Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/

1. Cole a URL do produto
2. Clique em "Debug"
3. Verifique preview
4. Use "Scrape Again" se necessário

### 2. Twitter
**Twitter Card Validator**: https://cards-dev.twitter.com/validator

1. Cole a URL do produto
2. Clique em "Preview Card"
3. Verifique título, descrição e imagem

### 3. Google
**Google Rich Results Test**: https://search.google.com/test/rich-results

1. Cole a URL ou código HTML
2. Verifique se as meta tags estão corretas
3. Teste Schema.org

### 4. LinkedIn
**LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

1. Cole a URL do produto
2. Clique em "Inspect"
3. Verifique preview

## 📊 Exemplo Completo

```json
{
  "title": "Drywall Placa ST 1200x2400x12.5mm Knauf",
  "meta_title": "Placa Drywall ST 1200x2400x12.5mm | Knauf",
  "description": "Placa de drywall padrão (ST) Knauf, ideal para forros e paredes internas. Dimensões: 1200x2400mm, espessura 12.5mm. Alta qualidade e durabilidade.",
  "meta_description": "Placa drywall ST Knauf 1200x2400x12.5mm para forros e paredes. Alta qualidade, fácil instalação. Compre com melhor preço.",
  "canonical_url": "https://fastsistemas.com.br/produto/drywall-placa-st-knauf",
  "canonicalUrl": "https://fastsistemas.com.br/produto/drywall-placa-st-knauf",
  
  "og_title": "Placa Drywall ST Knauf 1200x2400x12.5mm",
  "ogTitle": "Placa Drywall ST Knauf 1200x2400x12.5mm",
  "og_description": "Placa drywall padrão para forros e paredes. Knauf, qualidade alemã.",
  "ogDescription": "Placa drywall padrão para forros e paredes. Knauf, qualidade alemã.",
  "og_image": "https://storage.supabase.co/produtos/drywall-st-knauf.jpg",
  "ogImage": "https://storage.supabase.co/produtos/drywall-st-knauf.jpg",
  "og_type": "product",
  "ogType": "product",
  "image_alt": "Placa Drywall ST Knauf 1200x2400x12.5mm",
  "imageAlt": "Placa Drywall ST Knauf 1200x2400x12.5mm",
  
  "twitter_card": "summary_large_image",
  "twitterCard": "summary_large_image",
  "twitter_title": "Drywall ST Knauf 1200x2400x12.5mm",
  "twitterTitle": "Drywall ST Knauf 1200x2400x12.5mm",
  "twitter_description": "Placa drywall padrão Knauf. Qualidade e durabilidade.",
  "twitterDescription": "Placa drywall padrão Knauf. Qualidade e durabilidade.",
  "twitter_image": "https://storage.supabase.co/produtos/drywall-st-knauf.jpg",
  "twitterImage": "https://storage.supabase.co/produtos/drywall-st-knauf.jpg",
  
  "keywords": [
    "drywall",
    "placa drywall",
    "knauf",
    "gesso acartonado",
    "parede drywall",
    "forro drywall",
    "ST",
    "standard"
  ],
  "search_terms": [
    "placa de gesso",
    "chapa drywall",
    "drywall knauf",
    "parede de gesso",
    "forro de gesso"
  ],
  "noindex": false
}
```

## 🔄 Atualização em Massa

Para atualizar vários produtos de uma vez:

```sql
UPDATE products 
SET seo = jsonb_set(
  COALESCE(seo, '{}'::jsonb),
  '{title}',
  to_jsonb(name)
)
WHERE seo IS NULL OR seo->>'title' IS NULL;
```

## 📚 Referências

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Documentation](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Google SEO Starter Guide](https://developers.google.com/search/docs/beginner/seo-starter-guide)
- [Schema.org Product](https://schema.org/Product)

---

**Última atualização**: Outubro 2025  
**Versão**: 1.0.0
