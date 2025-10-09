# Arquitetura dos Campos de Descrição - Produtos

## 📊 Estrutura no Supabase (PostgreSQL)

```sql
CREATE TABLE public.products (
  -- ... outros campos ...
  
  -- CAMPOS DE DESCRIÇÃO
  shortdescription text,          -- Descrição curta (snake_case no banco)
  description text,               -- Descrição padrão/média
  long_description text,          -- Descrição longa detalhada
  description_html text,          -- Descrição rica em HTML
  
  -- ... outros campos ...
);
```

## 🔄 Mapeamento automático (productService.js)

O serviço mapeia automaticamente os campos do banco (snake_case) para camelCase no frontend:

```javascript
// Em hydrateProductImages():
if (p.shortdescription && !p.shortDescription) {
  p.shortDescription = p.shortdescription
}
if (p.long_description && !p.longDescription) {
  p.longDescription = p.long_description
}
if (p.description_html && !p.descriptionHtml) {
  p.descriptionHtml = p.description_html
}
```

## 📝 Onde cada descrição é usada

### 1. **Main.jsx** (Topo da página do produto)

```javascript
// Descrição CURTA visível ao usuário
<ShortDesc>{product.shortDescription || product.description || ''}</ShortDesc>

// JSON-LD para SEO (curta também)
description: product.shortDescription || product.description || ''
```

**Prioridade:** `shortDescription` → `description` → `''`

---

### 2. **Details.jsx** (Seção de detalhes completos)

```javascript
// Descrição LONGA/HTML completa
{product.descriptionHtml ? (
  <div dangerouslySetInnerHTML={{ __html: product.descriptionHtml }} />
) : product.longDescription ? (
  <p>{product.longDescription}</p>
) : (
  <p>{product.description || ''}</p>
)}

// JSON-LD para SEO dos detalhes
description: product.longDescription || product.description || ''
```

**Prioridade:** `descriptionHtml` → `longDescription` → `description` → `''`

---

### 3. **StructuredData.jsx** (Schema.org completo)

```javascript
// Schema principal
description: product.shortDescription || product.description || product.longDescription || ''

// Variantes (medidas)
description: product.shortDescription || product.description || ''
```

**Prioridade:** `shortDescription` → `description` → `longDescription` → `''`

---

## 🎯 Estratégia de Conteúdo Recomendada

| Campo | Tamanho | Uso | Exemplo |
|-------|---------|-----|---------|
| **shortDescription** | 50-150 chars | Resumo rápido no topo | "Montante em aço galvanizado, ideal para estruturas steel frame" |
| **description** | 150-300 chars | Descrição padrão/SEO | "Montante Steel Frame fabricado em aço galvanizado de alta qualidade, resistente à corrosão..." |
| **longDescription** | 300-1000 chars | Texto longo detalhado | Explicação completa com especificações técnicas, aplicações, benefícios |
| **descriptionHtml** | Sem limite | HTML rico com formatação | `<h2>Características</h2><ul><li>Alta resistência</li>...</ul>` |

---

## ✅ Verificação da Implementação

### Campos no Banco (snake_case):
- ✅ `shortdescription`
- ✅ `description`
- ✅ `long_description`
- ✅ `description_html`

### Campos no Frontend (camelCase):
- ✅ `product.shortDescription`
- ✅ `product.description`
- ✅ `product.longDescription`
- ✅ `product.descriptionHtml`

### Mapeamento Automático:
- ✅ `productService.js` → função `hydrateProductImages()`

### Componentes Atualizados:
- ✅ `Main.jsx` → Usa `shortDescription` primeiro
- ✅ `Details.jsx` → Usa `descriptionHtml` → `longDescription` → `description`
- ✅ `StructuredData.jsx` → Usa `shortDescription` para schema
- ✅ JSON-LD → Descrições apropriadas em cada contexto

---

## 🔧 Como Cadastrar no Painel Admin

```json
{
  "shortdescription": "Montante em aço galvanizado para steel frame",
  "description": "Montante Steel Frame SF 90 fabricado em aço galvanizado, oferece suporte confiável e durável em sistemas de construção.",
  "long_description": "O Montante Steel Frame foi desenvolvido para oferecer suporte confiável e durável em sistemas de steel frame. Fabricado com aço galvanizado de alta qualidade, é resistente à corrosão, garantindo segurança e longevidade em projetos estruturais. Por que escolher o Montante Steel Frame SF 90? 1. Alta resistência: Fabricado com aço galvanizado, garante durabilidade e suporte robusto...",
  "description_html": "<h2>Resistência e Estabilidade para Estruturas Steel Frame</h2><p>O Montante Steel Frame foi desenvolvido para oferecer suporte confiável...</p><h3>Principais Aplicações</h3><ul><li>Paredes e divisórias</li><li>Estrutura robusta para construções de alta resistência</li></ul>"
}
```

---

## 🚀 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ SUPABASE (PostgreSQL)                                       │
│ - shortdescription (text)                                   │
│ - description (text)                                        │
│ - long_description (text)                                   │
│ - description_html (text)                                   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ productService.js (hydrateProductImages)                    │
│ ✓ Mapeia snake_case → camelCase                             │
│ ✓ shortdescription → shortDescription                       │
│ ✓ long_description → longDescription                        │
│ ✓ description_html → descriptionHtml                        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│ FRONTEND (React Components)                                 │
│                                                             │
│ Main.jsx (Topo)                                             │
│ └─> product.shortDescription || product.description         │
│                                                             │
│ Details.jsx (Detalhes)                                      │
│ └─> product.descriptionHtml || longDescription             │
│                                                             │
│ StructuredData.jsx (SEO)                                    │
│ └─> product.shortDescription para schema principal         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📌 Notas Importantes

1. **Sempre prefira `shortDescription` para resumos** - É o campo otimizado para visualização rápida
2. **Use `descriptionHtml` para conteúdo rico** - Permite formatação completa com HTML
3. **`description` é o fallback universal** - Sempre preencha este campo como backup
4. **SEO usa descrições curtas** - Google e outros crawlers preferem resumos concisos

---

Criado em: 2025-10-07
Última atualização: 2025-10-07
