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
	if (!globalUTMString) return path
	
	try {
		const url = new URL(path, window.location.origin)
		
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
		
		return url.pathname + url.search + url.hash
	} catch {
		// Fallback: simple string concatenation
		if (path.includes('?')) {
			return `${path}${globalUTMString.replace('?', '&')}`
		}
		return `${path}${globalUTMString}`
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
