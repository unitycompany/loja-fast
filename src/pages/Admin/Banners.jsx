import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { listBanners, upsertBanner, deleteBanner, listCategories } from '../../services/adminService'
import { resolveImageUrl, BANNERS_BUCKET } from '../../services/supabase'
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

const BannerTable = styled.table`
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

const PreviewCell = styled.div`
  width: 72px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--color--gray-5);
  background: #fafafa;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`

const InfoStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
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

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  background: rgba(208, 36, 40, 0.12);
  color: var(--color--primary);
  text-transform: capitalize;
`

const Destination = styled.div`
  font-size: 12px;
  color: var(--color--black-5);
`

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
`

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 999px;
  font-size: 11px;
  background: var(--color--white-2);
  border: 1px solid var(--color--gray-5);
  color: var(--color--black-2);
`

const CategoryPicker = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`

const CategoryChip = styled.button`
  border: 1px solid ${({ $active }) => ($active ? 'var(--color--primary)' : 'var(--color--gray-6)')};
  background: ${({ $active }) => ($active ? 'var(--color--primary)' : 'var(--color--white)')};
  color: ${({ $active }) => ($active ? '#fff' : 'var(--color--black-2)')};
  padding: 6px 10px;
  border-radius: 999px;
  font-size: 12px;
  cursor: pointer;
  transition: all 160ms ease;
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

const TYPE_OPTIONS = [
  { value: 'home', label: 'Home hero' },
  { value: 'disclosure', label: 'Divulgação' },
  { value: 'product', label: 'Produto' },
  { value: 'brand', label: 'Marca' }
]

const LAYOUT_OPTIONS = [
  { value: 'hero', label: 'Hero full width' },
  { value: 'split', label: 'Split (imagem + texto)' },
  { value: 'grid', label: 'Grid promocional' },
  { value: 'spotlight', label: 'Spotlight (cartão único)' }
]

const TONE_OPTIONS = [
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
  { value: 'contrast', label: 'Alto contraste' }
]

const createEmptyForm = () => ({
  id: null,
  type: 'home',
  alt: '',
  href: '',
  image: '',
  url_desktop: '',
  url_mobile: '',
  title: '',
  height: '',
  rota: '',
  meta: {
    layout: 'hero',
    tone: 'light',
    categories: []
  }
})

export default function Banners() {
  const [banners, setBanners] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(() => createEmptyForm())
  const [errors, setErrors] = useState({})
  const [previews, setPreviews] = useState({})
  const [formPreviewDesktop, setFormPreviewDesktop] = useState(null)
  const [formPreviewMobile, setFormPreviewMobile] = useState(null)
  const [categoryOptions, setCategoryOptions] = useState([])
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [formMode, setFormMode] = useState('idle')

  const clearFormFields = () => {
    setForm(createEmptyForm())
    setErrors({})
    setFormPreviewDesktop(null)
    setFormPreviewMobile(null)
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
      const confirmed = typeof window === 'undefined' ? true : window.confirm('Descartar o conteúdo atual e iniciar um novo banner?')
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
      const data = await listBanners()
      setBanners(data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar banners: ' + (error?.message || error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reload() }, [])

  useEffect(() => {
    async function loadCategories() {
      try {
        const records = await listCategories()
        const normalized = (records || [])
          .map((item) => ({
            value: item.slug || item.id,
            label: item.name || item.slug || item.id
          }))
          .filter((item) => item.value && item.label)
          .sort((a, b) => a.label.localeCompare(b.label))
        setCategoryOptions(normalized)
      } catch (error) {
        console.error(error)
      }
    }
    loadCategories()
  }, [])

  useEffect(() => {
    let mounted = true
    async function loadPreviews() {
      if (!banners.length) {
        setPreviews({})
        return
      }
      const map = {}
      await Promise.all(banners.map(async (banner) => {
        const source = banner.url_desktop || banner.image || banner.url_mobile
        if (!source) return
        try {
          map[banner.id] = await resolveImageUrl(source)
        } catch (error) {
          map[banner.id] = source
        }
      }))
      if (mounted) setPreviews(map)
    }
    loadPreviews()
    return () => { mounted = false }
  }, [banners])

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const updateMeta = (key, value) => {
    setForm(prev => ({
      ...prev,
      meta: {
        ...(prev.meta || {}),
        [key]: value
      }
    }))
  }

  const toggleCategory = (value) => {
    const current = new Set(form.meta?.categories || [])
    if (current.has(value)) current.delete(value)
    else current.add(value)
    updateMeta('categories', Array.from(current))
  }

  const bannerCount = useMemo(() => banners.length, [banners])

  const filteredBanners = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase()
    return (banners || []).filter((banner) => {
      const title = (banner.alt || banner.title || '').toLowerCase()
      const matchesSearch = !normalizedSearch || title.includes(normalizedSearch)
      const matchesType = typeFilter === 'all' || banner.type === typeFilter
      return matchesSearch && matchesType
    })
  }, [banners, search, typeFilter])

  const validate = () => {
    const next = {}
    if (!form.type) next.type = 'Escolha um tipo.'
    if (!form.alt) next.alt = 'Texto alternativo é obrigatório.'
    if (!form.url_desktop && !form.image) next.image = 'Envie ao menos uma imagem principal.'
    if (!form.href) next.href = 'Informe o link de destino.'
    if (form.height && !/^\d+(px|rem|vh|%)?$/i.test(form.height.trim()) && form.height.trim() !== 'auto') {
      next.height = 'Use números seguidos de px, rem, vh, % ou "auto".'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSave = async () => {
    if (!validate()) return
    try {
      const payload = {
        ...form,
        meta: {
          ...(form.meta || {}),
          categories: (form.meta?.categories || []).filter(Boolean),
          layout: form.meta?.layout || 'hero',
          tone: form.meta?.tone || 'light'
        }
      }
      await upsertBanner(payload)
      closeForm({ force: true })
      await reload()
      alert('Banner salvo com sucesso!')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar banner: ' + (error?.message || error))
    }
  }

  const handleEdit = (banner) => {
    setForm({
      ...createEmptyForm(),
      id: banner.id,
      type: banner.type || 'home',
      alt: banner.alt || banner.title || '',
      href: banner.href || '',
      image: banner.image || '',
      url_desktop: banner.url_desktop || '',
      url_mobile: banner.url_mobile || '',
      title: banner.title || '',
      height: banner.height || '',
      rota: banner.rota || '',
      meta: {
        ...createEmptyForm().meta,
        ...(banner.meta || {}),
        categories: Array.isArray(banner.meta?.categories) ? banner.meta.categories : []
      }
    })
    setFormMode('edit')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const handleRemove = async (id) => {
    if (typeof window !== 'undefined' && !window.confirm('Deseja remover este banner?')) return
    try {
      await deleteBanner(id)
      if (form.id === id) closeForm({ force: true })
      await reload()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover banner: ' + (error?.message || error))
    }
  }

  useEffect(() => {
    let ignore = false
    async function resolveDesktop() {
      const source = form.url_desktop || form.image
      if (!source) {
        setFormPreviewDesktop(null)
        return
      }
      try {
        const url = await resolveImageUrl(source)
        if (!ignore) setFormPreviewDesktop(url)
      } catch (error) {
        if (!ignore) setFormPreviewDesktop(source)
      }
    }
    resolveDesktop()
    return () => { ignore = true }
  }, [form.url_desktop, form.image])

  useEffect(() => {
    let ignore = false
    async function resolveMobile() {
      if (!form.url_mobile) {
        setFormPreviewMobile(null)
        return
      }
      try {
        const url = await resolveImageUrl(form.url_mobile)
        if (!ignore) setFormPreviewMobile(url)
      } catch (error) {
        if (!ignore) setFormPreviewMobile(form.url_mobile)
      }
    }
    resolveMobile()
    return () => { ignore = true }
  }, [form.url_mobile])

  const categoryLabelMap = useMemo(() => {
    const map = new Map()
    categoryOptions.forEach(option => map.set(option.value, option.label))
    return map
  }, [categoryOptions])

  const selectedCategories = form.meta?.categories || []
  const hasActiveForm = formMode !== 'idle'
  const showBannerList = !hasActiveForm
  const activeBannerId = hasActiveForm && form.id ? form.id : null

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <SectionBadge>Campanhas</SectionBadge>
          <h2>Vitrines e banners</h2>
        </SectionTitle>
        <SectionActions>
          <CounterPill>{bannerCount} banners</CounterPill>
          <SearchField>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M21 21l-4.35-4.35m1.02-4.15a6.5 6.5 0 11-13 0 6.5 6.5 0 0113 0z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por título ou tag"
            />
          </SearchField>
          {hasActiveForm ? (
            <SecondaryButton type="button" onClick={() => closeForm()}>
              Fechar painel
            </SecondaryButton>
          ) : null}
          <PrimaryButton type="button" onClick={startCreate}>
            {hasActiveForm ? 'Novo banner' : 'Cadastrar banner'}
          </PrimaryButton>
        </SectionActions>
      </SectionHeader>

      <Layout $hasForm={hasActiveForm} $hasList={showBannerList}>
        {hasActiveForm ? (
          <PanelStack>
            <FormSection
              title={formMode === 'edit' ? `Editar banner (${form.alt || form.title || 'Sem título'})` : 'Cadastrar banner'}
              description="Configure criativos para vitrines, destaques e páginas de produto."
              required
              collapsible={false}
            >
              <FieldRow label="Tipo" hint="Define onde o banner será exibido" error={errors.type} htmlFor="banner-type">
                <select id="banner-type" value={form.type} onChange={(event) => updateField('type', event.target.value)}>
                  {TYPE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Estilo" hint="Controle o layout onde o banner será renderizado" htmlFor="banner-layout">
                <select id="banner-layout" value={form.meta?.layout || 'hero'} onChange={(event) => updateMeta('layout', event.target.value)}>
                  {LAYOUT_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Tema" hint="Ajusta contraste e overlays automáticos" htmlFor="banner-tone">
                <select id="banner-tone" value={form.meta?.tone || 'light'} onChange={(event) => updateMeta('tone', event.target.value)}>
                  {TONE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Altura" hint="Use valores como 520px, 60vh ou auto" error={errors.height} htmlFor="banner-height">
                <input id="banner-height" type="text" value={form.height} onChange={(event) => updateField('height', event.target.value)} placeholder="520px" />
              </FieldRow>
              <FieldRow label="Título" hint="Usado em relatórios internos (opcional)" htmlFor="banner-title">
                <input id="banner-title" type="text" value={form.title} onChange={(event) => updateField('title', event.target.value)} placeholder="Campanha Steel Frame" />
              </FieldRow>
              <FieldRow label="Texto alternativo" hint="Descreve a imagem para acessibilidade" error={errors.alt} htmlFor="banner-alt">
                <input id="banner-alt" type="text" value={form.alt} onChange={(event) => updateField('alt', event.target.value)} placeholder="Linha Steel Frame em destaque" />
              </FieldRow>
              <FieldRow label="Link de destino" hint="URL completa ou slug da página" error={errors.href} htmlFor="banner-href">
                <input id="banner-href" type="text" value={form.href} onChange={(event) => updateField('href', event.target.value)} placeholder="/produtos/steel-frame" />
              </FieldRow>
              <FieldRow label="Categorias" hint="Selecione onde esse criativo deve aparecer">
                <CategoryPicker>
                  {categoryOptions.map(option => {
                    const active = selectedCategories.includes(option.value)
                    return (
                      <CategoryChip
                        key={option.value}
                        type="button"
                        $active={active}
                        onClick={() => toggleCategory(option.value)}
                      >
                        {option.label}
                      </CategoryChip>
                    )
                  })}
                  {categoryOptions.length === 0 ? <span style={{ fontSize: 13, color: 'var(--color--gray-4)' }}>Nenhuma categoria encontrada.</span> : null}
                </CategoryPicker>
                {selectedCategories.length ? (
                  <small style={{ fontSize: 12, color: 'var(--color--gray-3)' }}>
                    Vinculado a: {selectedCategories.map(value => categoryLabelMap.get(value) || value).join(', ')}
                  </small>
                ) : (
                  <small style={{ fontSize: 12, color: 'var(--color--gray-4)' }}>Sem vínculo — será tratado como banner global.</small>
                )}
              </FieldRow>
              <FieldRow label="Imagem desktop" hint="1920x600px recomendado" error={errors.image}>
                <MediaUploader
                  bucket={BANNERS_BUCKET}
                  value={form.url_desktop || form.image}
                  onChange={(path) => {
                    updateField('url_desktop', path)
                    if (!form.image) updateField('image', path)
                  }}
                  description="Formatos: JPG ou PNG até 1MB"
                  pathBuilder={(file) => `${form.type || 'banner'}/${Date.now()}_desktop_${file.name.replace(/[^a-z0-9.\-]/gi, '_')}`}
                />
              </FieldRow>
              <FieldRow label="Imagem mobile" hint="1080x1080px ou 1080x1350px" htmlFor="banner-mobile">
                <MediaUploader
                  bucket={BANNERS_BUCKET}
                  value={form.url_mobile}
                  onChange={(path) => updateField('url_mobile', path)}
                  description="Opcional — exibido em smartphones"
                  pathBuilder={(file) => `${form.type || 'banner'}/${Date.now()}_mobile_${file.name.replace(/[^a-z0-9.\-]/gi, '_')}`}
                />
              </FieldRow>
              <FieldRow label="Pré-visualização" hint="Imagens carregadas acima">
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {formPreviewDesktop ? (
                    <img src={formPreviewDesktop} alt="Preview desktop" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 12 }} />
                  ) : <span style={{ fontSize: 13, color: 'var(--color--gray-4)' }}>Envie uma imagem desktop para visualizar.</span>}
                  {formPreviewMobile ? (
                    <img src={formPreviewMobile} alt="Preview mobile" style={{ width: 220, height: 220, objectFit: 'cover', borderRadius: 12 }} />
                  ) : null}
                </div>
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
                {formMode === 'edit' ? 'Atualizar banner' : 'Salvar banner'}
              </PrimaryButton>
            </StickyActionBar>
          </PanelStack>
        ) : null}

        {showBannerList ? (
          <FormSection
            title={`Banners cadastrados (${bannerCount})`}
            description="Gerencie campanhas já publicadas."
            collapsible={false}
          >
            <FilterRow>
              <ChipGroup>
                <ChipButton type="button" $active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                  Todos
                </ChipButton>
                {TYPE_OPTIONS.map(option => (
                  <ChipButton
                    key={option.value}
                    type="button"
                    $active={typeFilter === option.value}
                    onClick={() => setTypeFilter(option.value)}
                  >
                    {option.label}
                  </ChipButton>
                ))}
              </ChipGroup>
            </FilterRow>

            {loading ? (
              <div style={{ padding: '12px 0' }}>Carregando...</div>
            ) : filteredBanners.length ? (
              <BannerTable>
                <thead>
                  <tr>
                    <th style={{ width: 96 }}>Preview</th>
                    <th>Informações</th>
                    <th style={{ width: 200 }}>Configuração</th>
                    <th style={{ width: 200 }}>Categorias</th>
                    <th style={{ width: 160 }}>Destino</th>
                    <th style={{ width: 140 }}>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredBanners.map((banner) => {
                    const meta = banner.meta || {}
                    const cats = Array.isArray(meta.categories) ? meta.categories : []
                    const previewUrl = previews[banner.id]
                    const isActive = activeBannerId && banner.id === activeBannerId
                    return (
                      <tr key={banner.id} data-active={isActive ? 'true' : undefined}>
                        <td>
                          <PreviewCell>
                            {previewUrl ? (
                              <img src={previewUrl} alt={banner.alt || banner.title || ''} />
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--color--gray-4)' }}>Sem preview</span>
                            )}
                          </PreviewCell>
                        </td>
                        <td>
                          <InfoStack>
                            <strong style={{ fontSize: 13 }}>{banner.alt || banner.title || TYPE_OPTIONS.find(option => option.value === banner.type)?.label || 'Banner'}</strong>
                            <TypeBadge>#{banner.type}</TypeBadge>
                          </InfoStack>
                        </td>
                        <td>
                          <TagList>
                            {meta.layout ? <Tag>Layout: {meta.layout}</Tag> : null}
                            {meta.tone ? <Tag>Tema: {meta.tone}</Tag> : null}
                            {banner.height ? <Tag>Altura: {banner.height}</Tag> : null}
                          </TagList>
                        </td>
                        <td>
                          <TagList>
                            {cats.length ? cats.map(value => (
                              <Tag key={value}>{categoryLabelMap.get(value) || value}</Tag>
                            )) : <Tag>Global</Tag>}
                          </TagList>
                        </td>
                        <td>
                          <Destination>{banner.href || '—'}</Destination>
                        </td>
                        <td>
                          <TableActions>
                            <TableActionButton type="button" onClick={() => handleEdit(banner)}>
                              Editar
                            </TableActionButton>
                            <TableActionButton type="button" onClick={() => handleRemove(banner.id)}>
                              Remover
                            </TableActionButton>
                          </TableActions>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </BannerTable>
            ) : (
              <div style={{ padding: '12px 0', fontSize: 14, color: 'var(--color--gray-4)' }}>
                Nenhum banner corresponde aos filtros atuais.
              </div>
            )}
          </FormSection>
        ) : null}
      </Layout>
    </Section>
  )
}
