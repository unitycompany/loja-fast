# Correção de Erro 404 nas URLs de Produtos

## 🐛 Problema Identificado

URLs de produtos como `/produto/nome-do-produto` estavam retornando **404 NOT_FOUND** na Vercel, mesmo com o React Router configurado corretamente.

## 🔍 Causa Raiz

O arquivo `vercel.json` tinha uma rota específica que interceptava todas as URLs `/produto/*`:

```json
{ "src": "/produto/(.*)", "dest": "/api/meta-tags" }
```

Isso redirecionava todas as URLs de produto para a API de meta tags, impedindo o React Router de processar a rota no cliente.

## ✅ Solução Implementada

### 1. Corrigido `vercel.json`

**Antes:**
```json
"routes": [
  { "src": "/assets/(.*)", "dest": "/assets/$1" },
  { "src": "/product-feed.xml", "dest": "/product-feed.xml" },
  { "src": "/api/product-feed.xml", "dest": "/api/product-feed" },
  { "src": "/produto/(.*)", "dest": "/api/meta-tags" },  // ❌ Causava 404
  { "src": "/(.*)", "dest": "/index.html" }
]
```

**Depois:**
```json
"routes": [
  { "src": "/assets/(.*)", "dest": "/assets/$1" },
  { "src": "/product-feed.xml", "dest": "/product-feed.xml" },
  { "src": "/api/product-feed.xml", "dest": "/api/product-feed" },
  { "src": "/api/(.*)", "dest": "/api/$1" },  // ✅ Apenas APIs
  { "src": "/(.*)", "dest": "/index.html" }   // ✅ Todo resto → SPA
]
```

### 2. Criado `public/_redirects`

Arquivo adicional para garantir compatibilidade em todos os ambientes:

```
# API routes
/api/*  /api/:splat  200

# Static files
/assets/*  /assets/:splat  200
/product-feed.xml  /product-feed.xml  200

# All other routes go to index.html for client-side routing
/*  /index.html  200
```

## 🎯 Como Funciona Agora

### Fluxo Correto (SPA):

1. **Usuário acessa:** `https://loja-fast.vercel.app/produto/adesivo-selamax`
2. **Vercel:** Não encontra arquivo físico `/produto/adesivo-selamax`
3. **Vercel:** Aplica rota catch-all `{ "src": "/(.*)", "dest": "/index.html" }`
4. **Browser:** Carrega `index.html` com React App
5. **React Router:** Processa rota `/produto/:slug`
6. **Componente Product:** Busca produto no Supabase e renderiza

### Rotas Especiais:

- **`/api/*`** → Vai para serverless functions
- **`/assets/*`** → Arquivos estáticos
- **`/product-feed.xml`** → Feed XML de produtos
- **Tudo mais** → `index.html` (React Router)

## 🧪 Como Testar

### 1. Localmente (antes do deploy):

```bash
npm run dev
```

Acesse: `http://localhost:5173/produto/qualquer-slug`
- ✅ Deve carregar a página (mesmo que mostre "Produto não encontrado")
- ❌ NÃO deve dar 404 do servidor

### 2. Build local:

```bash
npm run build
npm run preview
```

Acesse: `http://localhost:4173/produto/qualquer-slug`
- ✅ Deve funcionar igual ao dev

### 3. Na Vercel (após deploy):

Teste URLs reais:
```
https://loja-fast.vercel.app/produto/adesivo-selamax-cimenticia-brasilit-400g
https://loja-fast.vercel.app/produto/arame-10-tirante-rolo-10-kg
https://loja-fast.vercel.app/produto/produto-inexistente
```

**Resultados esperados:**
- Produtos existentes e ativos: ✅ Página carrega normalmente
- Produtos inexistentes: ✅ Página carrega mas mostra "Produto não encontrado"
- Produtos inativos: ✅ Página carrega (acessível diretamente)
- ❌ NUNCA deve mostrar 404 da Vercel

## 🔧 Troubleshooting

### Ainda dá 404 após deploy?

1. **Limpe o cache da Vercel:**
   - Dashboard → Settings → Clear Cache
   - Faça novo deploy

2. **Verifique o build:**
   ```bash
   npm run build
   ```
   - Certifique-se que `dist/index.html` existe
   - Verifique se não há erros de build

3. **Verifique variáveis de ambiente:**
   - `VITE_SITE_URL` deve estar configurada
   - `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` devem estar corretas

4. **Force redeploy:**
   ```bash
   git commit --allow-empty -m "force redeploy"
   git push
   ```

### Alguns produtos funcionam, outros não?

**Causa:** Produto pode estar **inativo** (`is_active = false`)

**Verificar:**
```sql
SELECT slug, name, is_active, images
FROM products
WHERE slug = 'slug-do-produto-com-problema';
```

**Notas:**
- Produtos inativos NÃO aparecem em listagens/busca
- Mas produtos inativos PODEM ser acessados diretamente pela URL
- Se quiser bloquear acesso a produtos inativos, modifique `fetchProductBySlug`

### Como bloquear produtos inativos?

Se quiser que produtos inativos retornem 404:

**Arquivo:** `src/services/productService.js`

```javascript
export async function fetchProductBySlug(slug) {
  if (!SUPABASE_ENABLED) {
    const row = (Array.isArray(localProducts) ? localProducts : []).find(p => p.slug === slug)
    const [product] = await hydrateProducts(row ? [row] : [])
    if (!product) throw new Error('Produto não encontrado')
    return product
  }
  
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)  // ✅ Adicione esta linha
    .single()
    
  if (error) throw error
  const [product] = await hydrateProducts([data])
  return product
}
```

## 📋 Checklist de Verificação

Após fazer deploy, verifique:

- [ ] `/` - Página inicial carrega
- [ ] `/pesquisa` - Página de busca carrega
- [ ] `/produto/slug-valido` - Página de produto carrega
- [ ] `/produto/slug-invalido` - Mostra "Produto não encontrado" (não 404 Vercel)
- [ ] `/admin` - Painel admin carrega
- [ ] `/api/product-feed.xml` - Retorna XML
- [ ] URLs com acentos/caracteres especiais funcionam
- [ ] Navegação entre produtos funciona
- [ ] Botão voltar do navegador funciona

## 🚀 Deploy da Correção

```bash
# Commit das alterações
git add vercel.json public/_redirects
git commit -m "fix: corrige erro 404 em URLs de produtos"
git push

# Vercel fará deploy automaticamente
# Aguarde 1-2 minutos e teste
```

## 📚 Referências

- [Vercel SPA Configuration](https://vercel.com/docs/concepts/projects/project-configuration#routes)
- [React Router with Vercel](https://vercel.com/guides/deploying-react-with-vercel)
- [Handling 404 in SPAs](https://create-react-app.dev/docs/deployment/#serving-apps-with-client-side-routing)

---

**Status:** ✅ Corrigido
**Arquivos modificados:**
- `vercel.json` - Removida rota `/produto/*` que causava conflito
- `public/_redirects` - Criado para garantir roteamento SPA

**Próximos passos:** Deploy e teste
