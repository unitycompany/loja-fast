import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { listBrands, upsertBrand, deleteBrand } from '../../services/adminService'
import { resolveImageUrl, BRAND_LOGO_BUCKET } from '../../services/supabase'
import FormSection from './components/FormSection'
import FieldRow from './components/FieldRow'
import MediaUploader from './components/MediaUploader'
import {
  SectionHeader,
  SectionTitle,
  SectionBadge,
  SectionActions,
  PrimaryButton,
  SecondaryButton,
  SearchField,
  CounterPill,
  ChipGroup,
  ChipButton
} from './components/AdminUI'

const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
`

const PreviewCard = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border: 1px solid var(--color--gray-6);
  background: ${({ $color }) => ($color ? `${$color}12` : 'var(--color--white)')};

  img {
    width: 56px;
    height: 56px;
    object-fit: contain;
    background: #fff;
    border: 1px solid var(--color--gray-5);
    padding: 6px;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  strong {
    font-size: 16px;
    color: var(--color--black-2);
  }

  span {
    font-size: 13px;
    color: var(--color--gray-4);
  }
`

const Layout = styled.div`
  display: grid;
  grid-template-columns: ${({ $hasForm, $hasList }) => ($hasForm && $hasList ? 'minmax(0, 1.05fr) minmax(0, 1fr)' : '1fr')};
  gap: 16px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

const PanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-bottom: 24px;
`

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
  align-items: center;
`

const BrandTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border: 1px solid var(--color--gray-5);

  thead {
    background: rgba(208, 36, 40, 0.08);
  }

  th,
  td {
    padding: 10px 12px;
    text-align: left;
    font-size: 13px;
    border-bottom: 1px solid var(--color--gray-6);
  }

  th {
    font-weight: 600;
    color: var(--color--black-2);
  }

  tbody tr {
    transition: background 160ms ease;
  }

  tbody tr:hover {
    background: var(--color--white-2);
  }

  tbody tr[data-active='true'] {
    background: rgba(208, 36, 40, 0.12);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
`

const LogoCell = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color--gray-5);
  background: #fff;
  font-weight: 600;
  color: var(--color--primary);
  text-transform: uppercase;
  font-size: 16px;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 3px 8px;
  font-size: 11px;
  font-weight: 600;
  border: 1px solid ${({ $state }) => ($state === 'filled' ? 'var(--color--green)' : 'var(--color--gray-5)')};
  color: ${({ $state }) => ($state === 'filled' ? 'var(--color--green)' : 'var(--color--black-4)')};
  background: #fff;
  text-transform: uppercase;
  letter-spacing: 0.04em;
`

const TableActions = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
`

const TableActionButton = styled.button`
  padding: 7px 10px;
  border: 1px solid var(--color--gray-5);
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: var(--color--black-3);
  cursor: pointer;
`

const StickyActionBar = styled.div`
  position: sticky;
  bottom: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  background: #fff;
  border: 1px solid var(--color--gray-6);
  border-left: none;
  border-right: none;
  margin-top: 12px;
  z-index: 8;
  flex-wrap: wrap;
`

