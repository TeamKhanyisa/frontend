import React from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';
import LoginSection from './LoginSection';
import QuickAccessSection from './QuickAccessSection';
import AdminSection from './AdminSection';
import { useCart } from '../contexts/CartContext';

const HomePage = () => {
  const { getTotalItems } = useCart();

  return (
    <div className="App">
      <Background />
      
      {/* 장바구니 버튼 (고정 위치) */}
      <div className="fixed top-4 right-4 z-50">
        <Link
          to="/cart"
          className="relative bg-pink-600 hover:bg-pink-700 text-white p-3 rounded-full shadow-lg transition-all duration-300 hover:scale-110 group"
          title="장바구니"
        >
          <span className="text-xl">🛒</span>
          {getTotalItems() > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold animate-pulse">
              {getTotalItems()}
            </span>
          )}
          <div className="absolute right-full top-1/2 transform -translate-y-1/2 mr-2 bg-gray-800 text-white px-2 py-1 rounded text-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            장바구니 ({getTotalItems()}개)
          </div>
        </Link>
      </div>
      
      <main className="container">
        <LoginSection />
        <QuickAccessSection />
        <AdminSection />
      </main>
    </div>
  );
};

export default HomePage;
