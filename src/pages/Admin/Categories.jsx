import { useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { listCategories, upsertCategory, deleteCategory, listProducts } from '../../services/adminService'
import { ensureAdminSession } from '../../services/adminAuth'
import { resolveImageUrl, CATEGORY_IMAGES_BUCKET } from '../../services/supabase'
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
  gap: 20px;
`

const Layout = styled.div`
  display: grid;
  grid-template-columns: ${({ $hasForm, $hasList }) => ($hasForm && $hasList ? 'minmax(0, 1.05fr) minmax(0, 1fr)' : '1fr')};
  gap: 20px;

  @media (max-width: 1100px) {
    grid-template-columns: 1fr;
  }
`

const PanelStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-bottom: 24px;
`

const FilterRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`

const CategoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: var(--color--white);
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid var(--color--gray-5);
  box-shadow: var(--shadow-sm);

  thead {
    background: rgba(208, 36, 40, 0.08);
  }

  th,
  td {
    padding: 10px 14px;
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

  tbody tr[data-active='true'] td:first-child {
    position: relative;
  }

  tbody tr[data-active='true'] td:first-child::before {
    content: '';
    position: absolute;
    inset: 6px auto 6px 0;
    width: 4px;
    border-radius: 999px;
    background: var(--color--primary);
  }

  tbody tr:last-child td {
    border-bottom: none;
  }
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

const SubcategoryTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--color--gray-6);
  border-radius: 12px;
  overflow: hidden;

  th,
  td {
    padding: 8px 10px;
    font-size: 12px;
    border-bottom: 1px solid var(--color--gray-6);
  }

  th {
    background: var(--color--white-2);
    text-align: left;
    font-weight: 600;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  input {
    width: 100%;
    padding: 8px;
    border-radius: 6px;
    border: 1px solid var(--color--gray-6);
    font-size: 12px;
  }

`

const InlineActions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
`

const InlineActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 10px;
  border: 1px solid var(--color--gray-5);
  background: #fff;
  font-size: 12px;
  font-weight: 600;
  color: var(--color--black-3);
  cursor: pointer;
  transition: background 160ms ease, border-color 160ms ease, transform 160ms ease;

  &:hover {
    background: var(--color--white-2);
    border-color: var(--color--primary);
    transform: translateY(-1px);
  }
`

const AddChildButton = styled(SecondaryButton)`
  align-self: flex-start;
  padding: 8px 14px;
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

const HtmlEditorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
`

const HtmlPreviewCard = styled.div`
  border: 1px solid var(--color--gray-5);
  border-radius: 10px;
  background: var(--color--white-2);
  padding: 12px;
  display: flex;
  flex-direction: column;
  min-height: 120px;
  overflow: auto;

  h4 {
    margin: 0 0 8px;
    font-size: 13px;
    font-weight: 600;
    color: var(--color--black-2);
  }

  .preview-surface {
    flex: 1;
    font-size: 13px;
    color: var(--color--black-2);
    line-height: 1.5;
  }
`

const createEmptyCategory = () => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  image: '',
  icon: '',
  wishlist: true,
  numberProducts: 0,
  parent: '',
  children: []
})

const createEmptyChild = (parentSlug = '') => ({
  id: '',
  name: '',
  slug: '',
  description: '',
  parent: parentSlug
})

