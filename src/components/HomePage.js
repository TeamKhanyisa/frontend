import React from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';
import LoginSection from './LoginSection';
import QuickAccessSection from './QuickAccessSection';
import AdminSection from './AdminSection';
import HeroSection from './HeroSection';
import FeaturedProducts from './FeaturedProducts';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';

const HomePage = () => {
  const { getTotalItems } = useCart();
  const { isAuthenticated, user } = useAuth();
  const isAdmin = user?.role === 'admin';

  return (
    <div className="App">
      <Background />
      
      {/* 장바구니 버튼 (오른쪽 하단 고정) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
        <Link
          to="/cart"
          className="cart-fab"
          title="장바구니"
        >
          <span className="cart-fab-icon">🛒</span>
          {getTotalItems() > 0 && (
            <span className="cart-fab-badge">
              {getTotalItems()}
            </span>
          )}
          <div className="cart-fab-tooltip">
            장바구니 ({getTotalItems()}개)
          </div>
        </Link>
      </div>
      
      <main className="container">
        <HeroSection />
        <LoginSection />
        <FeaturedProducts />
        <QuickAccessSection />
        {isAuthenticated && isAdmin && <AdminSection />}
      </main>
    </div>
  );
};

export default HomePage;
