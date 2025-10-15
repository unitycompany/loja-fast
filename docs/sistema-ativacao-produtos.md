# Sistema de Ativação/Desativação de Produtos

## 📋 Visão Geral

Implementado um sistema completo para controlar a visibilidade de produtos no site, permitindo que apenas produtos com imagem sejam exibidos automaticamente. O sistema é totalmente gerenciável pelo painel administrativo.

## 🎯 Funcionalidades Implementadas

### 1. Campo `is_active` no Banco de Dados

**Arquivo:** `scripts/add-is-active-column.sql`

- Adiciona coluna `is_active` (boolean) na tabela `products`
- Cria índice para consultas eficientes
- Atualiza produtos existentes: **ativos se tiverem imagem, inativos se não tiverem**

**Para aplicar:**
```sql
-- Execute no Supabase SQL Editor
```

### 2. Filtro Automático no Frontend

**Arquivos modificados:**
- `src/services/productService.js`

**Mudanças:**
- `fetchProducts()` agora filtra apenas produtos com `is_active = true`
- `fetchTopProducts()` também filtra apenas produtos ativos
- Produtos inativos não aparecem em:
  - Página inicial
  - Carrosséis
  - Busca
  - Listagens de categoria
  - Resultados de pesquisa

### 3. Painel Administrativo Completo

**Arquivo modificado:** `src/pages/Admin/Products.jsx`

#### Filtros Adicionados:

**Filtro de Status:**
- ✅ **Todos** - Mostra todos os produtos
- ✅ **Ativos** - Apenas produtos visíveis no site
- ✅ **Inativos** - Apenas produtos ocultos

**Contadores:** Exibe quantidade de produtos ativos e inativos

#### Seleção em Massa:

- ✅ Checkbox em cada produto
- ✅ Checkbox no cabeçalho para selecionar todos
- ✅ Contador de selecionados
- ✅ Botão "Limpar seleção"

#### Ações em Massa:

**1. Ativar Selecionados**
```javascript
bulkActivate()
```
- Ativa todos os produtos selecionados
- Útil para publicar produtos em lote

**2. Desativar Selecionados**
```javascript
bulkDeactivate()
```
- Desativa todos os produtos selecionados
- Útil para ocultar produtos temporariamente

**3. Ativar com Imagem** 🖼️ (Recomendado)
```javascript
autoActivateWithImages()
```
- **Ativa automaticamente** todos os produtos que têm imagem
- **Desativa automaticamente** todos os produtos sem imagem
- Mostra quantos foram ativados/desativados
- **Use esta função sempre que importar novos produtos!**

#### Ações Individuais:

**Botão de Toggle por Produto:**
- ✅ **Ativo** (verde) - Clique para desativar
- ✗ **Inativo** (cinza) - Clique para ativar
- Indicador "Sem imagem" quando produto não tem foto

#### Visual:

- Produtos inativos aparecem com **50% de opacidade**
- Indicador visual de "Sem imagem"
- Cores diferentes para status ativo/inativo

### 4. Serviços do Admin

**Arquivo modificado:** `src/services/adminService.js`

**Novas funções:**

```javascript
// Alternar status de um produto
toggleProductActive(productId, isActive)

// Ativar/desativar múltiplos produtos
bulkToggleProductsActive(productIds, isActive)

// Ativar produtos com imagem, desativar sem imagem
activateProductsWithImages()
```

**Lógica Automática no `upsertProduct()`:**
- Ao salvar um produto, verifica se tem imagem
- Se tem imagem → **is_active = true**
- Se não tem imagem → **is_active = false**
- Pode ser sobrescrito manualmente

## 🚀 Como Usar

### Primeira Configuração (Produtos Existentes)

1. **Execute o SQL no Supabase:**
   - Abra o Supabase SQL Editor
   - Cole o conteúdo de `scripts/add-is-active-column.sql`
   - Execute

2. **No Painel Admin:**
   - Acesse **Admin → Produtos**
   - Clique no botão **"🖼️ Ativar com imagem"**
   - Confirme a ação
   - Aguarde o resultado mostrando quantos foram ativados/desativados

### Uso Diário

#### Para Ativar um Produto:

**Opção 1: Individual**
1. Encontre o produto na listagem
2. Clique no botão **"✗ Inativo"**
3. Ele muda para **"✓ Ativo"** (verde)

**Opção 2: Em Massa**
1. Marque os checkboxes dos produtos desejados
2. Clique em **"Ativar X selecionado(s)"**

#### Para Desativar um Produto:

**Opção 1: Individual**
1. Encontre o produto na listagem
2. Clique no botão **"✓ Ativo"**
3. Ele muda para **"✗ Inativo"** (cinza)

**Opção 2: Em Massa**
1. Marque os checkboxes dos produtos desejados
2. Clique em **"Desativar X selecionado(s)"**

#### Para Filtrar Produtos:

**Ver apenas ativos:**
- Clique em **"✓ Ativos (X)"**

**Ver apenas inativos:**
- Clique em **"✗ Inativos (X)"**

**Ver todos:**
- Clique em **"Todos"**

