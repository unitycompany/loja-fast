import React from 'react'
import styled from 'styled-components'
import Skeleton from './Skeleton'

// Skeleton para Card de Produto
const CardContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--color--gray-6);
  border-radius: 8px;
`

export function ProductCardSkeleton() {
  return (
    <CardContainer>
      <Skeleton height={200} style={{ borderRadius: '4px' }} />
      <Skeleton height={20} width="80%" />
      <Skeleton height={16} width="60%" />
      <Skeleton height={24} width="50%" style={{ marginTop: '8px' }} />
      <Skeleton height={40} style={{ marginTop: '8px', borderRadius: '4px' }} />
    </CardContainer>
  )
}

// Skeleton para Grid de Produtos
const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
  padding: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 12px;
    padding: 12px;
  }
`

export function ProductGridSkeleton({ count = 9 }) {
  return (
    <GridContainer>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </GridContainer>
  )
}

// Skeleton para Categoria
const CategoryContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px;
`

export function CategorySkeleton() {
  return (
    <CategoryContainer>
      <Skeleton height={80} width={80} style={{ borderRadius: '50%' }} />
      <Skeleton height={16} width={100} />
    </CategoryContainer>
  )
}

// Skeleton para Grid de Categorias
const CategoryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  width: 100%;
  padding: 20px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
    gap: 12px;
  }
`

export function CategoryGridSkeleton({ count = 8 }) {
  return (
    <CategoryGrid>
      {Array.from({ length: count }).map((_, i) => (
        <CategorySkeleton key={i} />
      ))}
    </CategoryGrid>
  )
}

// Skeleton para Banner
const BannerContainer = styled.div`
  width: 100%;
  aspect-ratio: 16/9;
  
  @media (max-width: 768px) {
    aspect-ratio: 4/3;
  }
`

export function BannerSkeleton() {
  return (
    <BannerContainer>
      <Skeleton height="100%" style={{ borderRadius: '4px' }} />
    </BannerContainer>
  )
}

// Skeleton para Carrossel de Produtos
const CarouselContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 20px;
  width: 100%;
`

const CarouselHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color--gray-6);
`

const CarouselGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
`

export function ProductCarouselSkeleton({ count = 4 }) {
  return (
    <CarouselContainer>
      <CarouselHeader>
        <Skeleton height={28} width={250} />
      </CarouselHeader>
      <CarouselGrid>
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </CarouselGrid>
    </CarouselContainer>
  )
}

// Skeleton para Detalhes do Produto
const ProductDetailContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  padding: 32px;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
    padding: 20px;
  }
`

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const InfoSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`

export function ProductDetailSkeleton() {
  return (
    <ProductDetailContainer>
      <ImageSection>
        <Skeleton height={400} style={{ borderRadius: '8px' }} />
        <div style={{ display: 'flex', gap: '12px' }}>
          <Skeleton height={80} width={80} style={{ borderRadius: '4px' }} />
          <Skeleton height={80} width={80} style={{ borderRadius: '4px' }} />
          <Skeleton height={80} width={80} style={{ borderRadius: '4px' }} />
          <Skeleton height={80} width={80} style={{ borderRadius: '4px' }} />
        </div>
      </ImageSection>
      <InfoSection>
        <Skeleton height={32} width="80%" />
        <Skeleton height={20} width="40%" />
        <Skeleton height={48} width="60%" />
        <Skeleton height={1} style={{ margin: '16px 0' }} />
        <Skeleton height={16} width="100%" />
        <Skeleton height={16} width="90%" />
        <Skeleton height={16} width="95%" />
        <Skeleton height={1} style={{ margin: '16px 0' }} />
        <Skeleton height={56} style={{ borderRadius: '4px' }} />
        <Skeleton height={48} style={{ borderRadius: '4px' }} />
      </InfoSection>
    </ProductDetailContainer>
  )
}

// Skeleton para Lista de Produtos (Admin)
const TableContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`

const TableRow = styled.div`
  display: flex;
  gap: 16px;
  padding: 16px;
  background: #fff;
  border: 1px solid var(--color--gray-6);
  align-items: center;
`

export function ProductTableSkeleton({ rows = 5 }) {
  return (
    <TableContainer>
      {Array.from({ length: rows }).map((_, i) => (
        <TableRow key={i}>
          <Skeleton height={60} width={60} style={{ borderRadius: '4px' }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <Skeleton height={18} width="70%" />
            <Skeleton height={14} width="40%" />
          </div>
          <Skeleton height={32} width={80} />
          <Skeleton height={32} width={100} />
        </TableRow>
      ))}
    </TableContainer>
  )
}
