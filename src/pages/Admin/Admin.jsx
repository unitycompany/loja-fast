import { useState, useEffect } from 'react'
import styled from 'styled-components'
import AdminGate from './AdminGate'
import {
  listBrands, upsertBrand, deleteBrand,
  listBanners, upsertBanner, deleteBanner,
  listProducts, deleteProduct,
  listCategories, upsertCategory, deleteCategory
} from '../../services/adminService'

import { resolveImageUrl } from '../../services/supabase'

const Container = styled.div`
  max-width: 1200px;
  margin: 80px auto 40px;
  padding: 20px;
`

const Section = styled.section`
  background: var(--color--white);
  padding: 12px;
  margin-bottom: 20px;
  box-shadow: var(--border-full);
`

export default function Admin() {
  const [brands, setBrands] = useState([])
  const [banners, setBanners] = useState([])
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(false)

  async function reloadAll() {
    setLoading(true)
    try {
      const [br, ba, pr, ca] = await Promise.all([listBrands(), listBanners(), listProducts({ limit: 200 }), listCategories()])
      setBrands(br)
      setBanners(ba)
      setProducts(pr)
      setCategories(ca)
    } catch (e) {
      console.error(e)
      alert('Erro ao carregar dados: ' + (e.message || e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { reloadAll() }, [])

  const [brandImages, setBrandImages] = useState({})
  const [bannerImages, setBannerImages] = useState({})
  const [productImages, setProductImages] = useState({})

  useEffect(() => {
    let mounted = true
    async function load() {
      const bmap = {}
      await Promise.all((brands || []).map(async (b) => {
        try { bmap[b.id] = await resolveImageUrl(b.imageCompany) } catch (e) { bmap[b.id] = b.imageCompany }
      }))
      const banmap = {}
      await Promise.all((banners || []).map(async (bn, idx) => {
        try { banmap[bn.id || idx] = await resolveImageUrl(bn.image) } catch (e) { banmap[bn.id || idx] = bn.image }
      }))
      const pmap = {}
      await Promise.all((products || []).map(async (p) => {
        try { pmap[p.id] = await resolveImageUrl((p.images && p.images[0] && p.images[0].url) || p.image) } catch (e) { pmap[p.id] = (p.images && p.images[0] && p.images[0].url) || p.image }
      }))
      if (mounted) {
        setBrandImages(bmap)
        setBannerImages(banmap)
        setProductImages(pmap)
      }
    }
    if ((brands || []).length || (banners || []).length || (products || []).length) load()
    return () => { mounted = false }
  }, [brands, banners, products])

  // Brand handlers
  const [brandForm, setBrandForm] = useState({ companyName: '', slug: '', imageCompany: '', bgColor: '', description: '' })
  const saveBrand = async () => {
    try {
      await upsertBrand(brandForm)
  setBrandForm({ companyName: '', slug: '', imageCompany: '', bgColor: '', description: '' })
      await reloadAll()
    } catch (e) {
      alert('Erro ao salvar marca: ' + (e.message || e))
    }
  }

  const removeBrand = async (id) => {
    if (!confirm('Remover marca?')) return
    try {
      await deleteBrand(id)
      await reloadAll()
    } catch (e) {
      alert('Erro ao remover marca: ' + (e.message || e))
    }
  }

  // Banner handlers
  const [bannerForm, setBannerForm] = useState({ type: 'home', image: '', url_mobile: '', url_desktop: '', alt: '', href: '' })
  const saveBanner = async () => {
    try {
      await upsertBanner(bannerForm)
      setBannerForm({ type: 'home', image: '', url_mobile: '', url_desktop: '', alt: '', href: '' })
      await reloadAll()
    } catch (e) {
      alert('Erro ao salvar banner: ' + (e.message || e))
    }
  }

  const removeBanner = async (id) => {
    if (!confirm('Remover banner?')) return
    try {
      await deleteBanner(id)
      await reloadAll()
    } catch (e) {
      alert('Erro ao remover banner: ' + (e.message || e))
    }
  }

  // Category handlers (simple upsert)
  const [categoryForm, setCategoryForm] = useState({ name: '', slug: '', data: {} })
  const saveCategory = async () => {
    try {
      await upsertCategory({ ...categoryForm })
      setCategoryForm({ name: '', slug: '', data: {} })
      await reloadAll()
    } catch (e) {
      alert('Erro ao salvar categoria: ' + (e.message || e))
    }
  }

  const removeCategory = async (id) => {
    if (!confirm('Remover categoria?')) return
    try {
      await deleteCategory(id)
      await reloadAll()
    } catch (e) {
      alert('Erro ao remover categoria: ' + (e.message || e))
    }
  }

  // Product delete only (editing products is complex - leave a remove action for now)
  const removeProduct = async (id) => {
    if (!confirm('Remover produto?')) return
    try {
      await deleteProduct(id)
      await reloadAll()
    } catch (e) {
      alert('Erro ao remover produto: ' + (e.message || e))
    }
  }

  return (
    <Container>
      <h1>Admin</h1>
      <AdminGate>
        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
          <div style={{ flex: 1 }}>
            <Section>
              <h2>Marcas</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8, alignItems: 'center' }}>
                <input placeholder="Nome" value={brandForm.companyName} onChange={e => setBrandForm({ ...brandForm, companyName: e.target.value })} />
                <input placeholder="Slug" value={brandForm.slug} onChange={e => setBrandForm({ ...brandForm, slug: e.target.value })} />
                <input placeholder="Logo (path or url)" value={brandForm.imageCompany} onChange={e => setBrandForm({ ...brandForm, imageCompany: e.target.value })} />
                <input placeholder="bgColor" value={brandForm.bgColor} onChange={e => setBrandForm({ ...brandForm, bgColor: e.target.value })} />
                <textarea placeholder="Descrição da marca" value={brandForm.description} onChange={e => setBrandForm({ ...brandForm, description: e.target.value })} style={{ gridColumn: '1 / span 2' }} />
                <div />
                <button onClick={saveBrand}>Salvar</button>
              </div>
              <div style={{ marginTop: 12 }}>
                {loading ? <div>Carregando...</div> : (
                  brands.map(b => (
                    <div key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                      <img src={brandImages[b.id] || b.imageCompany} alt={b.companyName} style={{ width: 48, height: 48, objectFit: 'contain' }} />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 600 }}>{b.companyName}</div>
                        <div style={{ fontSize: 12, color: '#666' }}>{b.numberProducts || 0} produtos</div>
                        {b.description ? (<div style={{ fontSize: 12, color: '#444', marginTop: 4 }}>{b.description}</div>) : null}
                      </div>
                        <button onClick={() => setBrandForm({ ...b })}>Editar</button>
                      <button onClick={() => removeBrand(b.id)}>Remover</button>
                    </div>
                  ))
                )}
              </div>
            </Section>

            <Section>
              <h2>Banners</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, alignItems: 'center' }}>
                <input placeholder="type (home|disclosure)" value={bannerForm.type} onChange={e => setBannerForm({ ...bannerForm, type: e.target.value })} />
                <input placeholder="alt" value={bannerForm.alt} onChange={e => setBannerForm({ ...bannerForm, alt: e.target.value })} />
                <input placeholder="url_mobile or path" value={bannerForm.url_mobile} onChange={e => setBannerForm({ ...bannerForm, url_mobile: e.target.value })} />
                <input placeholder="url_desktop or path" value={bannerForm.url_desktop} onChange={e => setBannerForm({ ...bannerForm, url_desktop: e.target.value })} />
                <input placeholder="href" value={bannerForm.href} onChange={e => setBannerForm({ ...bannerForm, href: e.target.value })} />
                <div />
                <button onClick={saveBanner}>Salvar banner</button>
              </div>

              <div style={{ marginTop: 12 }}>
                {banners.map(b => (
                  <div key={b.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <img src={bannerImages[b.id] || b.image || b.url_desktop || b.url_mobile} alt={b.alt} style={{ width: 120, height: 64, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{b.alt || b.type}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{b.href}</div>
                    </div>
                    <button onClick={() => setBannerForm({ ...b })}>Editar</button>
                    <button onClick={() => removeBanner(b.id)}>Remover</button>
                  </div>
                ))}
              </div>
            </Section>
          </div>

          <div style={{ width: 360 }}>
            <Section>
              <h2>Produtos</h2>
              <div style={{ marginBottom: 8 }}>
                <small>A edição completa de produto não está implementada aqui. Você pode remover itens.</small>
              </div>
              <div style={{ maxHeight: 400, overflow: 'auto' }}>
                {products.map(p => (
                  <div key={p.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <img src={productImages[p.id] || (p.images && p.images[0] && p.images[0].url) || ''} alt={p.name} style={{ width: 56, height: 56, objectFit: 'cover' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{p.slug}</div>
                    </div>
                    <button onClick={() => removeProduct(p.id)}>Remover</button>
                  </div>
                ))}
              </div>
            </Section>

            <Section>
              <h2>Categorias</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px', gap: 8, alignItems: 'center' }}>
                <input placeholder="Nome" value={categoryForm.name} onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })} />
                <input placeholder="Slug" value={categoryForm.slug} onChange={e => setCategoryForm({ ...categoryForm, slug: e.target.value })} />
                <div />
                <button onClick={saveCategory}>Salvar categoria</button>
              </div>

              <div style={{ marginTop: 12 }}>
                {categories.map(c => (
                  <div key={c.id} style={{ display: 'flex', gap: 8, alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #eee' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#666' }}>{c.slug}</div>
                    </div>
                    <button onClick={() => setCategoryForm({ ...c })}>Editar</button>
                    <button onClick={() => removeCategory(c.id)}>Remover</button>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </AdminGate>
    </Container>
  )
}
