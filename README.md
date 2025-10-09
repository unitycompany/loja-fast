## Loja Fast — React + Vite

E-commerce estático com integração ao Supabase, deploy automático via GitHub Pages e sitemap dinâmico.

### Desenvolvimento local

- Instalar dependências: `npm ci`
- Rodar em dev: `npm run dev`

### Build

- O build gera robots.txt e sitemap automaticamente antes do Vite: `npm run build`

### Deploy (GitHub Pages)

- Workflow em `.github/workflows/deploy.yml` publica a pasta `dist` a cada push na branch `main`.
- A base do Vite é configurada por `BASE_PATH` (no Pages: `/loja-fast/`). O Router usa `import.meta.env.BASE_URL`.

### Sitemap dinâmico

O script `scripts/generate-sitemap.mjs` tenta ler produtos e categorias do Supabase usando variáveis de ambiente (secrets no GitHub Actions):

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

Se os secrets não estiverem configurados, o script usa os arquivos locais `src/data/products.json` e `src/data/categories.json`.

Variáveis opcionais:

- `SITE_ORIGIN` (ex.: `https://unitycompany.github.io` ou seu domínio)
- `BASE_PATH` (ex.: `/loja-fast/`)

### Estrutura relevante

- `scripts/generate-robots.mjs`: gera `public/robots.txt` com o link correto do sitemap
- `scripts/generate-sitemap.mjs`: gera `public/sitemap.xml` com home, categorias e produtos
- `src/utils/url.js`: helper `go()` para navegação respeitando `BASE_URL`

### Dicas

- Configure `Settings → Pages → Source: GitHub Actions` no repositório.
- Para sitemap dinâmico, defina os secrets `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no repositório.
