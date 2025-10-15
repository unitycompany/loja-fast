# Configuração da Vercel para Google Merchant Center

## 📋 Variáveis de Ambiente na Vercel

Para que o feed de produtos funcione corretamente, você precisa configurar as seguintes variáveis de ambiente no painel da Vercel:

### Como Adicionar Variáveis de Ambiente

1. Acesse o [Dashboard da Vercel](https://vercel.com/dashboard)
2. Selecione seu projeto **loja-fast**
3. Vá em **Settings** → **Environment Variables**
4. Adicione as seguintes variáveis:

### Variáveis Obrigatórias

```bash
VITE_SITE_URL=https://loja-fast.vercel.app
VITE_SUPABASE_URL=https://rfpvhpaoaaqjuojcssdf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```

**Importante:** Marque essas variáveis para todos os ambientes:
- ✅ Production
- ✅ Preview
- ✅ Development

## 🔗 URLs do Feed

Após o deploy na Vercel, seu feed estará disponível em:

### Feed Estático (gerado no build)
```
https://loja-fast.vercel.app/product-feed.xml
```

**Vantagens:**
- Mais rápido
- Menor consumo de recursos
- Cache eficiente

**Desvantagens:**
- Precisa rebuild para atualizar

### Feed Dinâmico (API - RECOMENDADO)
```
https://loja-fast.vercel.app/api/product-feed.xml
```

**Vantagens:**
- ✅ Sempre atualizado em tempo real
- ✅ Reflete mudanças imediatas no Supabase
- ✅ Não precisa rebuild

**Desvantagens:**
- Usa serverless function (mas Vercel oferece 100GB grátis/mês)

## 🚀 Configuração no Google Merchant Center

Use a URL do **feed dinâmico** (recomendado):

```
https://loja-fast.vercel.app/api/product-feed.xml
```

### Passos:

1. Acesse [Google Merchant Center](https://merchants.google.com/)
2. Vá em **Produtos** → **Feeds**
3. Clique em **+ Adicionar feed**
4. País: **Brasil**
5. Idioma: **Português**
6. Método: **Busca programada**
7. Cole a URL: `https://loja-fast.vercel.app/api/product-feed.xml`
8. Frequência: **Diária** (recomendado)
9. Horário: **03:00 AM**
10. Clique em **Criar feed**
11. Clique em **Buscar agora**

## ✅ Verificação

### Testar se o feed está funcionando:

1. **Abra no navegador:**
   ```
   https://loja-fast.vercel.app/api/product-feed.xml
   ```

2. **Você deve ver um XML** começando com:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
     <channel>
       <title>Loja Fast - Feed de Produtos</title>
   ```

3. **Se aparecer HTML** ao invés de XML:
   - ❌ Verifique se as variáveis de ambiente estão configuradas
   - ❌ Verifique se o arquivo `api/product-feed.js` existe
   - ❌ Faça um novo deploy

### Verificar no Google Merchant Center:

1. Após adicionar o feed, aguarde alguns minutos
2. Vá em **Produtos** → **Diagnóstico**
3. Verifique se há erros ou avisos
4. Corrija os problemas apontados

## 🐛 Solução de Problemas

### Erro: "Cannot GET /api/product-feed.xml"

**Solução:**
1. Verifique se o arquivo `api/product-feed.js` existe
2. Faça um novo deploy na Vercel
3. Aguarde alguns minutos para propagar

### Erro: "Internal Server Error"

**Solução:**
1. Verifique os logs na Vercel:
   - Vá em **Deployments** → selecione o último deploy
   - Clique em **Functions** → clique na função `product-feed`
   - Veja os logs de erro
2. Verifique se `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão configurados
3. Verifique se há produtos no Supabase

### Feed retorna XML vazio (sem produtos)

**Possíveis causas:**
1. Nenhum produto cadastrado no Supabase
2. Produtos sem campo `name` ou `price`
3. Erro de conexão com Supabase

**Solução:**
1. Verifique se há produtos no Supabase
2. Confirme que os produtos têm `name` e `price` preenchidos
3. Teste a conexão: `https://loja-fast.vercel.app/api/product-feed.xml`

## 📊 Monitoramento

### Métricas da Vercel

Monitore o uso da função serverless:
1. Acesse **Analytics** no painel da Vercel
2. Veja quantas requisições o feed recebe
3. Monitore o tempo de resposta

### Google Merchant Center

1. **Produtos** → **Diagnóstico**
   - Veja produtos aprovados vs rejeitados
   - Corrija erros apontados

2. **Desempenho** → **Visão geral**
   - Impressões no Google Shopping
   - Cliques e conversões

## 🔄 Atualizações

### Para atualizar produtos no feed:

**Feed Estático:**
1. Faça alterações nos produtos no Supabase
2. Execute: `npm run build`
3. Faça deploy na Vercel
4. Aguarde Google buscar novamente (ou force no Merchant Center)

**Feed Dinâmico (Recomendado):**
1. Faça alterações nos produtos no Supabase
2. ✅ Feed já está atualizado automaticamente!
3. O Google pegará as mudanças na próxima busca programada

## 💡 Dicas

1. **Use o feed dinâmico** - sempre atualizado sem rebuild
2. **Configure busca diária** no Google Merchant Center
3. **Monitore o Diagnóstico** regularmente
4. **Otimize títulos e descrições** para melhor ranking
5. **Adicione GTIN/EAN** quando possível (melhora a qualidade)

## 📚 Próximos Passos

Após configurar o feed:

1. ✅ Aguarde aprovação do Google (3-5 dias)
2. ✅ Corrija erros no Diagnóstico
3. ✅ Configure Google Ads (opcional)
4. ✅ Monitore desempenho
5. ✅ Otimize constantemente

## 🆘 Suporte

Se tiver problemas:
1. Verifique os logs na Vercel
2. Teste a URL do feed diretamente
3. Consulte `docs/google-merchant-center.md`
4. Veja erros no Google Merchant Center → Diagnóstico
