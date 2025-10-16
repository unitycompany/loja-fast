# Vercel 404 - Troubleshooting e Correções

## 🔴 Problema
Site retornando 404 em: https://shop.fastsistemasconstrutivos.com.br/

## 🔍 Causa Raiz
O Vercel não estava configurado corretamente para Single Page Application (SPA) com React Router.

## ✅ Solução Aplicada

### 1. Atualizado `vercel.json`

Trocamos de `routes` (deprecated) para `rewrites` (moderno):

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### 2. Explicação

**Rewrites vs Routes:**
- ✅ `rewrites`: Modo moderno do Vercel, recomendado para SPAs
- ❌ `routes`: Deprecated, pode causar problemas com domínios customizados

**Como funciona:**
1. Todas as requisições que não são `/api/*` → vão para `/index.html`
2. React Router assume o controle do roteamento no cliente
3. Assets estáticos (`/assets/*`) são servidos normalmente

## 📋 Checklist de Verificação no Vercel

### 1. Domínio Configurado
Acesse: https://vercel.com/unitycompany/loja-fast/settings/domains

Verifique:
- ✅ `shop.fastsistemasconstrutivos.com.br` está adicionado
- ✅ DNS configurado corretamente (CNAME ou A record)
- ✅ SSL certificado ativo (pode levar até 24h)

### 2. Build Settings
Acesse: https://vercel.com/unitycompany/loja-fast/settings

**Framework Preset**: Vite
**Build Command**: `npm run build`
**Output Directory**: `dist`
**Install Command**: `npm install`

### 3. Environment Variables
Acesse: https://vercel.com/unitycompany/loja-fast/settings/environment-variables

Variáveis necessárias:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_SITE_URL` (opcional): `https://shop.fastsistemasconstrutivos.com.br`

### 4. Redeploy
Após fazer o commit:
1. Vercel detecta automaticamente o push
2. Inicia novo build
3. Deploy em ~1-2 minutos

Ou force um redeploy manual:
https://vercel.com/unitycompany/loja-fast/deployments

## 🧪 Teste Local

Antes de fazer deploy, teste localmente:

```bash
# Build
npm run build

# Preview (simula produção)
npm run preview
```

Acesse: http://localhost:4173

Navegue pelas rotas:
- `/` - Home
- `/pesquisa` - Busca
- `/produto/algum-slug` - Produto
- `/orcamento` - Carrinho

**Todas devem funcionar!** Se alguma der 404 localmente, há problema no código.

## 🔧 Configurações DNS

### CNAME (Recomendado)
```
shop.fastsistemasconstrutivos.com.br  →  cname.vercel-dns.com
```

### A Record (Alternativa)
```
shop.fastsistemasconstrutivos.com.br  →  76.76.21.21
```

**Propagação**: Pode levar de 5min a 48h dependendo do provedor DNS.

## 📝 Arquivos Importantes

### `vercel.json`
Configuração principal do Vercel (rewrites, headers, redirects)

### `public/_redirects`
Fallback para outras plataformas (Netlify, etc) - não usado no Vercel

### `vite.config.js`
- `base: '/'` para Vercel (domínio próprio)
- `base: '/loja-fast/'` para GitHub Pages (subpath)

## 🐛 Problemas Comuns

### Erro: "Cannot GET /produto/slug"
**Causa**: SPA rewrites não configurados
**Solução**: Use o novo `vercel.json` com `rewrites`

### Erro: "404 on page refresh"
**Causa**: Servidor não redireciona para index.html
**Solução**: Verifique `vercel.json` - deve ter o rewrite `/(.*) → /index.html`

### Erro: "Assets não carregam"
**Causa**: Base path incorreto ou assets com path absoluto errado
**Solução**: 
- Vercel usa `base: '/'`
- Assets devem estar em `/assets/*` (relativo à raiz)

### Domínio mostra "Invalid Certificate"
**Causa**: SSL ainda não provisionado
**Solução**: Aguarde até 24h após adicionar domínio

### Build falha com "Module not found"
**Causa**: Dependências não instaladas ou faltando
**Solução**: 
```bash
npm install
npm run build
```

## 🚀 Após Correção

1. ✅ Commit e push do novo `vercel.json`
2. ⏳ Aguardar build do Vercel (1-2 min)
3. 🧪 Testar todas as rotas:
   - https://shop.fastsistemasconstrutivos.com.br/
   - https://shop.fastsistemasconstrutivos.com.br/pesquisa
   - https://shop.fastsistemasconstrutivos.com.br/produto/teste
   - https://shop.fastsistemasconstrutivos.com.br/orcamento

4. 🔄 Se ainda der 404, verificar:
   - Logs do Vercel: https://vercel.com/unitycompany/loja-fast/deployments
   - Configuração de domínio
   - Propagação DNS

## 📞 Suporte

Se o problema persistir após 10 minutos do deploy:

1. Verifique logs do Vercel
2. Teste com domínio `.vercel.app` temporário
3. Se `.vercel.app` funcionar mas custom domain não, problema é DNS
4. Contate suporte do Vercel ou provedor DNS

## 🎯 Resultado Esperado

Todas as rotas devem funcionar:
- ✅ Home: `/`
- ✅ Busca: `/pesquisa`
- ✅ Produto: `/produto/:slug`
- ✅ Carrinho: `/orcamento`
- ✅ Favoritos: `/favoritos`
- ✅ Admin: `/admin`

E ao recarregar (F5) em qualquer rota, deve continuar funcionando!
