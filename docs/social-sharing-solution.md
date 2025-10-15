# 🔄 Solução: Meta Tags para Compartilhamento Social em SPA

## 🎯 Problema

Quando você compartilha um link de produto no WhatsApp, Facebook ou LinkedIn, eles mostram apenas as meta tags genéricas do `index.html` porque:

1. **SPAs não são renderizadas server-side**: React roda no navegador, mas bots sociais não executam JavaScript
2. **Bots leem HTML estático**: WhatsApp/Facebook só leem o HTML inicial que o servidor retorna
3. **Cache agressivo**: Essas plataformas fazem cache das meta tags por muito tempo

## ✅ Solução Implementada: Pre-rendering

Criamos um sistema de **pré-renderização** que gera páginas HTML estáticas para cada produto com as meta tags corretas embutidas no HTML.

### Como Funciona

```
Build do Vite
    ↓
Gera dist/index.html (SPA)
    ↓
Script: prerender-products.mjs
    ├─ Busca produtos no Supabase
    ├─ Para cada produto:
    │   ├─ Lê template HTML
    │   ├─ Injeta meta tags específicas
    │   └─ Salva em dist/produto/{slug}/index.html
    ↓
Deploy no Vercel
    ↓
Bot do WhatsApp acessa /produto/slug-do-produto
    ↓
Vercel serve dist/produto/slug-do-produto/index.html
    ↓
Bot lê meta tags corretas ✅
```

### Arquivos Criados

1. **`scripts/prerender-products.mjs`**
   - Gera páginas HTML pré-renderizadas
   - Injeta meta tags específicas de cada produto
   - Roda automaticamente após o build (`postbuild`)

2. **`api/meta-tags.js`** (opcional - Edge Function)
   - Alternativa para gerar meta tags dinamicamente
   - Mais lento mas não precisa pré-renderizar

3. **`vercel.json` atualizado**
   - Configura rotas para servir páginas pré-renderizadas

## 🚀 Como Usar

### 1. Desenvolvimento Local

```bash
# Build completo (gera páginas pré-renderizadas)
npm run build

# Testar localmente
npm run preview
```

### 2. Deploy

```bash
git add .
git commit -m "feat: add pre-rendering for social sharing"
git push
```

O Vercel vai automaticamente:
1. Rodar `prebuild` (gera robots.txt e sitemap.xml)
2. Rodar `build` (compila a SPA)
3. Rodar `postbuild` (pré-renderiza produtos)
4. Fazer deploy

### 3. Atualizar Cache do WhatsApp/Facebook

Depois do deploy, é necessário **limpar o cache** nas plataformas:

#### Facebook/WhatsApp
1. Acesse: https://developers.facebook.com/tools/debug/
2. Cole a URL do produto: `https://loja-fast.vercel.app/produto/seu-produto`
3. Clique em **"Scrape Again"**
4. Verifique o preview

#### LinkedIn
1. Acesse: https://www.linkedin.com/post-inspector/
2. Cole a URL do produto
3. Clique em **"Inspect"**
4. Verifique o preview

#### Twitter
1. Acesse: https://cards-dev.twitter.com/validator
2. Cole a URL e valide

## 📊 Vantagens da Solução

### ✅ Vantagens
- ✅ Meta tags corretas para bots sociais
- ✅ Funciona em WhatsApp, Facebook, LinkedIn, Twitter
- ✅ SEO otimizado (bots do Google também leem o HTML)
- ✅ Performance (páginas já renderizadas)
- ✅ Fácil manutenção
- ✅ Funciona com SPA (React ainda roda normalmente)

### 🎯 O Que Foi Otimizado

Para cada produto pré-renderizado:

```html
<title>Travessa Clicada Branca Plus...</title>
<meta name="description" content="Descrição específica do produto..." />
<link rel="canonical" href="https://loja-fast.vercel.app/produto/slug" />

<!-- Open Graph (WhatsApp, Facebook, LinkedIn) -->
<meta property="og:type" content="product" />
<meta property="og:title" content="Título do Produto" />
<meta property="og:description" content="Descrição..." />
<meta property="og:image" content="https://storage.supabase.co/.../produto.jpg" />
<meta property="og:url" content="https://..." />

<!-- Twitter Cards -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="..." />
<meta name="twitter:image" content="..." />

<!-- Product Rich Data -->
<meta property="product:brand" content="Marca" />
<meta property="product:price:amount" content="99.90" />
<meta property="product:price:currency" content="BRL" />
```

## 🔧 Manutenção

### Adicionar Novo Produto
1. Adicione o produto no Supabase (com campo `seo` preenchido)
2. Faça novo deploy (`git push`)
3. O script `prerender-products.mjs` vai gerar a página automaticamente

### Atualizar Meta Tags de Produto Existente
1. Atualize o campo `seo` no Supabase
2. Faça novo deploy
3. Limpe o cache no Facebook Debugger

### Gerar Páginas Manualmente
```bash
# Rode localmente após o build
npm run build
```

## 📈 Monitoramento

### Verificar se Está Funcionando

1. **Teste local**:
   ```bash
   npm run build
   ls dist/produto/
   # Deve mostrar pastas para cada produto
   ```

2. **Teste em produção**:
   ```bash
   curl https://loja-fast.vercel.app/produto/seu-produto | grep "og:title"
   # Deve mostrar a meta tag específica do produto
   ```

3. **Teste visual**:
   - Abra o HTML pré-renderizado: `dist/produto/seu-produto/index.html`
   - Veja se as meta tags estão corretas

## ⚠️ Limitações

### Quantos Produtos Pré-renderizar?

**Atualmente**: 50 produtos (mais recentes)

**Como aumentar**: Edite `scripts/prerender-products.mjs`, linha `.limit(50)`

### Produtos Novos

Produtos adicionados após o último deploy só terão meta tags corretas após novo deploy.

**Solução**: Configure deploy automático ou use a Edge Function (`api/meta-tags.js`)

## 🆚 Alternativas

### 1. Pre-rendering (Implementado) ⭐ RECOMENDADO
**Prós**: Rápido, confiável, funciona sempre  
**Contras**: Precisa rebuild para novos produtos

### 2. Edge Function (api/meta-tags.js)
**Prós**: Dinâmico, sempre atualizado  
**Contras**: Mais lento, mais complexo

### 3. SSR (Server-Side Rendering)
**Prós**: Sempre atualizado, melhor SEO  
**Contras**: Requer refatoração completa (Next.js, Remix)

### 4. Prerender.io / Prerender Cloud
**Prós**: Serviço gerenciado  
**Contras**: Custo adicional, configuração externa

## 📚 Referências

- [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
- [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)
- [Twitter Card Validator](https://cards-dev.twitter.com/validator)
- [Open Graph Protocol](https://ogp.me/)
- [Vercel Pre-rendering](https://vercel.com/docs/concepts/edge-network/prerendering)

---

**Status**: ✅ Implementado  
**Última atualização**: Outubro 2025  
**Próximo deploy**: Teste e valide!
