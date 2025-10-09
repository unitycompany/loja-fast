export const N8N_WEBHOOK_URL = 'https://n8n.unitycompany.com.br/webhook/fastsistemas/formularios-dos-sites'
export const WHATS_TARGET_E164 = '5521992882282'
export const WHATS_MSG = 'Oi, acabei de me cadastrar no site da Fast, e gostaria de mais informações'

// Helper to optionally override via global window for quick tests without rebuild
if (typeof window !== 'undefined') {
	// Allow overrides if set on window before use
	// e.g., window.__FAST_N8N_URL = 'https://...'
	// These assignments are safe: consumers import the constants (snapshotted at build),
	// but you can reference window.__FAST_* inside components if you choose to.
	window.__FAST_N8N_URL = window.__FAST_N8N_URL || N8N_WEBHOOK_URL
	window.__FAST_WHATS_E164 = window.__FAST_WHATS_E164 || WHATS_TARGET_E164
	window.__FAST_WHATS_MSG = window.__FAST_WHATS_MSG || WHATS_MSG
}
