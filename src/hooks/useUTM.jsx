import { useUTM as useUTMFromContext } from '../contexts/UTMContext'

export default function useUTM() {
  return useUTMFromContext()
}
