import { useCallback, useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "cartItems";

export default function useCart() {
	const [items, setItems] = useState(() => {
		try {
			const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
			const arr = raw ? JSON.parse(raw) : [];
			return arr;
		} catch {
			return [];
		}
	});

	useEffect(() => {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
		} catch {}
	}, [items]);

	useEffect(() => {
		const onStorage = (e) => {
			if (e.key === STORAGE_KEY && e.newValue) {
				try {
					setItems(JSON.parse(e.newValue));
				} catch {}
			}
		};
		window.addEventListener("storage", onStorage);
		return () => window.removeEventListener("storage", onStorage);
	}, []);

	const add = useCallback((slug, quantity = 1) => {
		setItems((prev) => {
			const idx = prev.findIndex(i => i.slug === slug)
			if (idx === -1) return [...prev, { slug, quantity }]
			const copy = [...prev]
			copy[idx].quantity += quantity
			return copy
		})
	}, [])

	const remove = useCallback((slug) => setItems((prev) => prev.filter(i => i.slug !== slug)), [])
	const update = useCallback((slug, quantity) => setItems((prev) => prev.map(i => i.slug === slug ? { ...i, quantity } : i)), [])
	const clear = useCallback(() => setItems([]), [])

	const list = useMemo(() => items, [items])

	return { add, remove, update, clear, list }
}

