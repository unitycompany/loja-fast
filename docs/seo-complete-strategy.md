# Estratégia Completa de SEO e IA - Fast Sistemas Construtivos

## 📋 Visão Geral

Este documento descreve a implementação completa de SEO "absurdo" em todas as rotas do site, com foco em otimização para motores de busca, compartilhamento social e experiência do usuário.

## 🎯 Objetivos

1. ✅ **Reforçar SEO em todas as páginas** com meta tags otimizadas
2. ✅ **Otimizar compartilhamento social** (WhatsApp, Facebook, Twitter, LinkedIn)
3. ✅ **Implementar Schema.org** para rich snippets
4. ✅ **SEO específico por categoria e marca** com keywords estratégicas
5. ✅ **URLs canônicas** para evitar conteúdo duplicado
6. ✅ **Pre-rendering** para páginas de produto (social sharing)

---

## 🏗️ Arquitetura de SEO

### 1. Configuração Centralizada (`src/lib/seoConfig.js`)

O arquivo `seoConfig.js` é o **centro nervoso** de toda a estratégia de SEO:

```javascript
export const SITE_CONFIG = {
  name: 'Fast Sistemas Construtivos',
  url: 'https://fastsistemas.com.br',
  description: 'Especialista em materiais de construção e sistemas construtivos...',
  phone: '(XX) XXXX-XXXX',
  address: 'Endereço da loja'
}

export const ROUTE_SEO = {
  home: { ... },
  pesquisa: { ... },
  produto: { ... },
  orcamento: { ... },
  favoritos: { ... },
  admin: { ... }
}

export const CATEGORY_KEYWORDS = {
  'drywall': [...],
  'steel-frame': [...],
  'forros-removiveis': [...],
  // ... 11 categorias no total
}

export const BRAND_KEYWORDS = {
  'knauf': [...],
  'quartzolit': [...],
  'brasilit': [...],
  // ... 8 marcas no total
}
```

### 2. Componente SEO Universal (`src/components/seo/SEOHelmet.jsx`)

Componente React Helmet que injeta meta tags dinamicamente:

- ✅ Meta tags básicas (title, description)
- ✅ Open Graph (Facebook, WhatsApp)
- ✅ Twitter Cards
- ✅ Product meta tags (price, availability)
- ✅ Schema.org JSON-LD
- ✅ Canonical URLs
- ✅ Robots (noindex/nofollow quando necessário)

---

## 📄 Implementação por Rota

### 🏠 **Home Page** (`/`)

**Estratégia:**
- SEO focado em marca e autoridade
- Schema.org: WebSite + Organization
- Keywords amplas sobre construção civil
- Search Action para busca no site

**Implementação:**
```jsx
<SEOHelmet
  title="Fast Sistemas Construtivos | Materiais de Construção..."
  description="Especialista em materiais de construção..."
  keywords={['drywall', 'steel frame', 'argamassas', ...]}
  schema={[homeSchema, organizationSchema]}
/>
```

**Schema.org:**
- `WebSite` com SearchAction
- `Organization` com informações da empresa

---

### 🔍 **Página de Pesquisa** (`/pesquisa`)

**Estratégia Inteligente:**
A página de pesquisa ajusta dinamicamente o SEO baseado em:

1. **Busca por Categoria:**
   - Carrega dados da categoria do Supabase
   - Usa keywords específicas da categoria
   - Título otimizado: "Drywall - Placas, Perfis e Acessórios | Fast"
   - Schema: SearchResultsPage + BreadcrumbList

2. **Busca por Marca:**
   - Carrega dados da marca do Supabase
   - Usa keywords específicas da marca
   - Título otimizado: "Produtos Knauf | Fast Sistemas Construtivos"
   - Schema: SearchResultsPage + Organization (marca)

3. **Busca por Termo:**
   - Usa termo de busca no título e descrição
   - Keywords derivadas do termo
   - Schema: SearchResultsPage

