# Sistema de SEO - Fast Sistemas Construtivos

Este documento descreve a implementação completa do sistema de SEO do site, incluindo meta tags, Open Graph, Twitter Cards e Schema.org.

## 📦 Dependências

- **react-helmet-async**: Gerenciamento declarativo de meta tags no React
- Instalado com: `npm install react-helmet-async --legacy-peer-deps`

## 🏗️ Arquitetura

### Componentes Principais

#### 1. **SEOHelmet** (`src/components/seo/SEOHelmet.jsx`)
Componente principal que utiliza React Helmet para gerenciar todas as meta tags.

**Recursos:**
- Meta tags primárias (title, description, keywords)
- Robots meta (indexação)
- Canonical URLs
- Open Graph (Facebook, LinkedIn)
- Twitter Cards
- Meta tags específicas para produtos
- Schema.org JSON-LD
- Suporte para artigos (article type)

**Uso básico:**
```jsx
import SEOHelmet from '../../components/seo/SEOHelmet'

<SEOHelmet
  title="Título da Página"
  description="Descrição da página"
  canonicalUrl="https://exemplo.com/pagina"
  image="/imagem-og.jpg"
  type="website"
  keywords={['palavra1', 'palavra2']}
/>
```

#### 2. **SEOHead** (`src/components/seo/SEOHead.jsx`)
Componente legado que manipula meta tags via DOM (mantido para compatibilidade).

#### 3. **JsonLd** (`src/components/seo/JsonLd.jsx`)
Componente para adicionar dados estruturados Schema.org.

### Hooks Customizados

#### **useSEO** (`src/hooks/useSEO.jsx`)
Hook para gerar dados de SEO de forma consistente.

```jsx
import { useSEO } from '../../hooks/useSEO'

const seoData = useSEO({
  title: 'Minha Página',
  description: 'Descrição',
  path: '/minha-pagina',
  keywords: ['palavra1', 'palavra2']
})
```

#### **useSchema**
Hook para gerar diferentes tipos de Schema.org JSON-LD.

Tipos suportados:
- `WebSite`: Para a home page
- `Organization`: Informações da empresa
- `BreadcrumbList`: Navegação breadcrumb
- `Product`: Páginas de produtos

## 📄 Implementação por Página

### Home (`src/pages/Home/Home.jsx`)
```jsx
<SEOHelmet
  title="Fast Sistemas Construtivos | Materiais de Construção e Sistemas Construtivos"
  description="Encontre os melhores produtos para construção civil..."
  canonicalUrl={origin}
  type="website"
  keywords={['materiais de construção', 'argamassa', ...]}
  schema={homeSchema}
/>
```

**Schema.org**: WebSite com SearchAction

### Produto (`src/pages/Product/Product.jsx`)
```jsx
<SEOHelmet 
  title={seoData.title}
  description={seoData.description}
  canonicalUrl={seoData.canonicalUrl}
  image={seoData.image}
  type="product"
  keywords={seoData.keywords}
  product={seoData.product}
/>
```

**Features:**
- Meta tags de produto (price, availability, brand, sku)
- Open Graph product tags
- Schema.org Product
- Atualização dinâmica baseada em seleção de unidade/medida

### Busca/Pesquisa (`src/pages/Search/Search.jsx`)
```jsx
<SEOHelmet
  title={pageTitle}
  description={pageDescription}
  canonicalUrl={currentUrl}
  type="website"
  keywords={[searchQuery, categoryParam, brandParam]}
  schema={searchSchema}
/>
```

**Features:**
- Título dinâmico baseado em query/categoria/marca
- Schema.org SearchResultsPage

### Carrinho (`src/pages/Cart/Cart.jsx`)
```jsx
<SEOHelmet
  title="Carrinho de Compras | Fast Sistemas Construtivos"
  description="Revise seus produtos selecionados..."
  canonicalUrl={`${origin}/carrinho`}
  type="website"
  noindex={true}
/>
```

**Features:**
- `noindex` ativado (página privada)

### Lista de Desejos (`src/pages/Whishlist/WhishList.jsx`)
```jsx
<SEOHelmet
  title="Lista de Desejos | Fast Sistemas Construtivos"
  description="Seus produtos favoritos..."
  canonicalUrl={`${origin}/lista-de-desejos`}
  type="website"
  noindex={true}
/>
```

## 🔍 Meta Tags Implementadas

### Meta Tags Primárias
```html
<title>Título da Página</title>
<meta name="description" content="..." />
<meta name="keywords" content="..." />
<meta name="robots" content="index,follow,max-image-preview:large" />
<meta name="author" content="..." />
```

### Canonical URL
```html
<link rel="canonical" href="https://..." />
```

### Open Graph (Facebook, LinkedIn)
```html
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Fast Sistemas Construtivos" />
<meta property="og:locale" content="pt_BR" />
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:url" content="..." />
<meta property="og:image" content="..." />
<meta property="og:image:alt" content="..." />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
```

