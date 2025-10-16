# GitHub Pages - Instruções de Configuração

## ⚠️ IMPORTANTE: Configure o GitHub Pages ANTES do primeiro deploy

### Erro Comum:
```
Error: Creating Pages deployment failed
Error: HttpError: Not Found
```

Isso acontece quando o GitHub Pages não foi habilitado no repositório.

## 📋 Passo a Passo para Configurar:

### 1. Habilite o GitHub Pages

Acesse: https://github.com/unitycompany/loja-fast/settings/pages

**Configuração:**
- **Source**: Selecione **"GitHub Actions"** (não "Deploy from a branch")
- Clique em **Save**

![GitHub Pages Source Configuration](https://docs.github.com/assets/cb-47267/mw-1440/images/help/pages/publishing-source-drop-down.webp)

### 2. Configure as Permissões do Workflow

Acesse: https://github.com/unitycompany/loja-fast/settings/actions

**Workflow permissions:**
- ✅ Selecione: **"Read and write permissions"**
- ✅ Marque: **"Allow GitHub Actions to create and approve pull requests"**
- Clique em **Save**

### 3. Verifique os Secrets (Se usar Supabase)

Acesse: https://github.com/unitycompany/loja-fast/settings/secrets/actions

**Secrets necessários:**
- `VITE_SUPABASE_URL` - URL do seu projeto Supabase
- `VITE_SUPABASE_ANON_KEY` - Chave anônima do Supabase

**Secrets opcionais (para sitemap dinâmico):**
- `SUPABASE_URL` - URL do Supabase
- `SUPABASE_SERVICE_ROLE_KEY` - Service Role Key do Supabase
- `SITE_ORIGIN` - Origem do site (padrão: github.io)

### 4. Faça um Novo Push

Após configurar tudo, faça um novo commit/push para testar:

```bash
git commit --allow-empty -m "trigger: test GitHub Pages deploy"
git push origin main
```

### 5. Acompanhe o Deploy

Acesse: https://github.com/unitycompany/loja-fast/actions

O workflow deve:
1. ✅ Build - Compilar o projeto
2. ✅ Deploy - Fazer deploy no GitHub Pages

### 6. Acesse o Site

Após o deploy com sucesso:
- **URL do Site**: https://unitycompany.github.io/loja-fast/

## 🔍 Troubleshooting

### Erro: "Not Found (404)"
**Causa**: GitHub Pages não está habilitado
**Solução**: Siga o passo 1 acima

### Erro: "Resource not accessible by integration"
**Causa**: Permissões insuficientes do workflow
**Solução**: Siga o passo 2 acima

### Erro: "Reference does not exist"
**Causa**: Branch ou configuração incorreta
**Solução**: Verifique se está fazendo push para o branch `main`

### Erro de Build: "Module not found"
**Causa**: Dependências não instaladas
**Solução**: Verifique se o `package.json` está correto e execute `npm ci` localmente

## 📌 Checklist Final

Antes de fazer o deploy:
- [ ] GitHub Pages habilitado com source "GitHub Actions"
- [ ] Workflow permissions em "Read and write"
- [ ] Secrets configurados (se necessário)
- [ ] Arquivo `.nojekyll` presente em `public/`
- [ ] `package.json` com scripts `prebuild`, `build`, `postbuild`
- [ ] Build local funciona: `npm run build`

## 🎯 Arquivos Importantes

- `.github/workflows/deploy.yml` - Workflow do GitHub Actions
- `vite.config.js` - Configuração do Vite com base path
- `public/.nojekyll` - Previne processamento Jekyll
- `public/404.html` - Fallback SPA (criado automaticamente)

## 🚀 Após Configuração

O deploy será automático a cada push no branch `main`.

Você também pode disparar manualmente em:
https://github.com/unitycompany/loja-fast/actions/workflows/deploy.yml

Clique em **"Run workflow"** > **"Run workflow"**