**Implementação:**
```jsx
useEffect(() => {
  const loadSEOData = async () => {
    const params = new URLSearchParams(location.search)
    const categorySlug = params.get('categoria')
    const brandSlug = params.get('marca')
    const searchTerm = params.get('q')

    if (categorySlug) {
      const category = await fetchCategoryBySlug(categorySlug)
      const seo = getCategorySEO(category, categorySlug)
      setSeoData(seo)
    } else if (brandSlug) {
      const brand = await fetchBrandBySlug(brandSlug)
      const seo = getBrandSEO(brand, brandSlug)
      setSeoData(seo)
    } else if (searchTerm) {
      const seo = getSearchSEO(searchTerm)
      setSeoData(seo)
    }
  }
  
  loadSEOData()
}, [location.search])
```

---

### 📦 **Página de Produto** (`/produto/:slug`)

**Estratégia:**
- **Meta tags dinâmicas** vindas do Supabase (campo `seo` JSONB)
- **Pre-rendering** de 50 produtos para social sharing
- **Schema.org Product** com price, availability, reviews
- **Imagens otimizadas** do Supabase Storage

**Campos SEO no Supabase:**
```json
{
  "title": "Placa Drywall Standard 1,20x2,40m | Knauf",
  "description": "Placa de gesso para drywall, ideal para paredes...",
  "ogImage": "products/knauf-placa-drywall.jpg",
  "canonicalUrl": "/produto/placa-drywall-standard-knauf",
  "metaKeywords": ["drywall", "placa gesso", "knauf"]
}
```

**Pre-rendering:**
- Script `scripts/prerender-products.mjs` gera HTML estático
- 50 produtos mais importantes
- Meta tags embutidas no HTML
- **Funciona com bots** do WhatsApp/Facebook/Twitter

**Implementação:**
```jsx
const productSeo = buildProductSeo(product)

<SEOHelmet
  title={productSeo.title}
  description={productSeo.description}
  image={productSeo.image}
  keywords={productSeo.keywords}
  canonicalUrl={productSeo.canonicalUrl}
  openGraph={productSeo.openGraph}
  twitter={productSeo.twitter}
  schema={productSeo.schema}
/>
```

---

### 🛒 **Orçamento/Carrinho** (`/orcamento`)

**Estratégia:**
- **noindex** (página dinâmica do usuário)
- SEO básico para UX
- Não precisa ranquear

**Implementação:**
```jsx
<SEOHelmet
  title="Solicitar Orçamento | Fast Sistemas Construtivos"
  description="Revise seus produtos e solicite orçamento personalizado"
  noindex={true}
/>
```

---

### ⭐ **Favoritos** (`/favoritos`)

**Estratégia:**
- **noindex** (página pessoal do usuário)
- SEO básico para UX

**Implementação:**
```jsx
<SEOHelmet
  title="Meus Favoritos | Fast Sistemas Construtivos"
  description="Produtos salvos para compra futura"
  noindex={true}
/>
```

---

### 🔐 **Admin** (`/admin`)

**Estratégia:**
- **noindex + nofollow** (área restrita)
- Bloqueio total de indexação

**Implementação:**
```jsx
<SEOHelmet
  title="Painel Administrativo | Fast"
  description="Área administrativa restrita"
  noindex={true}
  nofollow={true}
/>
```

---

## 🎯 Estratégia de Keywords por Categoria

### Drywall
```javascript
keywords: [
  'drywall', 'gesso acartonado', 'placa drywall',
  'perfil drywall', 'parafuso drywall', 'massa drywall',
  'divisória drywall', 'forro drywall', 'steel frame',
  'construção a seco', 'parede drywall', 'drywall preço'
]
```

### Steel Frame
```javascript
keywords: [
  'steel frame', 'perfil steel frame', 'estrutura metálica',
  'montante steel frame', 'guia steel frame', 'LSF',
  'light steel frame', 'construção steel frame',
  'casa steel frame', 'steel frame preço'
]
```

