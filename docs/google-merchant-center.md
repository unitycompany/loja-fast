# Google Merchant Center - Guia de Configuração

## 📋 Visão Geral

Este guia explica como configurar e enviar seus produtos para o Google Merchant Center, permitindo que apareçam no Google Shopping e resultados de pesquisa de produtos.

## 🎯 O que foi implementado

### 1. Feed de Produtos XML

Criamos um feed de produtos no formato **RSS 2.0 com namespace Google** (`g:`), compatível com a especificação oficial do Google Merchant Center.

**Arquivos criados:**
- `scripts/generate-product-feed.mjs` - Script para gerar o feed estático
- `api/product-feed.js` - Endpoint de API para feed dinâmico
- `public/product-feed.xml` - Feed estático gerado

### 2. Campos Incluídos no Feed

Cada produto inclui os seguintes campos obrigatórios:

- **g:id** - Identificador único do produto
- **g:title** - Nome do produto (máx. 150 caracteres)
- **g:description** - Descrição detalhada sem HTML (máx. 5000 caracteres)
- **g:link** - URL da página do produto
- **g:image_link** - URL da imagem principal (pública e acessível)
- **g:price** - Preço no formato "25.90 BRL"
- **g:availability** - Disponibilidade (in_stock, out_of_stock, preorder)
- **g:condition** - Condição (new, used, refurbished)
- **g:brand** - Marca do produto (obrigatório)
- **g:identifier_exists** - Indica se tem GTIN (yes/no)
- **g:mpn** - Número do modelo do fabricante
- **g:google_product_category** - Categoria do Google Shopping
- **g:shipping_weight** - Peso para cálculo de frete

Campos opcionais (quando disponíveis):
- **g:gtin** - Código de barras (EAN, UPC) - obrigatório para algumas categorias
- **g:product_type** - Categoria do produto (sua taxonomia própria)

## 🚀 Como Usar

### Gerar o Feed Localmente

```bash
npm run generate:feed
```

Isso criará o arquivo `public/product-feed.xml` com todos os seus produtos.

### Feed Dinâmico via API

O feed também está disponível dinamicamente em:
```
https://seu-dominio.com/api/product-feed.xml
```

**Vantagem:** Sempre atualizado em tempo real com os produtos do Supabase.

### Feed Estático

Após o build, o feed estático estará em:
```
https://seu-dominio.com/product-feed.xml
```

**Vantagem:** Mais rápido, mas precisa ser regerado após mudanças nos produtos.

## 🔧 Configurar no Google Merchant Center

### Passo 1: Criar/Acessar sua conta

1. Acesse https://merchants.google.com/
2. Crie ou faça login em sua conta
3. Configure suas informações de negócio

### Passo 2: Verificar e Reivindicar seu Site

1. Vá em **Ferramentas e configurações** → **Informações da empresa**
2. Clique em **Verificar URL do site**
3. Siga as instruções para verificar seu domínio
4. Após verificar, clique em **Reivindicar URL**

### Passo 3: Adicionar Feed de Produtos

1. No menu, vá em **Produtos** → **Feeds**
2. Clique no botão **+** (Adicionar feed)
3. Escolha o país de destino: **Brasil**
4. Escolha o idioma: **Português**
5. Dê um nome ao feed: **Feed Principal de Produtos**
6. Clique em **Continuar**

### Passo 4: Configurar URL do Feed

1. Escolha **Busca programada**
2. Cole a URL do seu feed:
   ```
   https://loja-fast.vercel.app/product-feed.xml
   ```
   **OU** (se usar a API dinâmica - recomendado):
   ```
   https://loja-fast.vercel.app/api/product-feed.xml
   ```

3. Escolha a frequência de atualização:
   - **Diária** (recomendado para estoque variável)
   - **Semanal** (se produtos mudam pouco)

4. Configure o horário preferencial (ex: 03:00 AM)
5. Clique em **Criar feed**

### Passo 5: Buscar Produtos

1. Após criar o feed, clique em **Buscar agora**
2. Aguarde alguns minutos enquanto o Google processa
3. Verifique se há erros na aba **Diagnóstico**

## ✅ Checklist de Qualidade

Antes de enviar, certifique-se de que seus produtos têm:

### Campos Obrigatórios
- [ ] Nome/título claro e descritivo
- [ ] Descrição sem HTML (texto limpo)
- [ ] Preço válido e atualizado
- [ ] URL da página do produto funcionando
- [ ] Imagem de boa qualidade (mínimo 250x250px)
- [ ] Disponibilidade correta (in_stock/out_of_stock)
- [ ] Condição do produto (new/used/refurbished)

### Campos Recomendados
- [ ] Marca (brand)
- [ ] GTIN/EAN (código de barras)
- [ ] MPN (número do fabricante)
- [ ] Categoria do produto

### Requisitos de Qualidade
- [ ] Imagens em alta resolução (recomendado: 800x800px ou maior)
- [ ] Descrições únicas (não copiar do fabricante)
- [ ] Preços competitivos
- [ ] Estoque atualizado

