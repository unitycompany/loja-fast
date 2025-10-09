import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import styled from 'styled-components'
import AdminGate from './AdminGate'
import Brands from './Brands'
import Banners from './Banners'
import Products from './Products'
import Categories from './Categories'
import { listBanners, listBrands, listCategories, listProducts } from '../../services/adminService'
import { ensureAdminSession } from '../../services/adminAuth'

const numberFormatter = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 })
const dateTimeFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' })

const Page = styled.div`
  position: relative;
  max-width: 1360px;
  margin: 0 auto;
  padding: 48px 32px 72px;
  display: flex;
  flex-direction: column;
  gap: 32px;

  @media (max-width: 960px) {
    padding: 32px 20px 56px;
  }
`

const Shell = styled.div`
  display: flex;
  gap: 28px;
  min-height: 70vh;

  @media (max-width: 1080px) {
    flex-direction: column;
  }
`

const Sidebar = styled.aside`
  width: 272px;
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.92) 0%, rgba(245, 245, 247, 0.98) 100%);
  border-radius: 24px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  padding: 28px 22px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  position: sticky;
  top: 32px;
  height: fit-content;

  @media (max-width: 1080px) {
    position: static;
    width: 100%;
  }
`

const SidebarHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h2 {
    margin: 0;
    font-size: 20px;
    font-weight: 700;
    color: var(--color--black-2);
  }

  span {
    font-size: 13px;
    color: var(--color--black-5);
  }
`

const SidebarNav = styled.nav`
  display: flex;
  flex-direction: column;
  gap: 10px;
`

const NavItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 16px;
  border: none;
  background: ${({ $active }) => ($active ? 'rgba(208, 36, 40, 0.12)' : 'transparent')};
  color: ${({ $active }) => ($active ? 'var(--color--primary)' : 'var(--color--black-3)')};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 160ms ease, transform 160ms ease, color 160ms ease;

  &:hover {
    background: ${({ $active }) => ($active ? 'rgba(208, 36, 40, 0.18)' : 'rgba(0,0,0,0.04)')};
    transform: translateY(-1px);
  }
`

const NavLabel = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;

  .icon {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: rgba(208, 36, 40, 0.12);
    color: var(--color--primary);
    font-size: 18px;
    font-weight: 600;
  }
`

const NavCount = styled.span`
  min-width: 36px;
  height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.06);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
  color: var(--color--black-4);

  ${({ $active }) => $active && `
    background: rgba(208, 36, 40, 0.18);
    color: var(--color--primary);
  `}
`

const SidebarFooter = styled.div`
  margin-top: auto;
  padding-top: 18px;
  border-top: 1px solid rgba(0, 0, 0, 0.06);
  font-size: 12px;
  color: var(--color--black-6);
  line-height: 1.5;
`

const Main = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const Header = styled.header`
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
`

const TitleGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  span {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: var(--color--black-5);
  }

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    color: var(--color--black-2);
  }

  p {
    margin: 0;
    font-size: 14px;
    color: var(--color--black-4);
    max-width: 560px;
  }
`

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  flex-wrap: wrap;
`

const Timestamp = styled.span`
  font-size: 13px;
  color: var(--color--black-5);
`

const RefreshButton = styled.button`
  padding: 10px 16px;
  border-radius: 12px;
  border: none;
  background: var(--color--primary);
  color: #fff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 160ms ease, filter 160ms ease;

  &:disabled {
    opacity: 0.7;
    cursor: default;
  }

  &:not(:disabled):hover {
    filter: brightness(0.95);
    transform: translateY(-1px);
  }
`

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 18px;
`

const StatCard = styled.article`
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 20px 22px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 30px 60px rgba(15, 23, 42, 0.08);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: -40% -40% auto auto;
    width: 160px;
    height: 160px;
    border-radius: 50%;
    opacity: 0.16;
    background: ${({ $tone }) => $tone === 'blue' ? 'var(--color--blue)' : $tone === 'green' ? 'var(--color--green)' : 'var(--color--primary)'};
    pointer-events: none;
  }
`

const StatIcon = styled.span`
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  color: ${({ $tone }) => $tone === 'blue' ? 'var(--color--blue)' : $tone === 'green' ? 'var(--color--green)' : 'var(--color--primary)'};
  background: ${({ $tone }) => $tone === 'blue' ? 'rgba(5, 87, 180, 0.12)' : $tone === 'green' ? 'rgba(64, 158, 13, 0.12)' : 'rgba(208, 36, 40, 0.12)'};
`

const StatContent = styled.div`
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;

  h3 {
    margin: 0;
    font-size: 14px;
    color: var(--color--black-5);
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  strong {
    font-size: 28px;
    color: var(--color--black-2);
    line-height: 1.1;
  }

  span {
    font-size: 13px;
    color: var(--color--black-5);
  }
`