### Forros Removíveis
```javascript
keywords: [
  'forro removível', 'forro modular', 'forro suspenso',
  'placa forro', 'forro acústico', 'forro escritório',
  'forro comercial', 'forro armstrong', 'forro ecophon'
]
```

*(Total de 11 categorias com keywords específicas)*

---

## 🏆 Estratégia de Keywords por Marca

### Knauf
```javascript
keywords: [
  'knauf', 'placa knauf', 'drywall knauf', 'gesso knauf',
  'massa knauf', 'perfil knauf', 'produtos knauf',
  'knauf brasil', 'knauf preço'
]
```

### Quartzolit
```javascript
keywords: [
  'quartzolit', 'argamassa quartzolit', 'rejunte quartzolit',
  'impermeabilizante quartzolit', 'massa quartzolit',
  'aditivo quartzolit', 'produtos quartzolit'
]
```

*(Total de 8 marcas com keywords específicas)*

---

## 🔧 Funções Helper

### `getCategorySEO(category, slug)`
Gera SEO otimizado para páginas de categoria:
- Título: `[Nome Categoria] - Produtos e Materiais | Fast`
- Description com keywords da categoria
- Keywords específicas da categoria
- Schema SearchResultsPage + BreadcrumbList

### `getBrandSEO(brand, slug)`
Gera SEO otimizado para páginas de marca:
- Título: `Produtos [Marca] | Fast Sistemas Construtivos`
- Description com keywords da marca
- Keywords específicas da marca
- Schema SearchResultsPage + Organization

### `getSearchSEO(searchTerm)`
Gera SEO otimizado para busca por termo:
- Título: `Busca: [termo] | Fast Sistemas Construtivos`
- Description com o termo de busca
- Keywords derivadas do termo

### `generateSchema(type, data)`
Gera Schema.org JSON-LD:
- WebSite (com SearchAction)
- Organization
- Product (com price, availability)
- SearchResultsPage
- BreadcrumbList

---

## 📊 Schema.org Implementados

### 1. WebSite (Home)
```json
{
  "@type": "WebSite",
  "name": "Fast Sistemas Construtivos",
  "url": "https://fastsistemas.com.br",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://fastsistemas.com.br/pesquisa?q={search_term}"
  }
}
```

### 2. Organization (Home + Marcas)
```json
{
  "@type": "Organization",
  "name": "Fast Sistemas Construtivos",
  "url": "https://fastsistemas.com.br",
  "logo": "https://fastsistemas.com.br/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+55-XX-XXXX-XXXX",
    "contactType": "customer service"
  }
}
```

### 3. Product (Produtos)
```json
{
  "@type": "Product",
  "name": "Placa Drywall Standard 1,20x2,40m",
  "image": "https://...",
  "description": "...",
  "brand": {
    "@type": "Brand",
    "name": "Knauf"
  },
  "offers": {
    "@type": "Offer",
    "price": "45.90",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  }
}
```

### 4. SearchResultsPage (Pesquisa)
```json
{
  "@type": "SearchResultsPage",
  "name": "Resultados de busca: drywall",
  "url": "https://fastsistemas.com.br/pesquisa?q=drywall"
}
```

### 5. BreadcrumbList (Navegação)
```json
{
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Home",
      "item": "https://fastsistemas.com.br"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Drywall",
      "item": "https://fastsistemas.com.br/pesquisa?categoria=drywall"
    }
  ]
}
```

---

## 🚀 Pre-rendering para Social Sharing

### Problema
- SPAs não funcionam com bots do WhatsApp/Facebook
- Bots não executam JavaScript
- Vêem apenas o HTML estático do `index.html`

### Solução
Script `scripts/prerender-products.mjs` que:

1. Busca 50 produtos do Supabase
2. Para cada produto:
   - Lê o template HTML
   - Injeta meta tags específicas do produto
   - Salva em `dist/produto/{slug}/index.html`

