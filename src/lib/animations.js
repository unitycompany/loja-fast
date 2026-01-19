/**
 * Animate a small element "lifting and gliding" from a source element to a header target.
 * targetId: 'cart-button' | 'wishlist-button' (or any element id in header)
 * Options: { imageSrc, size, duration, curvature }
 */
export function flyToTarget(sourceEl, targetId = 'cart-button', { imageSrc = null, size, duration = 2600, curvature = 0.18 } = {}) {
  try {
    const targetBtn = document.getElementById(targetId)
    if (!targetBtn || !sourceEl) return

    // Respect reduced motion preferences
    try {
      if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    } catch {}

    const srcRect = sourceEl.getBoundingClientRect()
    const dstRect = targetBtn.getBoundingClientRect()
    const startX = srcRect.left + srcRect.width / 2
    const startY = srcRect.top + srcRect.height / 2
    const endX = dstRect.left + dstRect.width / 2
    const endY = dstRect.top + dstRect.height / 2

    // Responsive size: default to smaller of 36 or 60% of source min-dimension if not provided
    const baseSize = size ?? Math.max(18, Math.min(36, Math.min(srcRect.width, srcRect.height) * 0.6))

    const el = document.createElement('div')
    el.style.position = 'fixed'
    el.style.left = `${startX - baseSize/2}px`
    el.style.top = `${startY - baseSize/2}px`
    el.style.width = `${baseSize}px`
    el.style.height = `${baseSize}px`
    el.style.borderRadius = '8px'
    el.style.zIndex = 2000
    el.style.pointerEvents = 'none'
    el.style.boxShadow = '0 10px 24px rgba(0,0,0,0.18)'
    el.style.transition = `
      transform ${duration}ms cubic-bezier(0.22, 1, 0.36, 1),
      opacity ${duration}ms ease,
      filter ${duration}ms ease
    `
    el.style.transform = 'translate3d(0,0,0)'
    el.style.opacity = '1'
    if (imageSrc) {
      el.style.background = `#fff url(${imageSrc}) center/cover no-repeat`
      el.style.border = '1px solid rgba(0,0,0,0.1)'
    } else {
      el.style.background = 'linear-gradient(135deg, #16a34a 0%, #2dbf56 100%)'
    }
    document.body.appendChild(el)

    const dx = endX - startX
    const dy = endY - startY
    // Use a simple 2-keyframe animation with a mid control point to simulate a float/glide curve.
    // Mid point slightly above the straight line for a smooth lift effect.
    const midX = startX + dx * 0.5
    const midY = startY + dy * (0.5 - curvature)

    const keyframes = [
      {
        transform: 'translate3d(0,0,0) scale(1)',
        opacity: 0.98,
        filter: 'saturate(1)'
      },
      {
        transform: `translate3d(${midX - startX}px, ${midY - startY}px, 0) scale(0.92)`,
        opacity: 0.9,
        offset: 0.55
      },
      {
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.75)`,
        opacity: 0.42,
        filter: 'saturate(0.85)'
      }
    ]

    // Prefer WAAPI if available for better timing control
    if (el.animate) {
      el.animate(keyframes, { duration, easing: 'cubic-bezier(0.2, 0.9, 0.2, 1)', fill: 'forwards' })
    } else {
      // fallback single transform
      requestAnimationFrame(() => {
        el.style.transform = `translate3d(${dx}px, ${dy - 20}px, 0) scale(0.78)`
        el.style.opacity = '0.25'
      })
    }

    setTimeout(() => { try { document.body.removeChild(el) } catch {} }, duration + 60)
  } catch (e) {
    // ignore animation errors
  }
}

/**
 * Dispatch a global event so the header can bump the cart badge.
 */
export function emitCartAdded() {
  try { window.dispatchEvent(new CustomEvent('cart:add')) } catch {}
}

/**
 * Dispatch a global event so the header can bump the wishlist badge.
 */
export function emitWishlistToggled() {
  try { window.dispatchEvent(new CustomEvent('wishlist:add')) } catch {}
}
