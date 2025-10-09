export function go(path = '/') {
	try {
		const base = (import.meta && import.meta.env && import.meta.env.BASE_URL) || '/'
		const cleaned = String(path || '/').replace(/^\//, '')
		const final = new URL(cleaned, window.location.origin + base).pathname
		window.location.href = final
	} catch {
		window.location.href = path || '/'
	}
}
