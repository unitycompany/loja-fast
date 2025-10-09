import { useCallback, useMemo, useSyncExternalStore } from "react";

const STORAGE_KEY = "wishlistSlugs";

// Store global reativo com useSyncExternalStore para sincronizar em toda a app
const store = (() => {
  let slugsSet = new Set();
  const listeners = new Set();

  const readFromStorage = () => {
    try {
      const raw = typeof window !== "undefined" && localStorage.getItem(STORAGE_KEY);
      const arr = raw ? JSON.parse(raw) : [];
      slugsSet = new Set(Array.isArray(arr) ? arr : []);
    } catch {
      slugsSet = new Set();
    }
  };

  // lazy init
  if (typeof window !== "undefined" && slugsSet.size === 0) {
    readFromStorage();
  }

  const emit = () => {
    for (const l of listeners) l();
  };

  const persist = () => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify([...slugsSet])); } catch {}
  };

  const api = {
    subscribe(cb) {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    getSnapshot() {
      return slugsSet;
    },
    add(slug) {
      if (!slug || slugsSet.has(slug)) return;
      slugsSet = new Set(slugsSet);
      slugsSet.add(slug);
      persist();
      emit();
    },
    remove(slug) {
      if (!slug || !slugsSet.has(slug)) return;
      slugsSet = new Set(slugsSet);
      slugsSet.delete(slug);
      persist();
      emit();
    },
    toggle(slug) {
      if (!slug) return;
      slugsSet = new Set(slugsSet);
      if (slugsSet.has(slug)) slugsSet.delete(slug); else slugsSet.add(slug);
      persist();
      emit();
    },
    clear() {
      slugsSet = new Set();
      persist();
      emit();
    },
    // Sync com outras abas
    initCrossTabSync() {
      if (typeof window === "undefined") return;
      // Evitar múltiplos handlers duplicados
      if (window.__wishlistStorageHandlerAttached) return;
      window.__wishlistStorageHandlerAttached = true;
      window.addEventListener("storage", (e) => {
        if (e.key === STORAGE_KEY) {
          readFromStorage();
          emit();
        }
      });
    }
  };

  // inicializa listener de abas
  if (typeof window !== "undefined") api.initCrossTabSync();

  return api;
})();

/**
 * Hook para gerenciar wishlist por slug (global).
 * - Persiste no localStorage
 * - Reativo entre componentes na mesma aba (useSyncExternalStore)
 * - Sincroniza entre abas (evento storage)
 * API: isWished(slug), toggle(slug), add(slug), remove(slug), clear(), list
 */
export default function useWishlist() {
  const slugs = useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    () => new Set()
  );

  const isWished = useCallback((slug) => slugs.has(slug), [slugs]);

  const add = useCallback((slug) => store.add(slug), []);
  const remove = useCallback((slug) => store.remove(slug), []);
  const toggle = useCallback((slug) => store.toggle(slug), []);
  const clear = useCallback(() => store.clear(), []);

  const list = useMemo(() => [...slugs], [slugs]);

  return { isWished, toggle, add, remove, clear, list };
}