### Build Process
```json
{
  "scripts": {
    "prebuild": "node scripts/generate-sitemap.mjs && node scripts/generate-robots.mjs",
    "build": "vite build",
    "postbuild": "node scripts/prerender-products.mjs"
  }
}
```

### Configuração Vercel
```json
{
  "routes": [
    {
      "src": "/produto/([^/]+)",
      "dest": "/produto/$1/index.html"
    }
  ]
}
```

---

## 📈 Resultados Esperados

### 1. **Ranking nos Motores de Busca**
- ✅ Palavras-chave específicas por categoria
- ✅ Palavras-chave específicas por marca
- ✅ Long-tail keywords (ex: "placa drywall preço")
- ✅ Schema.org para rich snippets

### 2. **Compartilhamento Social**
- ✅ Imagens otimizadas (Open Graph)
- ✅ Títulos e descrições personalizadas
- ✅ Pre-rendering funciona com bots
- ✅ Preview correto no WhatsApp/Facebook

### 3. **Experiência do Usuário**
- ✅ URLs canônicas (evita duplicação)
- ✅ Breadcrumbs para navegação
- ✅ Títulos descritivos em todas as páginas
- ✅ Meta descriptions otimizadas

---

## 🔍 Como Testar

### 1. Meta Tags
- Use extensão **Meta SEO Inspector** (Chrome/Firefox)
- Inspecione elemento `<head>` de cada página
- Verifique Open Graph e Twitter Cards

### 2. Schema.org
- Use **Google Rich Results Test**: https://search.google.com/test/rich-results
- Cole URL de produto/categoria
- Verifique se schemas são detectados

### 3. Social Sharing
- Use **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- Use **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- Cole URLs de produtos pré-renderizados

### 4. Pre-rendering
- Após build: `npm run build`
- Verifique `dist/produto/{slug}/index.html`
- Abra no navegador e inspecione `<head>`
- Meta tags devem estar no HTML estático

---

## 📝 Checklist de Manutenção

### Ao adicionar novos produtos:
- [ ] Preencher campo `seo` no Supabase
- [ ] Incluir produto no script de pre-rendering (se importante)
- [ ] Rebuildar o site

### Ao adicionar novas categorias:
- [ ] Adicionar keywords em `CATEGORY_KEYWORDS`
- [ ] Atualizar descrição SEO da categoria

### Ao adicionar novas marcas:
- [ ] Adicionar keywords em `BRAND_KEYWORDS`
- [ ] Adicionar logo da marca
- [ ] Atualizar descrição SEO da marca

### Mensal:
- [ ] Revisar Google Search Console
- [ ] Analisar keywords que estão performando
- [ ] Atualizar meta descriptions baseado em dados
- [ ] Verificar links quebrados

---

## 🎓 Próximos Passos (Futuro)

1. **FAQ com Schema.org FAQPage**
   - Adicionar página de perguntas frequentes
   - Implementar schema FAQPage

2. **Avaliações de Produtos**
   - Sistema de reviews
   - Schema.org Review/AggregateRating

3. **Artigos/Blog**
   - Criar blog sobre construção civil
   - Schema.org Article/BlogPosting

4. **LocalBusiness Schema**
   - Se houver loja física
   - Schema.org LocalBusiness com endereço/horários

5. **AMP (Accelerated Mobile Pages)**
   - Versão mobile ultra-rápida
   - Melhor ranking mobile

---

## 📚 Recursos

- [React Helmet Async](https://github.com/staylor/react-helmet-async)
- [Schema.org Docs](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards)

---

## 🎉 Conclusão

Este é um sistema de SEO **absurdo** que cobre:
- ✅ Todas as rotas do site
- ✅ SEO inteligente por categoria e marca
- ✅ Pre-rendering para social sharing
- ✅ Schema.org completo
- ✅ Keywords estratégicas
- ✅ Experiência otimizada

O site está preparado para **ranquear bem**, **compartilhar bem** e **converter bem**! 🚀
