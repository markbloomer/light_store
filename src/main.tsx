import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import { VendorProvider } from './context/VendorContext';
import './styles/tokens.css';
import './styles/base.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <VendorProvider>
          <CartProvider>
            <App />
          </CartProvider>
        </VendorProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
);
