# ✅ Google Merchant Center - Configuração Completa

## 🎯 Resumo da Implementação

Implementamos um sistema completo de feed de produtos para Google Merchant Center, permitindo que seus produtos apareçam no Google Shopping.

## 📁 Arquivos Criados

1. **`scripts/generate-product-feed.mjs`**
   - Script para gerar feed XML estático
   - Executa automaticamente no build

2. **`api/product-feed.js`**
   - Endpoint de API para feed dinâmico
   - **RECOMENDADO** - sempre atualizado em tempo real

3. **`docs/google-merchant-center.md`**
   - Guia completo de configuração
   - Solução de problemas comuns

4. **`docs/vercel-merchant-setup.md`**
   - Guia específico para Vercel
   - Configuração de variáveis de ambiente

## 🚀 URL do Feed na Vercel

Use esta URL no Google Merchant Center:

```
https://loja-fast.vercel.app/api/product-feed.xml
```

## ⚙️ Configuração Necessária na Vercel

### 1. Variáveis de Ambiente

Adicione no painel da Vercel (**Settings** → **Environment Variables**):

```bash
VITE_SITE_URL=https://loja-fast.vercel.app
VITE_SUPABASE_URL=https://rfpvhpaoaaqjuojcssdf.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc... (sua chave)
```

### 2. Deploy

Após adicionar as variáveis:
1. Faça commit das alterações
2. Push para o repositório
3. A Vercel fará deploy automaticamente
4. Aguarde conclusão do build

## 🔧 Configurar no Google Merchant Center

### Passo a Passo Rápido:

1. Acesse https://merchants.google.com/
2. Vá em **Produtos** → **Feeds**
3. Clique em **+ Adicionar feed**
4. País: **Brasil** | Idioma: **Português**
5. Método: **Busca programada**
6. URL do feed:
   ```
   https://loja-fast.vercel.app/api/product-feed.xml
   ```
7. Frequência: **Diária**
8. Horário: **03:00 AM**
9. **Criar feed** → **Buscar agora**

## ✅ Verificação

### Testar o feed:

Abra no navegador:
```
https://loja-fast.vercel.app/api/product-feed.xml
```

**Resultado esperado:** XML começando com:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Loja Fast - Feed de Produtos</title>
```

**⚠️ Se aparecer HTML ou erro:**
- Verifique variáveis de ambiente na Vercel
- Faça novo deploy
- Aguarde alguns minutos para propagar

## 📋 Campos do Feed

Cada produto inclui:

**Obrigatórios:**
- `g:id` - ID único
- `g:title` - Nome do produto
- `g:description` - Descrição (sem HTML)
- `g:link` - URL da página
- `g:image_link` - URL da imagem
- `g:price` - Preço (formato: "25.90 BRL")
- `g:availability` - Disponibilidade
- `g:condition` - Condição

**Opcionais (quando disponíveis):**
- `g:brand` - Marca
- `g:gtin` - Código de barras
- `g:mpn` - Número do fabricante
- `g:product_type` - Categoria

## 🐛 Problemas Comuns

### 1. "Formato não aceito: HTML"
- ✅ **RESOLVIDO** - Agora retorna XML correto
- Use: `https://loja-fast.vercel.app/api/product-feed.xml`

### 2. "GTIN obrigatório"
- Adicione códigos de barras nos produtos
- Ou solicite isenção no Merchant Center

### 3. "Imagem não encontrada"
- Verifique se imagens estão públicas no Supabase
- Teste URLs das imagens no navegador

### 4. Feed vazio
- Confirme que há produtos no Supabase
- Verifique se produtos têm `name` e `price`

## 📊 Monitoramento

### No Google Merchant Center:

1. **Diagnóstico** (diário)
   - Produtos → Diagnóstico
   - Corrija erros apontados

2. **Desempenho** (semanal)
   - Desempenho → Visão geral
   - Impressões e cliques

### Na Vercel:

1. **Functions**
   - Analytics → Functions
   - Monitore uso do endpoint

2. **Logs**
   - Deployments → Functions → product-feed
   - Veja erros em tempo real

## 🎯 Próximos Passos

1. ✅ **Deploy na Vercel** com variáveis configuradas
2. ✅ **Testar feed** acessando a URL
3. ✅ **Configurar no Google Merchant Center**
4. ⏳ **Aguardar aprovação** (3-5 dias)
5. 📈 **Monitorar e otimizar**

## 📚 Documentação Completa

- [`docs/google-merchant-center.md`](./google-merchant-center.md) - Guia completo
- [`docs/vercel-merchant-setup.md`](./vercel-merchant-setup.md) - Setup Vercel

## 🔄 Atualizações Automáticas

**Feed Dinâmico (API):**
- ✅ Atualiza automaticamente quando produtos mudam no Supabase
- ✅ Não precisa rebuild ou deploy
- ✅ Google pega mudanças na próxima busca programada

**Feed Estático:**
- ⚠️ Precisa rebuild após mudanças
- Gerado em `public/product-feed.xml`
- URL: `https://loja-fast.vercel.app/product-feed.xml`

## 💡 Recomendações

1. **Use o feed dinâmico** (`/api/product-feed.xml`)
2. **Configure busca diária** no Google
3. **Monitore diagnóstico** semanalmente
4. **Adicione GTIN** quando possível
5. **Otimize títulos** para melhor ranking

## 🆘 Suporte

Problemas? Consulte:
1. Logs na Vercel (Functions)
2. Diagnóstico no Google Merchant Center
3. Documentação em `docs/`
4. Teste o feed diretamente no navegador

---

**Status:** ✅ Pronto para uso
**URL do Feed:** https://loja-fast.vercel.app/api/product-feed.xml