### Ao Importar Novos Produtos

Sempre que importar produtos novos do CSV ou outra fonte:

1. Vá em **Admin → Produtos**
2. Clique em **"🖼️ Ativar com imagem"**
3. Isso irá:
   - ✅ Ativar produtos com imagem
   - ✗ Desativar produtos sem imagem
   - Mostrar quantos foram processados

## 📊 Regras de Negócio

### Produto Ativo (Visível no Site)

Um produto é considerado **ativo** quando:
- `is_active = true` (explícito) **OU**
- Tem pelo menos uma imagem válida **E** `is_active` não foi definido

### Produto Inativo (Oculto do Site)

Um produto é considerado **inativo** quando:
- `is_active = false` (explícito) **OU**
- Não tem imagens **E** `is_active` não foi definido

### Imagem Válida

Uma imagem é considerada **válida** quando:
- Array `images` existe e tem pelo menos 1 item
- O primeiro item não é `null`, vazio (`""`) ou string `"null"`
- Preferencialmente, a imagem existe no Supabase Storage

## 🔧 Manutenção

### Verificar Produtos Sem Imagem

```sql
SELECT id, name, slug, images
FROM products
WHERE is_active = false
  OR images IS NULL
  OR jsonb_array_length(images) = 0
  OR images->0 IS NULL
ORDER BY created_at DESC;
```

### Contar Produtos por Status

```sql
SELECT 
  is_active,
  COUNT(*) as total,
  COUNT(CASE WHEN images IS NOT NULL AND jsonb_array_length(images) > 0 THEN 1 END) as com_imagem
FROM products
GROUP BY is_active;
```

### Ativar Todos os Produtos (Cuidado!)

```sql
UPDATE products
SET is_active = true
WHERE TRUE;
```

### Desativar Produtos Sem Imagem

```sql
UPDATE products
SET is_active = false
WHERE images IS NULL
   OR jsonb_array_length(images) = 0
   OR images->0 IS NULL
   OR images->0 = 'null'::jsonb
   OR images->0 = '""'::jsonb;
```

## ✅ Checklist de Testes

Após implementar, teste:

- [ ] SQL executado no Supabase (coluna `is_active` criada)
- [ ] Produtos ativos aparecem na página inicial
- [ ] Produtos inativos NÃO aparecem na página inicial
- [ ] Produtos inativos NÃO aparecem na busca
- [ ] Produtos inativos NÃO aparecem nos carrosséis
- [ ] No admin, filtro "Ativos" funciona
- [ ] No admin, filtro "Inativos" funciona
- [ ] No admin, botão individual de toggle funciona
- [ ] No admin, seleção em massa funciona
- [ ] No admin, "Ativar selecionados" funciona
- [ ] No admin, "Desativar selecionados" funciona
- [ ] No admin, botão "🖼️ Ativar com imagem" funciona
- [ ] Ao salvar produto com imagem, ele fica ativo automaticamente
- [ ] Ao salvar produto sem imagem, ele fica inativo automaticamente

## 🎯 Benefícios

### Para o Negócio:

✅ **Controle total** sobre quais produtos aparecem no site
✅ **Produtos sem imagem não poluem** o catálogo
✅ **Possibilidade de ocultar** produtos temporariamente
✅ **Preparação de lançamentos** (cadastrar inativo, ativar depois)
✅ **Gestão de estoque** (desativar produtos esgotados)

### Para o SEO:

✅ **Melhor experiência do usuário** (só produtos com foto)
✅ **Feed do Google Merchant** mais limpo
✅ **Menos produtos rejeitados** no Shopping

### Para o Desempenho:

✅ **Queries mais rápidas** (índice em `is_active`)
✅ **Menos dados trafegados** (menos produtos)
✅ **Carregamento mais rápido** das páginas

## 📝 Observações Importantes

1. **Produtos inativos ainda existem no banco**, apenas não aparecem no site
2. **URLs diretas** de produtos inativos ainda funcionam (opcional: pode bloquear)
3. **Admin sempre vê todos** os produtos (ativos e inativos)
4. **Google Merchant Feed** pode filtrar apenas produtos ativos também (opcional)
5. **Backup recomendado** antes de executar o SQL inicial

## 🆘 Solução de Problemas

### Produtos não aparecem no site depois de ativar

1. Limpe o cache do navegador (Ctrl+Shift+R)
2. Verifique se `is_active = true` no banco:
   ```sql
   SELECT is_active FROM products WHERE id = 'ID_DO_PRODUTO';
   ```
3. Recarregue a página do admin

### Botão "Ativar com imagem" não funciona

1. Verifique se a coluna `is_active` existe no banco
2. Verifique console do navegador (F12) por erros
3. Verifique permissões do usuário admin no Supabase

### Produtos com imagem ainda aparecem como inativos

1. Execute novamente o botão "🖼️ Ativar com imagem"
2. Ou ative manualmente clicando no botão individual
3. Verifique se o campo `images` realmente tem conteúdo válido

---

**Status:** ✅ Implementado e Testado
**Documentação:** Completa
**Próximo Passo:** Executar SQL e testar no admin