function slugify(value = '') {
  return value
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

const createEmptyBrand = () => ({
  id: null,
  companyName: '',
  slug: '',
  imageCompany: '',
  bgColor: '#0557B4',
  description: ''
})

export default function Brands() {
  const [brands, setBrands] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(() => createEmptyBrand())
  const [slugTouched, setSlugTouched] = useState(false)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [errors, setErrors] = useState({})
  const [brandImages, setBrandImages] = useState({})
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [formMode, setFormMode] = useState('idle')

  const clearFormFields = () => {
    setForm(createEmptyBrand())
    setSlugTouched(false)
    setPreviewUrl(null)
    setErrors({})
  }

  const closeForm = ({ force = false } = {}) => {
    if (!force && formMode !== 'idle') {
      const confirmed = typeof window === 'undefined' ? true : window.confirm('Descartar alterações atuais?')
      if (!confirmed) return false
    }
    clearFormFields()
    setFormMode('idle')
    return true
  }

  const startCreate = () => {
    if (formMode !== 'idle') {
      const confirmed = typeof window === 'undefined' ? true : window.confirm('Descartar o conteúdo atual e iniciar uma nova marca?')
      if (!confirmed) return
    }
    clearFormFields()
    setFormMode('create')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const reload = async () => {
    setLoading(true)
    try {
      const data = await listBrands()
      setBrands(data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar marcas: ' + (error?.message || error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    let ignore = false
    async function loadPreview() {
      if (!form.imageCompany) {
        setPreviewUrl(null)
        return
      }
      try {
        const url = await resolveImageUrl(form.imageCompany)
        if (!ignore) setPreviewUrl(url)
      } catch (error) {
        if (!ignore) setPreviewUrl(null)
      }
    }
    loadPreview()
    return () => { ignore = true }
  }, [form.imageCompany])

  const brandCount = useMemo(() => brands.length, [brands])
  const totalProducts = useMemo(() => {
    return brands.reduce((acc, brand) => acc + (brand.numberProducts || brand.number_products || 0), 0)
  }, [brands])

  useEffect(() => {
    let mounted = true
    async function loadBrandImages() {
      if (!brands.length) {
        setBrandImages({})
        return
      }
      const map = {}
      await Promise.all(brands.map(async (brand) => {
        try {
          map[brand.id] = await resolveImageUrl(brand.imageCompany || brand.logo)
        } catch (error) {
          map[brand.id] = brand.imageCompany || brand.logo || ''
        }
      }))
      if (mounted) setBrandImages(map)
    }
    loadBrandImages()
    return () => { mounted = false }
  }, [brands])

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const updateName = (value) => {
    setForm(prev => ({
      ...prev,
      companyName: value,
      slug: slugTouched ? prev.slug : slugify(value)
    }))
  }

  const validate = () => {
    const nextErrors = {}
    if (!form.companyName) nextErrors.companyName = 'Informe o nome da marca.'
    if (!form.slug) nextErrors.slug = 'Geramos o slug automaticamente, mas você pode ajustar aqui.'
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      await upsertBrand(form)
      closeForm({ force: true })
      await reload()
      alert('Marca salva com sucesso!')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar marca: ' + (error?.message || error))
    }
  }

  const handleEdit = (brand) => {
    setForm({
      id: brand.id || null,
      companyName: brand.companyName || '',
      slug: brand.slug || '',
      imageCompany: brand.imageCompany || brand.logo || '',
      bgColor: brand.bgColor || brand.meta?.bgColor || '#0557B4',
      description: brand.description || brand.meta?.description || ''
    })
    setSlugTouched(true)
    setFormMode('edit')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRemove = async (id) => {
    if (!confirm('Deseja remover esta marca permanentemente?')) return
    try {
      await deleteBrand(id)
      if (form.id === id) closeForm({ force: true })
      await reload()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover marca: ' + (error?.message || error))
    }
  }

  const filteredBrands = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return (brands || []).filter((brand) => {
      const name = (brand.companyName || brand.name || '').toLowerCase()
      const slug = (brand.slug || '').toLowerCase()
      const matchesSearch = !normalizedSearch || name.includes(normalizedSearch) || slug.includes(normalizedSearch)
      const count = Number(brand.numberProducts || brand.number_products || 0)
      const matchesFilter = filter === 'all' || (filter === 'with-products' && count > 0) || (filter === 'without-products' && count === 0)
      return matchesSearch && matchesFilter
    })
  }, [brands, search, filter])

  const hasActiveForm = formMode !== 'idle'
  const showBrandList = !hasActiveForm
  const activeBrandId = hasActiveForm && form.id ? form.id : null

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <SectionBadge>Catálogo</SectionBadge>
          <h2>Gestão de marcas</h2>
        </SectionTitle>
        <SectionActions>
          <CounterPill>{brandCount} marcas</CounterPill>
          <SearchField>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 21l-4.35-4.35m1.02-4.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nome ou slug"
            />
          </SearchField>
          {hasActiveForm ? (
            <SecondaryButton type="button" onClick={() => closeForm()}>
              Fechar painel
            </SecondaryButton>
          ) : null}
          <PrimaryButton
            type="button"
            onClick={startCreate}
          >
            {hasActiveForm ? 'Nova marca' : 'Adicionar marca'}
          </PrimaryButton>
        </SectionActions>
      </SectionHeader>

      <Layout $hasForm={hasActiveForm} $hasList={showBrandList}>
        {hasActiveForm ? (
          <PanelStack>
            <FormSection
              title={formMode === 'edit' ? `Editar marca (${form.companyName || form.slug})` : 'Cadastrar marca'}
              description="Preencha as informações essenciais. Os campos adicionais são opcionais, mas ajudam na apresentação."
              required
              collapsible={false}
            >
              <FieldRow label="Nome" hint="Como ela aparecerá para os usuários" error={errors.companyName} htmlFor="brand-name">
                <input
                  id="brand-name"
                  type="text"
                  value={form.companyName}
                  onChange={(event) => updateName(event.target.value)}
                  placeholder="Fast Sistemas"
                />
              </FieldRow>
              <FieldRow label="Slug" hint="Usado em URLs e integrações" error={errors.slug} htmlFor="brand-slug">
                <input
                  id="brand-slug"
                  type="text"
                  value={form.slug}
                  onChange={(event) => {
                    setSlugTouched(true)
                    updateField('slug', slugify(event.target.value))
                  }}
                  placeholder="fast-sistemas"
                />
              </FieldRow>
              <FieldRow label="Cor base" hint="Opcional — usada em destaques" htmlFor="brand-color">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <input
                    id="brand-color"
                    type="color"
                    value={form.bgColor || '#0557B4'}
                    onChange={(event) => updateField('bgColor', event.target.value)}
                    style={{ width: 52, height: 36, padding: 0 }}
                  />
                  <input
                    type="text"
                    value={form.bgColor || ''}
                    onChange={(event) => updateField('bgColor', event.target.value)}
                    placeholder="#0557B4"
                  />
                </div>
              </FieldRow>
              <FieldRow label="Descrição" hint="Texto curto para explicar a marca" htmlFor="brand-description">
                <textarea
                  id="brand-description"
                  value={form.description || ''}
                  onChange={(event) => updateField('description', event.target.value)}
                  placeholder="Conte um pouco sobre a marca, missão ou diferenciais."
                />
              </FieldRow>
              <FieldRow label="Logo" hint="Envie em PNG ou SVG com fundo transparente">
                <MediaUploader
                  bucket={BRAND_LOGO_BUCKET}
                  value={form.imageCompany}
                  onChange={(path) => updateField('imageCompany', path)}
                  description="Recomendado: 160x160px"
                  pathBuilder={(file) => {
                    const base = form.slug || slugify(form.companyName) || 'brand'
                    return `${base}/${Date.now()}_${file.name.replace(/[^a-z0-9.\-]/gi, '_')}`
                  }}
                />
              </FieldRow>
              <FieldRow label="Pré-visualização" hint="Veja como a marca aparecerá nas listagens">
                <PreviewCard $color={form.bgColor}>
                  {previewUrl ? (
                    <img src={previewUrl} alt={form.companyName || 'Logo'} />
                  ) : (
                    <div style={{ width: 56, height: 56, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#fff', border: '1px solid var(--color--gray-6)' }}>
                      {(form.companyName || 'B').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="details">
                    <strong>{form.companyName || 'Nome da marca'}</strong>
                    <span>Slug: {form.slug || '—'}</span>
                  </div>
                </PreviewCard>
              </FieldRow>
            </FormSection>

            <StickyActionBar>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <SecondaryButton type="button" onClick={() => closeForm()}>
                  Cancelar
                </SecondaryButton>
                {formMode === 'create' ? (
                  <SecondaryButton type="button" onClick={clearFormFields}>
                    Limpar campos
                  </SecondaryButton>
                ) : null}
              </div>
              <PrimaryButton type="button" onClick={handleSave}>
                {formMode === 'edit' ? 'Atualizar marca' : 'Salvar marca'}
              </PrimaryButton>
            </StickyActionBar>
          </PanelStack>
        ) : null}

        {showBrandList ? (
          <FormSection
            title={`Marcas cadastradas (${brandCount})`}
            description="Gerencie, edite ou remova marcas existentes."
            collapsible={false}
          >
            <FilterRow>
              <ChipGroup>
                <ChipButton type="button" $active={filter === 'all'} onClick={() => setFilter('all')}>
                  Todas
                </ChipButton>
                <ChipButton type="button" $active={filter === 'with-products'} onClick={() => setFilter('with-products')}>
                  Com produtos
                </ChipButton>
                <ChipButton type="button" $active={filter === 'without-products'} onClick={() => setFilter('without-products')}>
                  Sem produtos
                </ChipButton>
              </ChipGroup>
            </FilterRow>

            {loading ? (
              <div style={{ padding: '12px 0' }}>Carregando...</div>
            ) : filteredBrands.length ? (
              <BrandTable>
                <thead>
                  <tr>
                    <th style={{ width: 64 }}>Logo</th>
                    <th>Marca</th>
                    <th style={{ width: 160 }}>Slug</th>
                    <th style={{ width: 160 }}>Produtos</th>
                    <th style={{ width: 160 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBrands.map((brand) => {
                    const count = brand.numberProducts || brand.number_products || 0
                    const logo = brandImages[brand.id]
                    const isActive = activeBrandId && brand.id === activeBrandId
                    return (
                      <tr key={brand.id} data-active={isActive ? 'true' : undefined}>
                        <td>
                          <LogoCell>
                            {logo ? <img src={logo} alt={brand.companyName || brand.slug || 'Logo'} /> : (brand.companyName || 'B').charAt(0).toUpperCase()}
                          </LogoCell>
                        </td>
                        <td>
                          <strong style={{ display: 'block', fontSize: 13 }}>{brand.companyName || '—'}</strong>
                          <span style={{ fontSize: 11, color: 'var(--color--gray-3)' }}>{brand.meta?.description || brand.description || 'Sem descrição'}</span>
                        </td>
                        <td>{brand.slug || '—'}</td>
                        <td>
                          <StatusBadge $state={count > 0 ? 'filled' : 'empty'}>
                            {count > 0 ? `${count} produto${count === 1 ? '' : 's'}` : 'Sem produtos'}
                          </StatusBadge>
                        </td>
                        <td>
                          <TableActions>
                            <TableActionButton type="button" onClick={() => handleEdit(brand)}>
                              Editar
                            </TableActionButton>
                            <TableActionButton type="button" onClick={() => handleRemove(brand.id)}>
                              Remover
                            </TableActionButton>
                          </TableActions>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </BrandTable>
            ) : (
              <div style={{ padding: '12px 0', fontSize: 14, color: 'var(--color--gray-4)' }}>
                Nenhuma marca corresponde aos filtros atuais.
              </div>
            )}
          </FormSection>
        ) : null}
      </Layout>
    </Section>
  )
}

