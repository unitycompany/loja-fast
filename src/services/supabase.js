import { createClient } from '@supabase/supabase-js'

// Valores vindo do Vite (.env) - adicione VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY no seu .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
export const SUPABASE_ENABLED = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY)

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  // Não lançar erro aqui para não quebrar builds em ambientes que ainda não configuraram variáveis.
  // Os erros reais aparecerão ao tentar chamar o supabase client.
  // Você pode descomentar a linha abaixo para forçar a falha durante o desenvolvimento:
  // throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY')
}

function createSupabaseStub() {
  const makeQuery = () => {
    const q = {
      select() { return q },
      order() { return q },
      limit() { return q },
      eq() { return q },
      ilike() { return q },
      neq() { return q },
      single() { return q },
      range() { return q },
      update() { return q },
      insert() { return q },
      delete() { return q },
  then(resolve) { return resolve({ data: [], error: null }) },
      catch() { return q },
      finally() { return q },
    }
    return q
  }
  return {
    from() { return makeQuery() },
    storage: {
      from() {
        return {
          getPublicUrl() { return { data: { publicUrl: null }, error: new Error('Supabase disabled') } },
          createSignedUrl() { return Promise.resolve({ data: { signedURL: null }, error: new Error('Supabase disabled') }) },
          upload: async () => ({ data: null, error: new Error('Supabase disabled') }),
        }
      }
    },
    auth: {
      signInWithPassword: async () => ({ data: null, error: new Error('Supabase disabled') }),
      signOut: async () => ({ error: null }),
      getSession: async () => ({ data: { session: null }, error: null }),
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe(){} } } }),
    }
  }
}

export const supabase = SUPABASE_ENABLED
  ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : createSupabaseStub()

// Nome do bucket que usaremos para imagens de produto. Ajuste se você usar outro nome.
export const PRODUCT_IMAGES_BUCKET = 'products'
export const BRAND_LOGO_BUCKET = 'brands'
export const BANNERS_BUCKET = 'banners'
export const CATEGORY_IMAGES_BUCKET = 'categories'

/**
 * Retorna uma URL pública para um arquivo no bucket (se o bucket for público).
 * Se o caminho já for uma URL completa (http(s)://...), retorna ele.
 * @param {string} path - caminho dentro do bucket ou URL completa
 * @returns {string|null}
 */
const STORAGE_WARN_CACHE = new Set()

function warnOnce(id, ...args) {
  if (STORAGE_WARN_CACHE.has(id)) return
  STORAGE_WARN_CACHE.add(id)
  // eslint-disable-next-line no-console
  console.warn(...args)
}

