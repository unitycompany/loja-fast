import { useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUTM } from '../contexts/UTMContext'

/**
 * Hook that provides a navigate function that preserves UTM parameters
 * @returns {Function} navigate function that automatically adds stored UTM params
 */
export default function useNavigateWithUTM() {
	const navigate = useNavigate()
	const { utm } = useUTM()

	const navigateWithUTM = useCallback((to, options) => {
		if (!to) {
			navigate(to, options)
			return
		}

		// Handle string paths
		if (typeof to === 'string') {
			try {
				const url = new URL(to, window.location.origin)
				const params = new URLSearchParams(url.search)
				
				// Add stored UTM params that aren't already in the URL
				if (utm && Object.keys(utm).length > 0) {
					Object.entries(utm).forEach(([key, value]) => {
						if (!params.has(key)) {
							params.set(key, value)
						}
					})
				}
				
				const search = params.toString()
				const newPath = url.pathname + (search ? `?${search}` : '') + url.hash
				navigate(newPath, options)
			} catch {
				// Fallback if URL parsing fails
				navigate(to, options)
			}
			return
		}

		// Handle object navigation (pathname, search, hash)
		if (typeof to === 'object') {
			const searchParams = new URLSearchParams(to.search || '')
			
			// Add stored UTM params
			if (utm && Object.keys(utm).length > 0) {
				Object.entries(utm).forEach(([key, value]) => {
					if (!searchParams.has(key)) {
						searchParams.set(key, value)
					}
				})
			}
			
			const search = searchParams.toString()
			navigate({
				...to,
				search: search ? `?${search}` : ''
			}, options)
			return
		}

		// Fallback
		navigate(to, options)
	}, [navigate, utm])

	return navigateWithUTM
}
