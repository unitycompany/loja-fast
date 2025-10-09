import { useCallback, useEffect, useMemo, useState } from 'react'
import styled from 'styled-components'
import { uploadFileClient, resolveImageUrl } from '../../../services/supabase'
import { ensureAdminSession } from '../../../services/adminAuth'

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`

const DropZone = styled.label`
  position: relative;
  border: 2px dashed ${({ $dragging }) => ($dragging ? 'var(--color--primary)' : 'var(--color--gray-5)')};
  border-radius: 0;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: var(--color--white);
  cursor: pointer;
  transition: border-color 160ms ease, background 160ms ease;
  overflow: hidden;

  &:hover {
    border-color: var(--color--primary);
  }

  input {
    opacity: 0;
    position: absolute;
    inset: 0;
    cursor: pointer;
  }
`

const Preview = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: var(--color--white);

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
`

const Instructions = styled.div`
  text-align: center;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  color: var(--color--gray-3);
  font-size: 13px;

  strong {
    color: var(--color--black-2);
    font-size: 14px;
  }
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  button {
    padding: 6px 10px;
    border-radius: 0;
    border: 1px solid var(--color--gray-6);
    background: var(--color--white);
    cursor: pointer;
    font-size: 12px;
  }
`

const Progress = styled.div`
  position: relative;
  width: 100%;
  height: 4px;
  border-radius: 0;
  background: var(--color--gray-6);
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--color--primary);
    width: ${({ $value }) => `${$value}%`};
    transition: width 120ms ease;
  }
`

function sanitizeFilename(name = '') {
  return name
    .normalize('NFD').replace(/[^\w\s.-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase()
}

export default function MediaUploader({
  bucket,
  value,
  onChange,
  accept = 'image/*',
  placeholder = 'Arraste ou clique para selecionar',
  description,
  pathBuilder,
  disabled = false,
  allowRemove = true
}) {
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dragging, setDragging] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false
    async function loadPreview() {
      if (!value) {
        setPreview(null)
        return
      }
      try {
        const url = await resolveImageUrl(value)
        if (!ignore) setPreview(url)
      } catch (err) {
        if (!ignore) setPreview(null)
      }
    }
    loadPreview()
    return () => { ignore = true }
  }, [value])

  useEffect(() => {
    ensureAdminSession().catch(() => {
      // Erros já são logados dentro do helper; mantemos a UI responsiva.
    })
  }, [])

  const buildPath = useCallback((file) => {
    if (typeof pathBuilder === 'function') return pathBuilder(file)
    const safeName = sanitizeFilename(file.name || 'file')
    const stamp = Date.now()
    return `${stamp}_${safeName}`
  }, [pathBuilder])

  const handleFile = useCallback(async (file) => {
    if (!file || !bucket || !onChange) return
    setError('')
    try {
      setUploading(true)
      setProgress(5)
  await ensureAdminSession()
      const key = buildPath(file)
      const result = await uploadFileClient(bucket, key, file)
      if (result.error) throw result.error
      setProgress(95)
      const storedPath = `${bucket}/${key}`
      onChange(storedPath)
      setProgress(100)
    } catch (err) {
      console.error('Media upload failed', err)
      const message = err?.message || 'Falha no upload'
      if (typeof message === 'string' && message.toLowerCase().includes('row-level security')) {
        setError('Upload bloqueado pelas políticas de segurança. Confirme as credenciais admin no .env.')
      } else {
        setError(message)
      }
    } finally {
      setTimeout(() => setProgress(0), 600)
      setUploading(false)
    }
  }, [bucket, onChange, buildPath])

  const onInputChange = useCallback((event) => {
    const file = event.target.files?.[0]
    if (file) handleFile(file)
  }, [handleFile])

  const dropHandlers = useMemo(() => ({
    onDragEnter: (event) => {
      event.preventDefault()
      event.stopPropagation()
      if (disabled) return
      setDragging(true)
    },
    onDragOver: (event) => {
      event.preventDefault()
      event.stopPropagation()
    },
    onDragLeave: (event) => {
      event.preventDefault()
      event.stopPropagation()
      setDragging(false)
    },
    onDrop: (event) => {
      event.preventDefault()
      event.stopPropagation()
      setDragging(false)
      if (disabled) return
      const file = event.dataTransfer.files?.[0]
      if (file) handleFile(file)
    }
  }), [handleFile, disabled])

  return (
    <Wrapper>
      <DropZone
        $dragging={dragging}
        {...dropHandlers}
      >
        <input type="file" accept={accept} disabled={disabled || uploading} onChange={onInputChange} />
        {preview ? (
          <Preview>
            <img src={preview} alt="Pré-visualização" />
          </Preview>
        ) : (
          <Instructions>
            <strong>{placeholder}</strong>
            {description ? <span>{description}</span> : null}
            <span>{disabled ? 'Upload desativado' : 'Formatos aceitos: imagens até 5MB.'}</span>
          </Instructions>
        )}
      </DropZone>
  {uploading && <Progress $value={progress} />}
      <Actions>
        {value && allowRemove ? (
          <button type="button" onClick={() => onChange(null)} disabled={disabled || uploading}>Remover</button>
        ) : null}
        {error ? <span style={{ color: 'var(--color--primary)', fontSize: 12 }}>{error}</span> : null}
      </Actions>
    </Wrapper>
  )
}
