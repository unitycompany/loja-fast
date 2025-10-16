# Sistema de Loading e Skeleton Loaders

## Visão Geral

Este documento descreve o sistema de loading implementado no projeto para melhorar a experiência do usuário durante o carregamento de dados do Supabase.

## Componentes Disponíveis

### 1. CenteredLoader
**Localização:** `src/components/common/CenteredLoader.jsx`

Loading centralizado na tela com ou sem overlay.

**Props:**
- `label` (string, default: "Carregando..."): Texto exibido
- `size` (number, default: 48): Tamanho do spinner
- `overlay` (boolean, default: true): Se deve mostrar overlay de fundo

**Uso:**
```jsx
import CenteredLoader from '../../components/common/CenteredLoader'

// Com overlay (fullscreen)
<CenteredLoader label="Carregando página..." />

// Sem overlay (inline)
<CenteredLoader label="Carregando dados..." overlay={false} />
```

### 2. Skeleton
**Localização:** `src/components/common/Skeleton.jsx`

Componente básico de skeleton com animação shimmer.

**Props:**
- `width` (string/number, default: "100%"): Largura
- `height` (number, default: 16): Altura em pixels
- `style` (object): Estilos adicionais

**Uso:**
```jsx
import Skeleton from '../../components/common/Skeleton'

<Skeleton width="80%" height={24} />
<Skeleton height={200} style={{ borderRadius: '8px' }} />
```

### 3. SkeletonComponents
**Localização:** `src/components/common/SkeletonComponents.jsx`

Coleção de skeletons especializados para diferentes componentes.

#### ProductCardSkeleton
Skeleton para card de produto.

```jsx
import { ProductCardSkeleton } from '../../components/common/SkeletonComponents'

<ProductCardSkeleton />
```

#### ProductGridSkeleton
Grid de skeletons de produtos.

**Props:**
- `count` (number, default: 9): Número de cards

```jsx
import { ProductGridSkeleton } from '../../components/common/SkeletonComponents'

<ProductGridSkeleton count={9} />
```

#### CategorySkeleton
Skeleton para card de categoria.

```jsx
import { CategorySkeleton } from '../../components/common/SkeletonComponents'

<CategorySkeleton />
```

#### CategoryGridSkeleton
Grid de skeletons de categorias.

**Props:**
- `count` (number, default: 8): Número de categorias

```jsx
import { CategoryGridSkeleton } from '../../components/common/SkeletonComponents'

<CategoryGridSkeleton count={8} />
```

#### BannerSkeleton
Skeleton para banner com aspect ratio responsivo.

```jsx
import { BannerSkeleton } from '../../components/common/SkeletonComponents'

<BannerSkeleton />
```

#### ProductCarouselSkeleton
Skeleton completo para carrossel de produtos.

**Props:**
- `count` (number, default: 4): Número de produtos

```jsx
import { ProductCarouselSkeleton } from '../../components/common/SkeletonComponents'

<ProductCarouselSkeleton count={4} />
```

#### ProductDetailSkeleton
Skeleton para página de detalhes do produto.

```jsx
import { ProductDetailSkeleton } from '../../components/common/SkeletonComponents'

<ProductDetailSkeleton />
```

#### ProductTableSkeleton
Skeleton para lista de produtos no admin.

**Props:**
- `rows` (number, default: 5): Número de linhas

```jsx
import { ProductTableSkeleton } from '../../components/common/SkeletonComponents'

<ProductTableSkeleton rows={10} />
```

## Implementações por Página

### Home (`src/pages/Home/Home.jsx`)
- **Loading state:** Aguarda categorias carregar antes de renderizar
- **Componente:** `CenteredLoader` (sem overlay)
- **Comportamento:** Mostra loader centralizado até todas as categorias serem carregadas

```jsx
if (loading) {
    return <CenteredLoader label="Carregando página inicial..." overlay={false} />
}
```

