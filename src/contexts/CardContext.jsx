import React, { createContext, useContext, useEffect, useState } from 'react'
import { getItem, setItem } from '../utils/storage'

const CartContext = createContext(null)

export function CartProvider({ children }){
  const [items, setItems] = useState(()=> getItem('cart.items', []))

  useEffect(()=>{
    setItem('cart.items', items)
  },[items])

  // Sincroniza carrinho entre abas/janelas
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'cart.items') {
        try {
          const next = e.newValue ? JSON.parse(e.newValue) : []
          // Evita loops: só atualiza se for diferente
          setItems((prev) => {
            try {
              const prevStr = JSON.stringify(prev)
              const nextStr = JSON.stringify(next)
              return prevStr === nextStr ? prev : next
            } catch {
              return next
            }
          })
        } catch {}
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  function addItem(item){
    setItems(prev => {
      const next = Array.isArray(prev) ? [...prev] : []
      const idx = next.findIndex(i => i.sku === item.sku && i.unitKey === item.unitKey)
      if (idx >= 0){
        next[idx] = { ...next[idx], quantity: (next[idx].quantity || 0) + (item.quantity || 1) }
        return next
      }
      return [...next, item]
    })
  }

  function removeItem(predicate = () => false){
    setItems(prev => (Array.isArray(prev) ? prev.filter(i => !predicate(i)) : []))
  }

  function clear(){ setItems([]) }

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, clear }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart(){
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
