# 🚀 Guia Rápido - Como Usar o Sistema de SEO

## 📋 Para Adicionar Novos Produtos

### 1. Configure o SEO no Supabase

Ao adicionar um produto no Supabase, preencha o campo `seo` (JSONB):

```json
{
  "title": "Nome do Produto | Marca - Fast Sistemas",
  "description": "Descrição otimizada do produto com 150-160 caracteres",
  "ogImage": "products/imagem-produto.jpg",
  "canonicalUrl": "/produto/slug-do-produto",
  "metaKeywords": ["keyword1", "keyword2", "keyword3"]
}
```

**Dicas:**
- ✅ **Title**: 50-60 caracteres, inclua marca e produto
- ✅ **Description**: 150-160 caracteres, seja descritivo
- ✅ **ogImage**: Caminho relativo da imagem (será convertido automaticamente)
- ✅ **Keywords**: 5-10 palavras-chave relevantes

### 2. Se for produto importante

Adicione o slug ao script de pre-rendering em `scripts/prerender-products.mjs`:

```javascript
// Linha ~20
const { data: products } = await supabase
  .from('products')
  .select('*')
  .in('slug', [
    'placa-drywall-standard',
    'perfil-montante-48',
    'SEU-NOVO-PRODUTO-AQUI', // <-- Adicione aqui
    // ... outros produtos
  ])
```

---

## 📂 Para Adicionar Nova Categoria

### 1. Adicione Keywords em `src/lib/seoConfig.js`

```javascript
export const CATEGORY_KEYWORDS = {
  // ... categorias existentes
  
  'sua-nova-categoria': [
    'keyword principal',
    'keyword secundária',
    'keyword terciária',
    'variação 1',
    'variação 2',
    'preço',
    'onde comprar',
    // 10-15 keywords no total
  ]
}
```

### 2. Configure no Supabase

Na tabela `categories`, adicione:
- `name`: Nome da categoria
- `slug`: sua-nova-categoria
- `description`: Descrição otimizada
- `icon`: Ícone da categoria (opcional)

---

## 🏷️ Para Adicionar Nova Marca

### 1. Adicione Keywords em `src/lib/seoConfig.js`

```javascript
export const BRAND_KEYWORDS = {
  // ... marcas existentes
  
  'sua-nova-marca': [
    'nome da marca',
    'produto marca',
    'marca preço',
    'onde comprar marca',
    'marca brasil',
    // 5-10 keywords no total
  ]
}
```

### 2. Configure no Supabase

Na tabela `brands`, adicione:
- `name`: Nome da Marca
- `slug`: sua-nova-marca
- `description`: Descrição da marca
- `logo`: Logo da marca (opcional)

---

## 🔧 Para Modificar SEO de uma Rota

### Exemplo: Mudar título da Home

1. Abra `src/lib/seoConfig.js`
2. Encontre `ROUTE_SEO.home`
3. Modifique os campos:

```javascript
home: {
  title: 'Novo Título | Fast Sistemas Construtivos',
  description: 'Nova descrição otimizada...',
  keywords: ['nova', 'lista', 'de', 'keywords'],
  path: '/'
}
```

4. Salve e rebuilde: `npm run build`

---

## 🧪 Para Testar SEO

### 1. Teste Local

```bash
# Instale dependências (se necessário)
npm install

# Build do projeto
npm run build

# Verifique meta tags em dist/produto/{slug}/index.html
# Ou rode servidor local:
npm run preview
```

### 2. Teste Meta Tags

- Instale extensão: **Meta SEO Inspector** (Chrome)
- Navegue pelas páginas do site
- Verifique se meta tags estão corretas

### 3. Teste Schema.org

```
https://search.google.com/test/rich-results
```
- Cole URL de produto/categoria
- Verifique se schemas são detectados

### 4. Teste Social Sharing

**Facebook:**
```
https://developers.facebook.com/tools/debug/
```

**Twitter:**
```
https://cards-dev.twitter.com/validator
```

**WhatsApp:**
- Compartilhe link em conversa de teste
- Verifique preview

---

## 📊 Monitoramento

### Google Search Console

