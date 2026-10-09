import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { CartDrawer } from './components/cart/CartDrawer';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { VendorBar } from './components/vendor/VendorBar';
import { HomePage } from './pages/HomePage';
import { ProductPage } from './pages/ProductPage';
import { ShopPage } from './pages/ShopPage';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo({ top: 0 }), [pathname]);
  return null;
}

export function App() {
  return (
    <>
      <ScrollToTop />
      <Header />
      <VendorBar />
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/shop" element={<ShopPage />} />
          <Route path="/product/:id" element={<ProductPage />} />
          <Route path="*" element={<ShopPage />} />
        </Routes>
      </main>
      <Footer />
      <CartDrawer />
    </>
  );
}