function slugify(text = '') {
  return text
    .normalize('NFD').replace(/[^\p{Letter}\p{Number}\s-]/gu, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase()
}

function normalizeCategory(record) {
  const base = createEmptyCategory()
  return {
    ...base,
    ...record,
    id: record.id || record.slug || base.id,
    slug: record.slug || record.id || base.slug,
    name: record.name || base.name,
    description: record.description || base.description,
    image: record.image || base.image,
    icon: record.icon || base.icon,
    wishlist: true,
    numberProducts: record.numberProducts ?? record.number_products ?? base.numberProducts,
    parent: record.parent || base.parent,
    children: Array.isArray(record.children) ? record.children.map(child => ({
      ...createEmptyChild(record.slug || record.id),
      ...child,
      parent: child.parent || record.slug || record.id
    })) : []
  }
}

export default function Categories() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState(() => createEmptyCategory())
  const [rawJson, setRawJson] = useState('')
  const [errors, setErrors] = useState({})
  const [formMode, setFormMode] = useState('idle')
  const [search, setSearch] = useState('')
  const [structureFilter, setStructureFilter] = useState('all')
  const [previewMap, setPreviewMap] = useState({})
  const [productStats, setProductStats] = useState({ categories: {}, subcategories: {}, total: 0 })

  const reload = async () => {
    setLoading(true)
    try {
      const data = await listCategories()
      setItems(data)
    } catch (error) {
      console.error(error)
      alert('Erro ao carregar categorias: ' + (error?.message || error))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let ignore = false
    async function bootstrap() {
      try {
        await ensureAdminSession()
      } catch (error) {
        console.error('Falha ao autenticar sessão admin (categorias).', error)
      }
      if (!ignore) {
        reload()
      }
    }
    bootstrap()
    return () => { ignore = true }
  }, [])

  useEffect(() => {
    let ignore = false
    async function loadPreviews() {
      if (!items.length) {
        setPreviewMap({})
        return
      }
      const map = {}
      await Promise.all(items.map(async (item) => {
        if (!item.image) return
        try {
          map[item.id] = await resolveImageUrl(item.image)
        } catch (error) {
          map[item.id] = item.image
        }
      }))
      if (!ignore) setPreviewMap(map)
    }
    loadPreviews()
    return () => { ignore = true }
  }, [items])

  useEffect(() => {
    let ignore = false

    async function loadProductStats() {
      try {
        const products = await listProducts({ limit: 1000 })
        const categoryTotals = {}
        const subcategoryTotals = {}

        const increment = (target, key) => {
          if (!key) return
          target[key] = (target[key] || 0) + 1
        }

        products.forEach(product => {
          const pathArray = Array.isArray(product.category_path) ? product.category_path : Array.isArray(product.categoryPath) ? product.categoryPath : []
          const baseCategory = product.category || pathArray[0] || null
          const subcategory = product.subcategory || pathArray[pathArray.length - 1] || null

          if (baseCategory) increment(categoryTotals, baseCategory)
          if (baseCategory && subcategory) increment(subcategoryTotals, `${baseCategory}::${subcategory}`)
        })

        if (!ignore) {
          setProductStats({
            categories: categoryTotals,
            subcategories: subcategoryTotals,
            total: products.length
          })
        }
      } catch (error) {
        console.error('Erro ao carregar estatísticas de produtos', error)
      }
    }

    loadProductStats()
    return () => { ignore = true }
  }, [])

  const updateField = (key, value) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleNameChange = (value) => {
    setForm(prev => {
      const next = { ...prev, name: value }
      const auto = slugify(value)
      const previousAuto = slugify(prev.name || '')
      if ((!prev.id || prev.id === previousAuto) && (!prev.slug || prev.slug === previousAuto)) {
        next.slug = auto
        next.id = auto
      }
      return next
    })
  }

  const updateChild = (index, key, value) => {
    setForm(prev => {
      const nextChildren = Array.isArray(prev.children) ? [...prev.children] : []
      nextChildren[index] = { ...(nextChildren[index] || createEmptyChild(prev.slug)), [key]: value }
      if (key === 'name' && (!nextChildren[index].slug || nextChildren[index].slug === slugify(nextChildren[index].name || ''))) {
        nextChildren[index].slug = slugify(value)
      }
      if (!nextChildren[index].parent) {
        nextChildren[index].parent = prev.slug || prev.id || ''
      }
      return { ...prev, children: nextChildren }
    })
  }

  const addChild = () => {
    setForm(prev => ({
      ...prev,
      children: [...(prev.children || []), createEmptyChild(prev.slug || prev.id)]
    }))
  }

  const removeChild = (index) => {
    setForm(prev => {
      const nextChildren = Array.isArray(prev.children) ? [...prev.children] : []
      nextChildren.splice(index, 1)
      return { ...prev, children: nextChildren }
    })
  }

  const clearFormFields = () => {
    setForm(createEmptyCategory())
    setRawJson('')
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
      const confirmed = typeof window === 'undefined' ? true : window.confirm('Descartar o conteúdo atual e iniciar nova categoria?')
      if (!confirmed) return
    }
    clearFormFields()
    setFormMode('create')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const validate = () => {
    const next = {}
    if (!form.name) next.name = 'Informe o nome da categoria.'
    if (!form.slug) next.slug = 'Informe um slug (ID).' 
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const buildPayload = () => {
    const recordId = (form.slug || form.id || '').trim()
    if (!recordId) return null

    const children = (form.children || [])
      .map(child => ({
        ...child,
        id: child.slug || child.id || slugify(child.name || ''),
        slug: slugify(child.slug || child.id || child.name || ''),
        parent: child.parent || recordId,
        name: child.name,
        description: child.description || ''
      }))
      .filter(child => child.name && child.slug)

    const data = {
      name: form.name,
      slug: recordId,
      description: form.description || '',
      image: form.image || '',
      icon: form.icon || '',
      wishlist: true,
      numberProducts: Number.isFinite(Number(form.numberProducts)) ? Number(form.numberProducts) : 0,
      parent: form.parent || null,
      children
    }

    return { id: recordId, data }
  }

  const save = async () => {
    if (!validate()) return
    try {
      let payload = buildPayload()

      if (rawJson && rawJson.trim()) {
        try {
          const parsed = JSON.parse(rawJson)
          const recordId = parsed.slug || parsed.id
          payload = { id: recordId, data: parsed }
        } catch (error) {
          if (!confirm('JSON inválido. Deseja salvar somente os dados do formulário?')) return
        }
      }

      if (!payload) {
        alert('Preencha ao menos o slug.')
        return
      }

      await upsertCategory(payload)
      closeForm({ force: true })
      await reload()
      alert('Categoria salva com sucesso!')
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar categoria: ' + (error?.message || error))
    }
  }

  const remove = async (id) => {
    if (!confirm('Remover categoria?')) return
    try {
      await deleteCategory(id)
      if (form.id === id || form.slug === id) closeForm({ force: true })
      await reload()
    } catch (error) {
      console.error(error)
      alert('Erro ao remover categoria: ' + (error?.message || error))
    }
  }

  const handleEdit = (record) => {
    const normalized = normalizeCategory(record)
    setForm(normalized)
    setRawJson(JSON.stringify(normalized, null, 2))
    setErrors({})
    setFormMode('edit')
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const parentOptions = useMemo(() => {
    return items
      .filter(item => item.id !== form.id && item.slug !== form.slug)
      .map(item => ({ value: item.slug || item.id, label: item.name || item.slug }))
      .sort((a, b) => a.label.localeCompare(b.label))
  }, [items, form.id, form.slug])

  const filteredItems = useMemo(() => {
    const term = search.trim().toLowerCase()
    return items.filter(item => {
      const matchesSearch = term
        ? (item.name || '').toLowerCase().includes(term) || (item.slug || '').toLowerCase().includes(term)
        : true
      const matchesStructure = structureFilter === 'all'
        ? true
        : structureFilter === 'root'
          ? !item.parent
          : !!item.parent
      return matchesSearch && matchesStructure
    })
  }, [items, search, structureFilter])

  const catalogMetrics = useMemo(() => {
    let root = 0
    let nested = 0
    let totalSubcategories = 0
    items.forEach(item => {
      if (item.parent) nested += 1
      else root += 1
      if (Array.isArray(item.children)) {
        totalSubcategories += item.children.length
      }
    })
    return {
      totalCategories: items.length,
      rootCategories: root,
      nestedCategories: nested,
      totalSubcategories
    }
  }, [items])

  const hasActiveForm = formMode !== 'idle'
  const showCategoryList = !hasActiveForm
  const activeCategoryId = hasActiveForm ? (form.slug || form.id || '').toString() : ''
  const dynamicCountForActive = activeCategoryId ? (productStats.categories?.[activeCategoryId] ?? 0) : 0

  return (
    <Section>
      <SectionHeader>
        <SectionTitle>
          <SectionBadge>Arquitetura</SectionBadge>
          <h2>Gestão de categorias</h2>
        </SectionTitle>
        <SectionActions>
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
          <SecondaryButton type="button" onClick={reload} disabled={loading}>
            {loading ? 'Atualizando...' : 'Atualizar lista'}
          </SecondaryButton>
          {hasActiveForm ? (
            <SecondaryButton type="button" onClick={() => closeForm()}>
              Fechar painel
            </SecondaryButton>
          ) : null}
          <PrimaryButton
            type="button"
            onClick={startCreate}
          >
            {hasActiveForm ? 'Nova categoria' : 'Adicionar categoria'}
          </PrimaryButton>
        </SectionActions>
      </SectionHeader>

      {showCategoryList ? (
        <FilterRow>
          <ChipGroup>
            <ChipButton type="button" $active={structureFilter === 'all'} onClick={() => setStructureFilter('all')}>
              Todas
            </ChipButton>
            <ChipButton type="button" $active={structureFilter === 'root'} onClick={() => setStructureFilter('root')}>
              Nível raiz ({catalogMetrics.rootCategories})
            </ChipButton>
            <ChipButton type="button" $active={structureFilter === 'child'} onClick={() => setStructureFilter('child')}>
              Com pai ({catalogMetrics.nestedCategories})
            </ChipButton>
          </ChipGroup>
          <CounterPill>{catalogMetrics.totalSubcategories} subcategorias únicas</CounterPill>
        </FilterRow>
      ) : null}

      <Layout $hasForm={hasActiveForm} $hasList={showCategoryList}>
        {hasActiveForm ? (
          <PanelStack>
            <FormSection
              title={form.id ? `Editar categoria (${form.name || form.slug})` : 'Cadastrar categoria'}
              description="Controle imagem, slug e subcategorias."
              required
              collapsible={false}
            >
              <FieldRow label="Nome" hint="Visível para os clientes" error={errors.name} htmlFor="category-name">
                <input id="category-name" type="text" value={form.name} onChange={(event) => handleNameChange(event.target.value)} placeholder="Drywall" />
              </FieldRow>
              <FieldRow label="Slug / ID" hint="Usado nas URLs" error={errors.slug} htmlFor="category-slug">
                <input id="category-slug" type="text" value={form.slug} onChange={(event) => updateField('slug', slugify(event.target.value))} placeholder="drywall" />
              </FieldRow>
              <FieldRow label="Categoria pai" hint="Opcional — deixa vazio para categoria principal">
                <select value={form.parent || ''} onChange={(event) => updateField('parent', event.target.value || '')}>
                  <option value="">Nenhuma (nível raiz)</option>
                  {parentOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </FieldRow>
              <FieldRow label="Descrição (HTML)" hint="Você vê o código e o resultado ao lado" htmlFor="category-description">
                <HtmlEditorGrid>
                  <textarea
                    id="category-description"
                    value={form.description}
                    onChange={(event) => updateField('description', event.target.value)}
                    placeholder="<p>Placas, perfis, fixações...</p>"
                    style={{ minHeight: 140 }}
                  />
                  <HtmlPreviewCard>
                    <h4>Prévia</h4>
                    <div className="preview-surface" dangerouslySetInnerHTML={{ __html: form.description || '<p style="color: var(--color--gray-4);">Nenhum conteúdo HTML ainda.</p>' }} />
                  </HtmlPreviewCard>
                </HtmlEditorGrid>
              </FieldRow>
              <FieldRow label="Imagem destaque" hint="Use 1440x600px" htmlFor="category-image">
                <MediaUploader
                  bucket={CATEGORY_IMAGES_BUCKET}
                  value={form.image}
                  onChange={(path) => updateField('image', path)}
                  description="Envie um visual para o topo da categoria"
                  pathBuilder={(file) => `${(form.slug || 'categoria').replace(/[^a-z0-9\-]/gi, '_')}/${Date.now()}_${file.name.replace(/[^a-z0-9.\-]/gi, '_')}`}
                />
              </FieldRow>
              <FieldRow label="Ícone" hint="Nome do componente ou emoji" htmlFor="category-icon">
                <input id="category-icon" type="text" value={form.icon} onChange={(event) => updateField('icon', event.target.value)} placeholder="DrywallIcon" />
              </FieldRow>
              <FieldRow
                label="Produtos estimados"
                hint={`Manual. Contagem dinâmica atual: ${dynamicCountForActive}`}
                htmlFor="category-products"
              >
                <input id="category-products" type="number" value={form.numberProducts ?? 0} onChange={(event) => updateField('numberProducts', Number(event.target.value))} />
                <span style={{ fontSize: 12, color: 'var(--color--black-6)' }}>
                  Contagem automática com base nos produtos: <strong>{dynamicCountForActive}</strong>
                </span>
              </FieldRow>
              <FieldRow label="Wishlist" hint="Categorias ficam disponíveis para favoritos">
                <div style={{ padding: '9px 12px', borderRadius: 8, border: '1px dashed var(--color--gray-5)', background: 'var(--color--white-2)', fontSize: 13 }}>
                  Sempre habilitada para clientes.
                </div>
              </FieldRow>
              <FieldRow label="Subcategorias" hint="Organize o menu interno">
                <SubcategoryTable>
                  <thead>
                    <tr>
                      <th style={{ width: '28%' }}>Nome</th>
                      <th style={{ width: '24%' }}>Slug</th>
                      <th>Descrição</th>
                      <th style={{ width: 90 }}>Produtos (din.)</th>
                      <th style={{ width: 80 }}></th>
                    </tr>
                  </thead>
                  <tbody>
                    {(form.children || []).map((child, index) => {
                      const childSlug = (child.slug || child.id || '').toString()
                      const childKey = activeCategoryId && childSlug ? `${activeCategoryId}::${childSlug}` : null
                      const dynamicChildCount = childKey ? (productStats.subcategories?.[childKey] ?? 0) : 0
                      return (
                        <tr key={index}>
                          <td><input type="text" value={child.name || ''} onChange={(event) => updateChild(index, 'name', event.target.value)} placeholder="Placas" /></td>
                          <td><input type="text" value={child.slug || ''} onChange={(event) => updateChild(index, 'slug', slugify(event.target.value))} placeholder="placas-drywall" /></td>
                          <td><input type="text" value={child.description || ''} onChange={(event) => updateChild(index, 'description', event.target.value)} placeholder="Resumo" /></td>
                          <td style={{ textAlign: 'center', fontWeight: 600 }}>
                            {dynamicChildCount}
                            <div style={{ fontSize: 11, color: 'var(--color--black-6)' }}>Manual: {child.numberProducts ?? 0}</div>
                          </td>
                          <td style={{ textAlign: 'right' }}>
                            <InlineActionButton type="button" onClick={() => removeChild(index)}>Remover</InlineActionButton>
                          </td>
                        </tr>
                      )
                    })}
                    {(form.children || []).length === 0 ? (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', color: 'var(--color--gray-4)', fontSize: 12, padding: '16px 0' }}>
                          Nenhuma subcategoria cadastrada.
                        </td>
                      </tr>
                    ) : null}
                  </tbody>
                </SubcategoryTable>
                <AddChildButton type="button" onClick={addChild}>
                  + Adicionar subcategoria
                </AddChildButton>
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
              <PrimaryButton type="button" onClick={save}>
                {formMode === 'edit' ? 'Atualizar categoria' : 'Salvar categoria'}
              </PrimaryButton>
            </StickyActionBar>

            <FormSection
              title="Editor avançado (JSON)"
              description="Cole toda a estrutura para importações em massa."
              defaultOpen={false}
            >
              <FieldRow label="Estrutura" hint="Se preenchido, substitui os campos acima">
                <textarea rows={10} style={{ width: '100%', fontFamily: 'monospace' }} value={rawJson} onChange={(event) => setRawJson(event.target.value)} />
                <InlineActions>
                  <InlineActionButton
                    type="button"
                    onClick={() => {
                      try {
                        const parsed = JSON.parse(rawJson || '{}')
                        setForm(normalizeCategory(parsed))
                        alert('JSON aplicado ao formulário principal!')
                      } catch (error) {
                        alert('JSON inválido: ' + (error?.message || error))
                      }
                    }}
                  >
                    Aplicar ao formulário
                  </InlineActionButton>
                  <InlineActionButton
                    type="button"
                    onClick={() => {
                      try {
                        JSON.parse(rawJson || '{}')
                        alert('JSON válido!')
                      } catch (error) {
                        alert('JSON inválido: ' + (error?.message || error))
                      }
                    }}
                  >
                    Validar JSON
                  </InlineActionButton>
                  <InlineActionButton
                    type="button"
                    onClick={() => setRawJson(JSON.stringify(buildPayload()?.data || {}, null, 2))}
                  >
                    Exportar do formulário
                  </InlineActionButton>
                </InlineActions>
              </FieldRow>
            </FormSection>
          </PanelStack>
        ) : null}

        {showCategoryList ? (
          <FormSection
            title={`Categorias cadastradas (${items.length})`}
            description="Visualize e gerencie as categorias existentes."
            collapsible={false}
          >
            {loading ? (
              <div style={{ padding: '12px 0' }}>Carregando...</div>
            ) : filteredItems.length ? (
              <CategoryTable>
            <thead>
              <tr>
                <th style={{ width: 70 }}>Thumb</th>
                <th style={{ width: '30%' }}>Categoria</th>
                <th>Slug</th>
                <th style={{ width: 110 }}>Produtos (din.)</th>
                <th style={{ width: 120 }}>Subcategorias</th>
                <th style={{ width: 110 }}>Wishlist</th>
                <th style={{ width: 140 }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(category => {
                const rowId = (category.slug || category.id || '').toString()
                const isActive = activeCategoryId && rowId && activeCategoryId === rowId
                const dynamicCount = productStats.categories?.[rowId] ?? 0
                const manualCount = category.numberProducts ?? 0
                return (
                  <tr key={category.id || category.slug} data-active={isActive ? 'true' : undefined}>
                    <td>
                      {previewMap[category.id] ? (
                        <img src={previewMap[category.id]} alt={category.name} style={{ width: 48, height: 36, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <span style={{ fontSize: 11, color: 'var(--color--gray-4)' }}>—</span>
                      )}
                    </td>
                    <td>
                      <strong style={{ display: 'block', fontSize: 13 }}>{category.name}</strong>
                      <span style={{ fontSize: 11, color: 'var(--color--gray-3)' }}>{category.parent ? `Filha de ${category.parent}` : 'Nível raiz'}</span>
                    </td>
                    <td>{category.slug}</td>
                    <td style={{ fontWeight: 600 }}>
                      {dynamicCount}
                      <div style={{ fontSize: 11, color: 'var(--color--black-6)' }}>Manual: {manualCount}</div>
                    </td>
                    <td>{Array.isArray(category.children) && category.children.length ? `${category.children.length} itens` : '—'}</td>
                    <td>{category.wishlist !== false ? 'Ativa' : 'Desativada'}</td>
                    <td>
                      <TableActions>
                        <TableActionButton type="button" onClick={() => handleEdit(category)}>Editar</TableActionButton>
                        <TableActionButton type="button" onClick={() => remove(category.id)}>Remover</TableActionButton>
                      </TableActions>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </CategoryTable>
        ) : (
          <div style={{ padding: '12px 0', fontSize: 14, color: 'var(--color--gray-4)' }}>Nenhuma categoria encontrada.</div>
        )}
        </FormSection>
        ) : null}
      </Layout>
    </Section>
  )
}