export function getPublicImageUrl(path) {
  if (!path) return null
  // If it's already a full URL, return as-is
  if (/^https?:\/\//i.test(path)) return path

  // Handle local-style paths that may actually point to Supabase buckets
  const normalized = path.replace(/^\//, '')
  const [maybeBucket] = normalized.split('/')
  const knownBuckets = [
    PRODUCT_IMAGES_BUCKET,
    BRAND_LOGO_BUCKET,
    BANNERS_BUCKET,
    CATEGORY_IMAGES_BUCKET,
  ]
  const looksLikeBucketPath = knownBuckets.includes(maybeBucket)
  if (path.startsWith('/') && (!SUPABASE_ENABLED || !looksLikeBucketPath)) {
    // Treat as local public asset when Supabase is disabled or bucket name is unknown
    return path
  }

  try {
    // Normalize: strip any leading slashes
    let key = normalized
    // Guess bucket by key prefix: allow keys like "brands/..." or "products/..."
    // We'll attempt several strategies to find the right bucket/key:
    // 1) If key looks like "bucketName/remaining/path", try bucketName first
    // 2) Try configured buckets (PRODUCT_IMAGES_BUCKET, BRAND_LOGO_BUCKET)
    // 3) As last resort, try the default PRODUCT_IMAGES_BUCKET with the original key
    const attempts = []
    const parts = key.split('/')
    if (parts.length > 1) {
      const candidateBucket = parts[0]
      const candidateKey = parts.slice(1).join('/')
      attempts.push({ bucket: candidateBucket, key: candidateKey })
    }
  // prefer configured buckets next
  attempts.push({ bucket: PRODUCT_IMAGES_BUCKET, key })
  attempts.push({ bucket: BRAND_LOGO_BUCKET, key })
  attempts.push({ bucket: BANNERS_BUCKET, key })
  attempts.push({ bucket: CATEGORY_IMAGES_BUCKET, key })

    // Ensure unique attempts by bucket+key
    const tried = new Set()
    for (const at of attempts) {
      const id = `${at.bucket}::${at.key}`
      if (tried.has(id)) continue
      tried.add(id)
      try {
        const { data, error } = supabase.storage.from(at.bucket).getPublicUrl(at.key)
        if (error) {
          warnOnce(`pub-${at.bucket}-${at.key}`, 'getPublicImageUrl: error for bucket', at.bucket, error.message || error)
          continue
        }
        if (data?.publicUrl) return data.publicUrl
      } catch (err) {
        warnOnce(`pub-ex-${at.bucket}-${at.key}`, 'getPublicImageUrl: exception for bucket', at.bucket, err?.message || err)
        continue
      }
    }
    return null
  } catch (err) {
    // Em caso de erro, retorne null — o chamador deve tratar
    return null
  }
}

/**
 * Gera uma URL assinada (temporária) para um arquivo no bucket. Requer que o arquivo exista.
 * @param {string} path
 * @param {number} expires - segundos
 * @returns {Promise<string|null>}
 */
export async function getSignedImageUrl(path, expires = 3600) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path
  // Local public path doesn't need signed URL
  const normalized = path.replace(/^\//, '')
  const [maybeBucket] = normalized.split('/')
  const knownBuckets = [
    PRODUCT_IMAGES_BUCKET,
    BRAND_LOGO_BUCKET,
    BANNERS_BUCKET,
    CATEGORY_IMAGES_BUCKET,
  ]
  const looksLikeBucketPath = knownBuckets.includes(maybeBucket)
  if (path.startsWith('/') && (!SUPABASE_ENABLED || !looksLikeBucketPath)) {
    return path
  }
  try {
    let key = normalized
    const attempts = []
    const parts = key.split('/')
    if (parts.length > 1) {
      const candidateBucket = parts[0]
      const candidateKey = parts.slice(1).join('/')
      attempts.push({ bucket: candidateBucket, key: candidateKey })
    }
    attempts.push({ bucket: PRODUCT_IMAGES_BUCKET, key })
    attempts.push({ bucket: BRAND_LOGO_BUCKET, key })
    attempts.push({ bucket: BANNERS_BUCKET, key })
    attempts.push({ bucket: CATEGORY_IMAGES_BUCKET, key })

    const tried = new Set()
    for (const at of attempts) {
      const id = `${at.bucket}::${at.key}`
      if (tried.has(id)) continue
      tried.add(id)
      try {
        const { data, error } = await supabase.storage.from(at.bucket).createSignedUrl(at.key, expires)
        if (error) {
          warnOnce(`signed-${at.bucket}-${at.key}`, 'getSignedImageUrl: error for bucket', at.bucket, error.message || error)
          continue
        }
        if (data?.signedURL) return data.signedURL
      } catch (err) {
        warnOnce(`signed-ex-${at.bucket}-${at.key}`, 'getSignedImageUrl: exception for bucket', at.bucket, err?.message || err)
        continue
      }
    }
    return null
  } catch (err) {
    return null
  }
}

// CLIENT-SIDE upload helper (uses anon key). For server-side uploads use scripts with service_role_key.
export async function uploadFileClient(bucket, path, file) {
  return supabase.storage.from(bucket).upload(path, file, { upsert: true })
}

// Helper to get public url for a file in a bucket
export function publicUrlFor(bucket, key) {
  try {
    if (!key) return null
    // If key is a full URL or local path, return it
    if (/^https?:\/\//i.test(key) || key.startsWith('/')) return key
    // strip leading slash
    const normalized = key.replace(/^\//, '')
    const { data } = supabase.storage.from(bucket).getPublicUrl(normalized)
    return data?.publicUrl ?? null
  } catch (e) {
    return null
  }
}

/**
 * Resolve an image path to a usable URL. Tries (in order):
 * - return as-is if already a full URL or local public path
 * - public URL from storage (if bucket is public)
 * - signed URL from storage (short-lived)
 * - original path as last resort
 * @param {string} path
 * @param {number} expires seconds for signed URL
 * @returns {Promise<string|null>}
 */
export async function resolveImageUrl(path, expires = 3600) {
  if (!path) return null
  if (/^https?:\/\//i.test(path)) return path

  const normalized = path.replace(/^\//, '')
  const [maybeBucket] = normalized.split('/')
  const knownBuckets = [
    PRODUCT_IMAGES_BUCKET,
    BRAND_LOGO_BUCKET,
    BANNERS_BUCKET,
    CATEGORY_IMAGES_BUCKET,
  ]
  const looksLikeBucketPath = knownBuckets.includes(maybeBucket)
  if (path.startsWith('/') && (!SUPABASE_ENABLED || !looksLikeBucketPath)) {
    return path
  }

  // Try public URL first (fast path for public buckets)
  const pub = getPublicImageUrl(path)
  if (pub) return pub

  if (looksLikeBucketPath) {
    const signed = await getSignedImageUrl(normalized, expires)
    if (signed) return signed
  } else {
    const signed = await getSignedImageUrl(path, expires)
    if (signed) return signed
  }

  // Fallback to original path
  if (path.startsWith('/')) return path
  return `/${normalized}`
}