### Product (`src/pages/Product/Product.jsx`)
- **Loading state:** Aguarda produto carregar
- **Componente:** `ProductDetailSkeleton`
- **Comportamento:** Mostra skeleton da estrutura da página de produto

```jsx
if (loading) {
    return <ProductDetailSkeleton />
}
```

### Search (`src/pages/Search/Search.jsx`)
- **Loading state:** Aguarda produtos da busca
- **Componente:** `ProductGridSkeleton` (via ProductsGrid)
- **Comportamento:** Mostra grid de skeletons enquanto busca produtos

```jsx
{loading ? (
    <ProductGridSkeleton count={perPage} />
) : (
    <Content>{/* produtos */}</Content>
)}
```

### ProductCarousel (`src/pages/Home/Sections/ProductCarousel.jsx`)
- **Loading state:** Aguarda produtos da categoria
- **Componente:** `ProductCardSkeleton`
- **Comportamento:** Mostra 4 cards skeleton em grid

```jsx
{loading ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {Array.from({ length: 4 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
        ))}
    </div>
) : (
    <Swiper>{/* produtos */}</Swiper>
)}
```

### Categorys (`src/pages/Home/Sections/Categorys.jsx`)
- **Loading state:** Aguarda categorias carregar
- **Componente:** `CategorySkeleton`
- **Comportamento:** Mostra 7 categorias skeleton em grid

```jsx
{loading ? (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 16 }}>
        {Array.from({ length: 7 }).map((_, i) => (
            <CategorySkeleton key={i} />
        ))}
    </div>
) : (
    <Swiper>{/* categorias */}</Swiper>
)}
```

## Padrão de Implementação

### 1. Estado de Loading
Sempre controle o estado de loading com um estado booleano:

```jsx
const [loading, setLoading] = useState(true)
const [data, setData] = useState(null)
```

### 2. Fetch com Loading
Sempre defina loading antes e depois da requisição:

```jsx
useEffect(() => {
    let mounted = true
    
    async function load() {
        setLoading(true)
        try {
            const result = await fetchData()
            if (!mounted) return
            setData(result)
        } catch (error) {
            console.error(error)
        } finally {
            if (mounted) setLoading(false)
        }
    }
    
    load()
    return () => { mounted = false }
}, [])
```

### 3. Renderização Condicional
Use renderização condicional para mostrar skeleton ou conteúdo:

```jsx
if (loading) {
    return <SkeletonComponent />
}

if (!data) {
    return <EmptyState />
}

return <ContentComponent data={data} />
```

## Boas Práticas

### ✅ Fazer

1. **Sempre** mostrar um skeleton ou loader durante carregamento
2. **Sempre** usar `mounted` flag para evitar memory leaks
3. **Sempre** usar try/finally para garantir que loading seja desativado
4. **Usar** skeleton que corresponda visualmente ao conteúdo final
5. **Centralizar** loaders quando não houver conteúdo prévio
6. **Aguardar** todos os dados críticos antes de renderizar a página

### ❌ Evitar

1. **Não** mostrar conteúdo vazio enquanto carrega
2. **Não** usar apenas spinners sem contexto visual
3. **Não** esquecer de desativar loading em caso de erro
4. **Não** fazer múltiplos níveis de loading aninhados
5. **Não** mostrar flash of unstyled content (FOUC)

## Acessibilidade

- Todos os loaders têm `aria-hidden` ou labels apropriados
- Skeletons são decorativos e não interferem com leitores de tela
- Estados de loading são comunicados visualmente

## Performance

- Skeletons são leves e renderizam instantaneamente
- Animações usam `transform` para melhor performance
- Componentes são lazy-loaded quando possível
- Loading states evitam re-renders desnecessários

## Próximos Passos

- [ ] Implementar skeleton para páginas Admin
- [ ] Adicionar skeleton para Wishlist
- [ ] Implementar skeleton para Cart
- [ ] Criar variantes de skeleton (dark mode)
- [ ] Adicionar testes para componentes de loading