1. Acesse https://search.google.com/search-console
2. Adicione propriedade: `https://fastsistemas.com.br`
3. Monitore:
   - Impressões e cliques
   - Posição média por keyword
   - Erros de indexação
   - Rich results

### Google Analytics

1. Configure GA4 (se ainda não tiver)
2. Monitore:
   - Páginas mais visitadas
   - Origem do tráfego (orgânico vs social)
   - Conversões

---

## 🆘 Solução de Problemas

### Meta tags não aparecem no WhatsApp

**Problema:** Produto não está no pre-rendering

**Solução:**
1. Adicione slug em `scripts/prerender-products.mjs`
2. Rebuilde: `npm run build`
3. Deploy no Vercel
4. Limpe cache do WhatsApp/Facebook

### Keywords não estão funcionando

**Problema:** Categoria/marca não configurada

**Solução:**
1. Adicione keywords em `CATEGORY_KEYWORDS` ou `BRAND_KEYWORDS`
2. Verifique se slug está correto
3. Rebuilde e teste

### Schema.org não aparece no Google

**Problema:** Pode levar alguns dias para indexar

**Solução:**
1. Teste no Rich Results Test
2. Se passar no teste, aguarde 2-7 dias
3. Solicite re-indexação no Search Console

### Página não indexa

**Problema:** Pode ter `noindex` por engano

**Solução:**
1. Verifique se página tem `noindex={true}` no SEOHelmet
2. Remova se não for necessário
3. Somente Cart, Favoritos e Admin devem ter noindex

---

## 📝 Checklist de Deploy

Antes de fazer deploy:

- [ ] Testar meta tags localmente
- [ ] Verificar se pre-rendering gerou os HTMLs em `dist/produto/`
- [ ] Testar uma URL de produto no Facebook Debugger
- [ ] Verificar se não há erros no console
- [ ] Confirmar que `SUPABASE_URL` e `SUPABASE_ANON_KEY` estão corretas
- [ ] Rebuildar: `npm run build`
- [ ] Deploy no Vercel

---

## 🎯 Melhores Práticas

### Títulos (Title)
- ✅ 50-60 caracteres
- ✅ Inclua marca e produto
- ✅ Use separador: ` | ` ou ` - `
- ❌ Não repita o nome do site em todas as páginas

### Descrições
- ✅ 150-160 caracteres
- ✅ Seja descritivo e persuasivo
- ✅ Inclua call-to-action
- ❌ Não use apenas keywords

### Keywords
- ✅ 5-10 palavras-chave por página
- ✅ Inclua variações (singular/plural)
- ✅ Inclua long-tail (ex: "preço", "onde comprar")
- ❌ Não repita mesma keyword várias vezes

### Imagens
- ✅ Use imagens de alta qualidade (1200x630px ideal)
- ✅ Formato JPEG ou PNG
- ✅ Tamanho < 300KB
- ❌ Não use imagens muito pequenas

### URLs Canônicas
- ✅ Sempre use URL completa: `https://fastsistemas.com.br/produto/slug`
- ✅ Sem parâmetros desnecessários
- ✅ Use lowercase
- ❌ Não use URLs relativas

---

## 📞 Dúvidas Frequentes

**Q: Quando vou ver resultados no Google?**
A: 2-4 semanas para primeiras impressões, 2-3 meses para rankings consistentes.

**Q: Preciso fazer algo toda vez que adicionar produto?**
A: Apenas preencher o campo `seo` no Supabase. Pre-rendering é só para produtos importantes.

**Q: Como sei quais produtos pré-renderizar?**
A: Os 50 produtos mais vendidos, mais acessados ou estrategicamente importantes.

**Q: Posso mudar keywords depois?**
A: Sim! É normal ajustar baseado em dados do Search Console.

**Q: E se eu adicionar nova categoria?**
A: Adicione keywords no `seoConfig.js` e rebuilde o site.

---

## ✅ Status Atual

**Tudo funcionando! O sistema de SEO está completo e pronto para uso.**

Próximos passos:
1. ✅ Adicionar produtos com SEO no Supabase
2. ✅ Monitorar Google Search Console
3. ✅ Ajustar keywords baseado em dados
4. ✅ Expandir pre-rendering conforme necessário

**Boa sorte com o SEO absurdo! 🚀**
