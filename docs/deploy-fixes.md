# Correções de Deploy - GitHub Pages

## 🔧 Problemas Identificados e Soluções

### Problema 1: Deploy Failing no GitHub Pages
**Erro**: "Deploy to GitHub Pages / deploy (push) Failing after 6s"

**Causas Possíveis**:
1. Falta do arquivo `.nojekyll` para evitar processamento Jekyll
2. Concurrency com `cancel-in-progress: true` causando cancelamentos
3. Path do artifact incorreto

### ✅ Soluções Implementadas

#### 1. Arquivo `.nojekyll` criado
- Criado `public/.nojekyll` (copiado para dist no build)
- Adicionado `touch dist/.nojekyll` no workflow para garantir

#### 2. Workflow Ajustado
- Mudado `cancel-in-progress: false` para evitar cancelamentos prematuros
- Comando unificado para criar 404.html e .nojekyll
- Path do artifact corrigido para `./dist`

#### 3. Estrutura do Workflow

```yaml
- name: Add SPA fallback and .nojekyll
  run: |
    cp dist/index.html dist/404.html
    touch dist/.nojekyll

- name: Upload artifact
  uses: actions/upload-pages-artifact@v3
  with:
    path: ./dist
```

## 📋 Checklist de Verificação

### GitHub Pages Settings
Verifique no GitHub: `Settings > Pages`
- [ ] Source: GitHub Actions (não "Deploy from branch")
- [ ] Build and deployment: GitHub Actions workflow

### Secrets no GitHub
Certifique-se que estão configurados:
- [ ] `VITE_SUPABASE_URL`
- [ ] `VITE_SUPABASE_ANON_KEY`
- [ ] `SUPABASE_URL` (opcional, para sitemap dinâmico)
- [ ] `SUPABASE_SERVICE_ROLE_KEY` (opcional)
- [ ] `SITE_ORIGIN` (opcional, padrão: github.io)

## 🚀 Vercel
O Vercel está OK e não precisa de alterações. Ele usa:
- `vercel.json` configurado corretamente
- Build automático do `package.json`
- Rotas SPA configuradas

## 🔍 Debugging

### Teste local do build:
```bash
npm run prebuild
npm run build
```

### Verifique arquivos gerados:
```bash
ls dist/
# Deve conter: index.html, 404.html, .nojekyll, assets/, etc.
```

### Logs do GitHub Actions:
1. Vá para: https://github.com/unitycompany/loja-fast/actions
2. Clique no workflow falhado
3. Veja os logs detalhados do step "Deploy to GitHub Pages"

## 📌 Próximos Passos

1. Fazer commit e push dessas alterações
2. Aguardar o novo build no GitHub Actions
3. Verificar se o deploy foi bem-sucedido
4. Testar a URL: https://unitycompany.github.io/loja-fast/

## 🐛 Problemas Comuns

### Se ainda falhar:
1. **Permissões**: Verifique `Settings > Actions > General > Workflow permissions`
   - Deve estar: "Read and write permissions"
   
2. **Pages não habilitado**: `Settings > Pages` deve ter a opção GitHub Actions selecionada

3. **Branch protection**: Se houver regras no branch main, elas podem bloquear o deploy

4. **Artifact muito grande**: O GitHub Pages tem limite de 1GB por site
