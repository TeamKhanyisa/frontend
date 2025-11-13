import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const HeroSection = () => {
  const { user, isAuthenticated } = useAuth();

  return (
    <section className="card hero-main">
      <div className="hero-main-content">
        <div className="hero-badge">KHAYISA</div>
        <h1 className="hero-title">
          {isAuthenticated && user ? (
            <>
              <span className="hero-greeting">안녕하세요, {user.name || user.email}님!</span>
              <span className="hero-subtitle">오늘도 맛있는 케이크와 함께하세요 🎂</span>
            </>
          ) : (
            <>
              <span className="hero-greeting">환영합니다!</span>
              <span className="hero-subtitle">프리미엄 케이크로 특별한 순간을 만들어보세요</span>
            </>
          )}
        </h1>
        <p className="hero-description">
          정성스럽게 만든 수제 케이크로 소중한 순간을 더욱 특별하게 만듭니다.
          생일, 기념일, 또는 평범한 하루도 특별하게 만들어드립니다.
        </p>
        <div className="hero-actions">
          <Link to="/cakes" className="btn hero-primary">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            케이크 둘러보기
          </Link>
          {!isAuthenticated && (
            <Link to="/" className="btn hero-secondary">
              지금 시작하기
            </Link>
          )}
        </div>
        <div className="hero-stats">
          <div className="stat-item">
            <div className="stat-value">100+</div>
            <div className="stat-label">다양한 케이크</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5★</div>
            <div className="stat-label">평균 평점</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">24h</div>
            <div className="stat-label">당일 제작</div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;