## 🐛 Solução de Problemas Comuns

### Erro: "O arquivo de feed está em um formato não aceito: HTML"

**Causa:** O Google está acessando a página HTML do seu site ao invés do arquivo XML.

**Solução:**
1. Verifique se a URL termina em `.xml`
2. Confirme que o arquivo XML existe no caminho especificado
3. Teste acessando diretamente: `https://seu-site.com/product-feed.xml`
4. O retorno deve ser XML, não HTML

### Erro: "Faltando dados do inventário" ou "Availability ausente"

**Causa:** Campos obrigatórios de inventário não estão presentes.

**Solução:**
1. **Certifique-se que cada produto tem:**
   - `availability` (in_stock, out_of_stock, preorder)
   - `price` (preço válido)
   - `condition` (new, used, refurbished)
   
2. **Adicione estoque nos produtos:**
   ```javascript
   {
     "availability": "in_stock",
     "stock": 100,
     "price": 29.90,
     "condition": "new"
   }
   ```

3. **Configure no Supabase:**
   - Abra a tabela `products`
   - Verifique se os campos existem
   - Preencha valores padrão para produtos sem dados

### Erro: "GTIN obrigatório" ou "Identificador ausente"

**Causa:** Para algumas categorias, o Google exige código de barras (GTIN/EAN).

**Solução:**
1. Adicione o campo `gtin` ou `ean` nos seus produtos
2. Use o campo `identifier_exists`:
   - `yes` - se tem GTIN
   - `no` - se não tem GTIN (pedirá isenção automaticamente)
3. Se não tiver GTIN, peça isenção no Merchant Center:
   - Vá em **Produtos** → **Diagnóstico**
   - Clique no erro → **Solicitar isenção de GTIN**

### Erro: "Imagem não encontrada" ou "Não é possível mostrar imagem"

**Causa:** A URL da imagem está incorreta, inacessível, ou o domínio não corresponde ao link.

**Solução:**
1. **Verifique se as imagens são públicas:**
   - Acesse o Supabase Dashboard
   - Vá em Storage → product-images
   - Certifique-se que o bucket é público
   - Teste a URL: `https://SEU_PROJETO.supabase.co/storage/v1/object/public/product-images/NOME_IMAGEM.jpg`

2. **Domínio incompatível:**
   - A imagem deve estar no mesmo domínio do site OU em domínio verificado
   - Configure `VITE_SITE_URL=https://loja-fast.vercel.app` no `.env`
   - Ou use CDN com HTTPS válido

3. **Formato e tamanho:**
   - Mínimo: 250x250px
   - Recomendado: 800x800px ou maior
   - Formatos aceitos: JPG, PNG, GIF, WebP
   - Tamanho máximo: 16MB

4. **Teste as URLs:**
   - Abra cada URL de imagem no navegador
   - Deve carregar a imagem diretamente
   - Não pode redirecionar ou retornar HTML

### Erro: "Preço ausente ou inválido"

**Causa:** O preço está em formato incorreto.

**Solução:**
- O formato correto é: `25.90 BRL`
- Sempre incluir a moeda (BRL, USD, etc.)
- Usar ponto (.) como separador decimal

## 📊 Monitoramento

### Métricas para Acompanhar

1. **Produtos aprovados** vs **rejeitados**
   - Acesse: Produtos → Diagnóstico

2. **Impressões no Google Shopping**
   - Acesse: Desempenho → Visão geral

3. **Cliques e conversões**
   - Integre com Google Ads para métricas completas

### Alertas Importantes

Configure alertas para:
- Produtos desaprovados
- Problemas de estoque
- Preços desatualizados
- Imagens quebradas

## 🔄 Atualizações Automáticas

O feed é regenerado automaticamente:

1. **Durante o build** (via `prebuild` script)
2. **Manualmente** com `npm run generate:feed`
3. **Via API** sempre atualizado em tempo real

Para atualizar os produtos no Google:
- Feed estático: Regenere com `npm run generate:feed` e faça deploy
- Feed dinâmico (API): Atualização automática, basta o Google buscar

## 📚 Recursos Adicionais

- [Especificação do Feed de Produtos](https://support.google.com/merchants/answer/7052112)
- [Guia de Requisitos de Dados](https://support.google.com/merchants/answer/7052112)
- [Políticas do Shopping](https://support.google.com/merchants/answer/6149970)
- [Central de Ajuda Merchant Center](https://support.google.com/merchants/)

## 🎉 Próximos Passos

Após configurar o feed:

1. **Aguarde aprovação** (pode levar 3-5 dias úteis)
2. **Corrija erros** indicados no Diagnóstico
3. **Configure campanhas** no Google Ads (opcional)
4. **Monitore desempenho** regularmente
5. **Otimize títulos e descrições** para melhores resultados

## 🆘 Suporte

Se encontrar problemas:
1. Verifique os logs de erro no terminal ao gerar o feed
2. Teste a URL do feed diretamente no navegador
3. Consulte o diagnóstico no Google Merchant Center
4. Revise este guia e a documentação oficial do Google
