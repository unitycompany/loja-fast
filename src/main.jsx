import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import './styles/globals.css'
import './styles/reset.css'
import './styles/tokens.css'

import App from './app/App'
import { CartProvider } from './contexts/CardContext'
import AOS from 'aos'
import 'aos/dist/aos.css'

// Initialize AOS once on app boot
AOS.init({
  duration: 500,
  once: true,
  easing: 'ease-out-cubic',
  offset: 20,
})

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <CartProvider>
      <App />
    </CartProvider>
  </StrictMode>,
)
