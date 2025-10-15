import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import styled, { keyframes } from 'styled-components'
import { useEffect } from 'react'

import Header from "../components/layout/Header";
import Footer from "../components/layout/Footer";

import Home from "../pages/Home/Home";
import Search from "../pages/Search/Search";
import Product from "../pages/Product/Product";
import Cart from "../pages/Cart/Cart";
import WhishList from "../pages/Whishlist/WhishList";
import Admin from "../pages/Admin";

function AppShell() {
  const location = useLocation();
  const hideLayoutChrome = location.pathname.startsWith("/admin");

  const fadeIn = keyframes`
    from { opacity: 0; transform: translateY(6px); }
    to { opacity: 1; transform: translateY(0); }
  `
  const Page = styled.div`
    animation: ${fadeIn} 260ms ease;
    will-change: opacity, transform;
  `

  // Always scroll to top on route change (pathname, query or hash)
  useEffect(() => {
    const instant = () => { try { window.scrollTo(0, 0) } catch {} }
    // Use instant first to evitar mostrar posição antiga
    instant()
    // Smooth after a tiny delay to garantir layout montado
    const t = setTimeout(() => {
      try { window.scrollTo({ top: 0, behavior: 'smooth' }) } catch { instant() }
    }, 10)
    return () => clearTimeout(t)
  }, [location.pathname, location.search, location.hash])

  return (
    <>
      {!hideLayoutChrome && <Header />}
      <Page key={location.pathname}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/pesquisa" element={<Search />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/produto/:slug" element={<Product />} />
          <Route path="/orcamento" element={<Cart />} />
          <Route path="/favoritos" element={<WhishList />} />
        </Routes>
      </Page>
      {!hideLayoutChrome && <Footer />}
    </>
  );
}

function App() {
  // Vite exposes the base path at runtime via import.meta.env.BASE_URL
  const basename = import.meta.env.BASE_URL || '/'
  return (
    <BrowserRouter basename={basename}>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;