# Correção de Persistência de UTM Parameters

## Problema Identificado
O site estava perdendo os parâmetros UTM ao navegar entre páginas, causando perda de tracking de marketing e campanhas.

## Solução Implementada

### 1. **Utilitário de URL com UTM (`src/utils/url.js`)**
   - Refatorada a função `go()` para preservar UTMs do localStorage
   - Criada função `buildUrlWithUTM()` para construir URLs com UTMs anexados
   - Criada função auxiliar `getStoredUTM()` para recuperar UTMs salvos

### 2. **Hook Customizado (`src/hooks/useNavigateWithUTM.jsx`)**
   - Novo hook `useNavigateWithUTM()` que envolve o `useNavigate` do React Router
   - Automaticamente adiciona UTMs armazenados a todas as navegações
   - Suporta navegação por string ou objeto
   - Preserva UTMs existentes na URL de destino

### 3. **Componentes Atualizados**

#### **Navegação Programática:**
- `src/components/navigation/Menu.jsx` - Menu principal com categorias
- `src/components/search/SearchContainer.jsx` - Container de busca

#### **Navegação por Link Direto:**
- `src/components/product/ProductCard.jsx` - Cards de produtos
- `src/components/banners/Banner.jsx` - Banners principais
- `src/components/banners/Adsense.jsx` - Banners promocionais
- `src/pages/Home/Sections/Categorys.jsx` - Carrossel de categorias
- `src/components/navigation/Breadcrumbs.jsx` - Breadcrumbs (usa `go()`)

## Como Funciona

### Fluxo de Persistência:
1. **Captura**: UTMContext já captura UTMs da URL e salva no localStorage
2. **Navegação**: Ao navegar, os componentes usam as novas funções que:
   - Recuperam UTMs do localStorage
   - Verificam se a URL de destino já tem UTMs
   - Adicionam UTMs ausentes sem sobrescrever existentes
3. **Persistência**: UTMs permanecem na URL durante toda a navegação

### Parâmetros Suportados:
- `utm_source`, `utm_medium`, `utm_campaign`
- `utm_term`, `utm_content`, `utm_id`
- `gclid`, `fbclid`, `msclkid`, `ttclid`, `dclid`
- `ref`

### Expiração:
- UTMs são mantidos por 90 dias (configurável no UTMContext)
- Após expiração, são automaticamente removidos

## Benefícios

✅ **Tracking Completo**: Mantenha rastreamento de origem em toda a jornada do usuário
✅ **Analytics Precisos**: Dados corretos no Google Analytics, Facebook Pixel, etc.
✅ **ROI de Campanhas**: Atribuição correta de conversões às campanhas
✅ **Compartilhamento**: Links compartilhados mantêm os UTMs
✅ **Compatibilidade**: Funciona com navegação por links e programática

## Exemplos de Uso

### Navegação Programática:
```jsx
import useNavigateWithUTM from '../../hooks/useNavigateWithUTM'

const navigate = useNavigateWithUTM()
navigate('/produtos')  // Automaticamente adiciona UTMs
```

### Navegação por Link:
```jsx
import { buildUrlWithUTM } from '../../utils/url'

const url = buildUrlWithUTM('/produto/drywall')
window.location.href = url  // URL com UTMs preservados
```

### Função go():
```jsx
import { go } from '../../utils/url'

go('/pesquisa')  // Automaticamente preserva UTMs
```

## Testes Recomendados

1. **Acesse o site com UTMs**: `https://seusite.com/?utm_source=google&utm_campaign=teste`
2. **Navegue entre páginas**: Home → Produtos → Detalhes
3. **Verifique a URL**: UTMs devem estar presentes em todas as páginas
4. **Compartilhe produtos**: Links compartilhados devem incluir UTMs
5. **Limpe localStorage**: Verifique que após 90 dias UTMs expiram

## Notas Técnicas

- UTMs não sobrescrevem parâmetros existentes na URL de destino
- Navegação para rotas externas ou admin pode excluir UTMs (configurável)
- Performance otimizada com memoização e localStorage
- Compatível com SSR e navegação do navegador

## Data de Implementação
Outubro 16, 2025
