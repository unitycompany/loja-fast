## Loja Fast — React + Vite

E-commerce estático com integração ao Supabase, deploy automático via GitHub Pages e sitemap dinâmico.

### Desenvolvimento local

- Instalar dependências: `npm ci`
- Rodar em dev: `npm run dev`

### Variáveis de ambiente obrigatórias

| Variável | Onde usar | Observação |
|----------|-----------|------------|
| `VITE_SUPABASE_URL` | Frontend (Vite) | URL do projeto Supabase. Sem ela o app entra em modo offline e usa apenas os JSON locais. |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Vite) | Chave pública para leituras anônimas. Necessária em Preview/Prod (GitHub Pages, Vercel etc.). |
| `SUPABASE_URL` | Scripts Node (`scripts/*.js`) | Opcional, facilita rodar scripts CLI sem expor o prefixo `VITE_`. |
| `SUPABASE_SERVICE_ROLE_KEY` | Scripts Node | **Nunca** disponibilizar no navegador. Use só em scripts controlados ou Actions. |

> Dica: copie `.env.example` para `.env` em desenvolvimento local. Em Vercel defina os nomes exatamente com o prefixo `VITE_` para que o build os exponha ao bundle.

### Build

- O build gera robots.txt e sitemap automaticamente antes do Vite: `npm run build`

### Deploy (Vercel)

1. Em **Project Settings → Environment Variables**, cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` para os ambientes Preview e Production.
2. (Opcional) Adicione `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` se quiser executar `scripts/import-products.js` via `vercel cron` ou CLI.
3. Rode `npx vercel env pull .env.vercel` para garantir que os valores estão acessíveis ao build local.
4. Faça o deploy normalmente (`vercel --prod` ou GitHub integration). Sem os `VITE_*` valores, o app renderiza apenas dados locais.

#### Conferindo acesso ao Supabase

Depois de configurar as variáveis, você pode testar a conexão com os scripts auxiliares:

```powershell
set VITE_SUPABASE_URL=https://seu-projeto.supabase.co
set VITE_SUPABASE_ANON_KEY=chave
node scripts/test-supabase.mjs
node scripts/test-supabase-categories.mjs
```

Cada script imprime `{ "count": 1 }` e `error: null` quando o acesso está liberado.

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

### Políticas RLS (quando habilitado)

Se ativar Row Level Security no Supabase, garanta acesso de leitura ao papel `anon`:

```sql
alter table public.products enable row level security;
create policy "allow anon read products"
	on public.products for select using (true);

alter table public.categories enable row level security;
create policy "allow anon read categories"
	on public.categories for select using (true);

alter table public.banners enable row level security;
create policy "allow anon read banners"
	on public.banners for select using (true);
```

Substitua ou ajuste conforme a sua modelagem.
