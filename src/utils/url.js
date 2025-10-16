// Global UTM storage
let globalUTMString = ''

/**
 * Get the current UTM query string
 * @returns {string} UTM query string (e.g., "?utm_source=google&utm_campaign=test" or "")
 */
export function getUTMString() {
	return globalUTMString
}

/**
 * Set the global UTM string (called on app initialization)
 * @param {string} utmString - The UTM query string to store
 */
export function setUTMString(utmString) {
	globalUTMString = utmString || ''
}

/**
 * Add UTM to a path
 * @param {string} path - The path to add UTM to
 * @returns {string} Path with UTM appended
 */
export function addUTM(path) {
	console.log('🔍 addUTM called with path:', path)
	
	if (!path) {
		console.log('❌ No path provided, returning:', path)
		return path
	}
	
	// Clean path - remove leading slash from external URLs (e.g., /https://... -> https://...)
	let cleanPath = path
	if (path.startsWith('/http')) {
		cleanPath = path.substring(1)
		console.log('🧹 Cleaned path from', path, 'to', cleanPath)
	}
	
	// If there's no UTM to add, just return the cleaned path as-is
	if (!globalUTMString) {
		console.log('✅ No UTM string, returning cleaned path:', cleanPath)
		return cleanPath
	}
	
	try {
		// Check if it's an external URL (starts with http:// or https://)
		const isExternalUrl = /^https?:\/\//i.test(cleanPath)
		console.log('🔍 isExternalUrl:', isExternalUrl)
		
		let url
		if (isExternalUrl) {
			// For external URLs, parse directly without base URL
			url = new URL(cleanPath)
			console.log('🌐 External URL parsed:', url.toString())
		} else {
			// For internal paths, use origin as base
			url = new URL(cleanPath, window.location.origin)
			console.log('🏠 Internal path parsed:', url.toString())
		}
		
		// If path already has query params, append UTM with &, otherwise use ?
		if (url.search) {
			// Check if UTM params are already present to avoid duplication
			const existingParams = new URLSearchParams(url.search)
			const utmParams = new URLSearchParams(globalUTMString.replace(/^\?/, ''))
			
			utmParams.forEach((value, key) => {
				if (!existingParams.has(key)) {
					existingParams.set(key, value)
				}
			})
			
			url.search = existingParams.toString()
		} else {
			url.search = globalUTMString.replace(/^\?/, '')
		}
		
		// Return full URL for external links, just path for internal
		if (isExternalUrl) {
			const result = url.toString()
			console.log('✅ Returning external URL:', result)
			return result
		}
		const result = url.pathname + url.search + url.hash
		console.log('✅ Returning internal path:', result)
		return result
	} catch (error) {
		console.log('❌ Error in addUTM:', error)
		// Fallback: simple string concatenation
		if (cleanPath.includes('?')) {
			return `${cleanPath}${globalUTMString.replace('?', '&')}`
		}
		return `${cleanPath}${globalUTMString}`
	}
}

/**
 * Navigate to a path with UTM preserved
 */
export function go(path = '/') {
	window.location.href = addUTM(path)
}

// Legacy support
export const buildUrlWithUTM = addUTM
