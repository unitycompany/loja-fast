import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useCart } from './CardContext'

const UIContext = createContext(null)

export function UIProvider({ children }) {
	const { items } = useCart()
	const [cartPreviewOpen, setCartPreviewOpen] = useState(false)
	const prevCountRef = useRef(Array.isArray(items) ? items.length : 0)

	// Auto-open whenever the cart transitions from empty -> non-empty.
	// This should open again if the user empties the cart and adds a product later.
	useEffect(() => {
		const nextCount = Array.isArray(items) ? items.length : 0
		const prevCount = prevCountRef.current

		if (prevCount === 0 && nextCount > 0) {
			setCartPreviewOpen(true)
		}

		prevCountRef.current = nextCount
	}, [items])

	const value = useMemo(() => ({
		cartPreviewOpen,
		openCartPreview: () => setCartPreviewOpen(true),
		closeCartPreview: () => setCartPreviewOpen(false),
	}), [cartPreviewOpen])

	return (
		<UIContext.Provider value={value}>
			{children}
		</UIContext.Provider>
	)
}

export function useUI() {
	const ctx = useContext(UIContext)
	if (!ctx) throw new Error('useUI must be used within UIProvider')
	return ctx
}