const ContentArea = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`

const NAV_ITEMS = [
  {
    id: 'brands',
    label: 'Marcas',
    description: 'Organize parceiros, logotipos e paletas usadas no catálogo.',
    icon: '🏷️'
  },
  {
    id: 'banners',
    label: 'Banners',
    description: 'Gerencie vitrines, campanhas e destaques visuais do site.',
    icon: '🖼️'
  },
  {
    id: 'products',
    label: 'Produtos',
    description: 'Mantenha o portfólio atualizado com informações completas.',
    icon: '📦'
  },
  {
    id: 'categories',
    label: 'Categorias',
    description: 'Estruture o catálogo com hierarquias e landing pages.',
    icon: '🗂️'
  }
]

export default function Admin() {
  const [page, setPage] = useState('brands')
  const [stats, setStats] = useState({ brands: 0, banners: 0, products: 0, categories: 0 })
  const [loadingStats, setLoadingStats] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(null)
  const mounted = useRef(true)

  useEffect(() => () => { mounted.current = false }, [])

  const fetchStats = useCallback(async (options = {}) => {
    const { silent = false } = options
    if (!silent && mounted.current) {
      setLoadingStats(true)
    }
    if (mounted.current) {
      setRefreshing(true)
    }
    try {
      await ensureAdminSession()
      const [brandList, bannerList, productList, categoryList] = await Promise.all([
        listBrands(),
        listBanners(),
        listProducts({ limit: 400 }),
        listCategories()
      ])

      if (!mounted.current) return

      setStats({
        brands: brandList.length,
        banners: bannerList.length,
        products: productList.length,
        categories: categoryList.length
      })
      setLastUpdated(new Date())
    } catch (error) {
      if (mounted.current) {
        console.error('Falha ao carregar estatísticas administrativas.', error)
      }
    } finally {
      if (!mounted.current) return
      setLoadingStats(false)
      setRefreshing(false)
    }
  }, [])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const activeItem = useMemo(() => NAV_ITEMS.find(item => item.id === page) || NAV_ITEMS[0], [page])

  const navItems = useMemo(() => {
    return NAV_ITEMS.map(item => ({
      ...item,
      count: stats[item.id] ?? 0
    }))
  }, [stats])

  const statCards = useMemo(() => ([
    {
      id: 'brands',
      label: 'Marcas ativas',
      value: stats.brands,
      hint: 'Logotipos liberados no catálogo',
      icon: '🏷️',
      tone: 'blue'
    },
    {
      id: 'banners',
      label: 'Banners publicados',
      value: stats.banners,
      hint: 'Campanhas e vitrines ativas',
      icon: '🖼️',
      tone: 'primary'
    },
    {
      id: 'products',
      label: 'Produtos no catálogo',
      value: stats.products,
      hint: 'Inclui variações cadastradas',
      icon: '📦',
      tone: 'green'
    },
    {
      id: 'categories',
      label: 'Categorias estruturadas',
      value: stats.categories,
      hint: 'Bases e subcategorias organizadas',
      icon: '🗂️',
      tone: 'primary'
    }
  ]), [stats])

  const renderPage = () => {
    switch (page) {
      case 'brands':
        return <Brands />
      case 'banners':
        return <Banners />
      case 'products':
        return <Products />
      case 'categories':
        return <Categories />
      default:
        return <Brands />
    }
  }

  return (
    <AdminGate>
      <Page>
        <Shell>
          <Sidebar>
            <SidebarHeader>
              <h2>Painel administrativo</h2>
              <span>Gerencie catálogo, campanhas e navegação com uma interface unificada.</span>
            </SidebarHeader>
            <SidebarNav>
              {navItems.map(item => (
                <NavItem
                  key={item.id}
                  type="button"
                  $active={item.id === page}
                  onClick={() => setPage(item.id)}
                >
                  <NavLabel>
                    <span className="icon">{item.icon}</span>
                    {item.label}
                  </NavLabel>
                  <NavCount $active={item.id === page}>
                    {loadingStats ? '—' : numberFormatter.format(item.count)}
                  </NavCount>
                </NavItem>
              ))}
            </SidebarNav>
            <SidebarFooter>
              Dica: mantenha o catálogo alinhado às campanhas ativas e utilize os filtros das abas para localizar itens rapidamente.
            </SidebarFooter>
          </Sidebar>

          <Main>
            <Header>
              {/* <TitleGroup>
                <span>Admin • {activeItem.label}</span>
                <h1>{activeItem.label}</h1>
                <p>{activeItem.description}</p>
              </TitleGroup> */}
              {/* <HeaderActions>
                <Timestamp>
                  {lastUpdated ? `Atualizado ${dateTimeFormatter.format(lastUpdated)}` : 'Carregando indicadores...'}
                </Timestamp>
                <RefreshButton type="button" onClick={() => fetchStats({ silent: true })} disabled={refreshing}>
                  {refreshing ? 'Atualizando...' : 'Atualizar indicadores'}
                </RefreshButton>
              </HeaderActions> */}
            </Header>

            {/* <StatsGrid>
              {statCards.map(card => (
                <StatCard key={card.id} $tone={card.tone}>
                  <StatIcon $tone={card.tone}>{card.icon}</StatIcon>
                  <StatContent>
                    <h3>{card.label}</h3>
                    <strong>{loadingStats ? '—' : numberFormatter.format(card.value)}</strong>
                    <span>{card.hint}</span>
                  </StatContent>
                </StatCard>
              ))}
            </StatsGrid> */}

            <ContentArea>
              {renderPage()}
            </ContentArea>
          </Main>
        </Shell>
      </Page>
    </AdminGate>
  )
}
