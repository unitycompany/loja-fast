// Utility helpers for image resolution and local fallbacks

// NOTE: These imports let Vite bundle the SVGs and give us a URL string at runtime.
// Keep this list small and only include brands we actually have as local assets.
import brasilit from '../assets/brands/brasilit.svg'
import placo from '../assets/brands/placo.svg'
import quartzolit from '../assets/brands/quartzolit.svg'
import ecophon from '../assets/brands/ecophon.svg'
import isover from '../assets/brands/isover.svg'
import ourofix from '../assets/brands/ourofix.svg'
import biancogress from '../assets/brands/biancogress.svg'

function slugify(input) {
	if (!input) return ''
	const str = String(input)
		.normalize('NFD')
		.replace(/\p{Diacritic}/gu, '')
		.toLowerCase()
		.trim()
	return str
}

// Map of known brand slugs to local SVG assets
const LOCAL_BRAND_LOGOS = new Map([
	['brasilit', brasilit],
	['placo', placo],
	['quartzolit', quartzolit],
	['ecophon', ecophon],
	['isover', isover],
	['ourofix', ourofix],
	['biancogress', biancogress],
])

/**
 * Returns a local logo URL for a known brand slug or name.
 * If not available, returns null.
 */
export function localBrandLogo(slugOrName) {
	const s = slugify(slugOrName)
	if (!s) return null
	// direct match
	if (LOCAL_BRAND_LOGOS.has(s)) return LOCAL_BRAND_LOGOS.get(s)
	// simple contains heuristics for common variations
	for (const [key, url] of LOCAL_BRAND_LOGOS.entries()) {
		if (s.includes(key)) return url
	}
	return null
}