### Open Graph - Produtos
```html
<meta property="product:brand" content="..." />
<meta property="product:availability" content="in stock" />
<meta property="product:condition" content="new" />
<meta property="product:price:amount" content="99.90" />
<meta property="product:price:currency" content="BRL" />
<meta property="product:retailer_item_id" content="SKU-123" />
<meta property="product:gtin" content="..." />
<meta property="product:mpn" content="..." />
```

### Twitter Cards
```html
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:description" content="..." />
<meta name="twitter:image" content="..." />
<meta name="twitter:image:alt" content="..." />
```

## 📊 Schema.org (JSON-LD)

### WebSite Schema (Home)
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Fast Sistemas Construtivos",
  "url": "https://...",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://.../search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
```

### Product Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "...",
  "image": "...",
  "description": "...",
  "brand": {
    "@type": "Brand",
    "name": "..."
  },
  "offers": {
    "@type": "Offer",
    "price": "99.90",
    "priceCurrency": "BRL",
    "availability": "https://schema.org/InStock"
  }
}
```

## 🎯 Boas Práticas Implementadas

### 1. **Títulos Otimizados**
- Formato: `[Título da Página] | Fast Sistemas Construtivos`
- Máximo 60 caracteres
- Keywords principais no início

### 2. **Descrições**
- Entre 150-160 caracteres
- Call-to-action quando apropriado
- Keywords naturalmente inseridas

### 3. **Imagens Open Graph**
- Dimensões recomendadas: 1200x630px
- Formato JPG ou PNG
- Tamanho máximo: 8MB
- Alt text descritivo

### 4. **Canonical URLs**
- Sempre absolutos (https://...)
- Consistentes com a URL da página
- Previnem conteúdo duplicado

### 5. **Robots Meta**
- Páginas públicas: `index,follow`
- Páginas privadas (carrinho, wishlist): `noindex,nofollow`
- Diretivas adicionais: `max-image-preview:large`

## 🚀 Como Adicionar SEO em Nova Página

1. **Importe o componente:**
```jsx
import SEOHelmet from '../../components/seo/SEOHelmet'
```

2. **Defina os dados:**
```jsx
const origin = typeof window !== 'undefined' ? window.location.origin : ''
```

3. **Adicione o componente:**
```jsx
<SEOHelmet
  title="Título da Nova Página"
  description="Descrição otimizada para SEO"
  canonicalUrl={`${origin}/nova-pagina`}
  type="website"
  keywords={['palavra1', 'palavra2']}
/>
```

4. **Para produtos, use o helper:**
```jsx
import { buildProductSeo } from '../../lib/seo'

const seoData = buildProductSeo({ product, selection })
<SEOHelmet {...seoData} />
```

## 🔧 Configuração Global

### index.html
Meta tags padrão no HTML base:
- Lang: `pt-BR`
- Meta tags primárias
- Open Graph básico
- Twitter Cards básico
- Theme color
- Manifest

### main.jsx
HelmetProvider configurado na raiz da aplicação:
```jsx
<HelmetProvider>
  <CartProvider>
    <App />
  </CartProvider>
</HelmetProvider>
```

## 📈 Testes e Validação

### Ferramentas Recomendadas
1. **Google Rich Results Test**: https://search.google.com/test/rich-results
2. **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
3. **Twitter Card Validator**: https://cards-dev.twitter.com/validator
4. **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/
5. **Schema.org Validator**: https://validator.schema.org/

### Checklist de Validação
- [ ] Título único em cada página
- [ ] Descrição única em cada página
- [ ] Canonical URL correto
- [ ] Imagens OG com dimensões corretas
- [ ] Schema.org válido
- [ ] Robots meta apropriado
- [ ] Twitter Cards funcionando
- [ ] Open Graph funcionando

## 📱 Compartilhamento Social

### Formato Ideal de Imagens
- **Facebook/LinkedIn**: 1200x630px
- **Twitter**: 1200x600px
- **Pinterest**: 1000x1500px

### Preview de Compartilhamento
Cada página está otimizada para mostrar:
- Imagem atraente
- Título claro e conciso
- Descrição informativa
- Dados estruturados (quando aplicável)

## 🐛 Troubleshooting

### Problema: Meta tags não aparecem
**Solução**: Verificar se o HelmetProvider está na raiz da aplicação

### Problema: Imagem OG não carrega
**Solução**: Usar URLs absolutas (com domínio completo)

### Problema: Canonical duplicado
**Solução**: Usar apenas um componente SEO por página

### Problema: Schema.org inválido
**Solução**: Validar JSON com schema.org validator

## 📚 Referências

- [React Helmet Async](https://github.com/staylor/react-helmet-async)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Schema.org](https://schema.org/)
- [Google Search Central](https://developers.google.com/search)

---

**Última atualização**: Outubro 2025
**Versão**: 1.0.0
