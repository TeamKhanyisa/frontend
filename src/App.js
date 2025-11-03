import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './contexts/CartContext';
import HomePage from './components/HomePage';
import CakesPage from './components/CakesPage';
import CartPage from './components/CartPage';
import QRCheckinPage from './components/QRCheckinPage';
import FaceCheckinPage from './components/FaceCheckinPage';
import ProductDetailPage from './components/ProductDetailPage';
import ProductRegisterPage from './components/ProductRegisterPage';
import ProductEditPage from './components/ProductEditPage';
import ProductDeletePage from './components/ProductDeletePage';
import AdminControlPage from './components/AdminControlPage';

function App() {
  return (
    <CartProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/cakes" element={<CakesPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/product/:id" element={<ProductDetailPage />} />
            <Route path="/qr-checkin" element={<QRCheckinPage />} />
            <Route path="/face-checkin" element={<FaceCheckinPage />} />
            <Route path="/product-register" element={<ProductRegisterPage />} />
            <Route path="/product-edit" element={<ProductEditPage />} />
            <Route path="/product-edit/:id" element={<ProductEditPage />} />
            <Route path="/product-delete" element={<ProductDeletePage />} />
            <Route path="/admin-control" element={<AdminControlPage />} />
          </Routes>
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;


