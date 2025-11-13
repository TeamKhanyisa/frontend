import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Background from './Background';
import { productAPI } from '../utils/api';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { SkeletonGrid } from './SkeletonLoader';

const CakesPage = () => {
  const navigate = useNavigate();
  const { addToCart, getTotalItems } = useCart();
  const { toasts, showSuccess, removeToast } = useToast();
  const [activeFilter, setActiveFilter] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const filterTabs = ['전체', '생일케이크', '웨딩케이크', '디저트'];

  // 백엔드에서 상품 목록 가져오기 (쿠키 자동 포함)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('상품 목록 조회 실패:', error);
        // 에러 시 임시 데이터 사용
        setProducts(defaultProducts);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);

  // 임시 기본 상품 데이터 (백엔드 연결 실패 시 사용)
  const defaultProducts = [
    {
      id: 1,
      name: '딸기 생크림 케이크',
      description: '신선한 딸기와 부드러운 생크림',
      price: 35000,
      originalPrice: 42000,
      rating: 4.9,
      reviewCount: 127,
      image: 'https://i.pinimg.com/1200x/ad/62/12/ad6212628fa7ca2851db2f90bef2bf58.jpg',
      badge: 'BEST',
      category: '생일케이크'
    },
    {
      id: 2,
      name: '초콜릿 무스 케이크',
      description: '진한 초콜릿과 부드러운 무스',
      price: 45000,
      rating: 4.7,
      reviewCount: 89,
      image: 'https://i.pinimg.com/736x/65/b5/19/65b519ed94b29e7e92c22fe7c6e3ecef.jpg',
      badge: 'NEW',
      category: '생일케이크'
    },
    {
      id: 3,
      name: '뉴욕 치즈케이크',
      description: '진짜 뉴욕의 맛, 진한 치즈',
      price: 28000,
      rating: 4.3,
      reviewCount: 156,
      image: 'https://i.pinimg.com/474x/12/45/00/124500c8574e4b3ac1655fe44758a139.jpg',
      category: '디저트'
    },
    {
      id: 4,
      name: '이탈리안 티라미수',
      description: '정통 이탈리안 레시피',
      price: 38000,
      rating: 4.9,
      reviewCount: 203,
      image: 'https://i.pinimg.com/1200x/53/2b/f1/532bf12e533bb1a9c04cfa84dc4bf510.jpg',
      badge: '시즌한정',
      category: '디저트'
    }
  ];

  const filteredProducts = products.filter(product => {
    const matchesFilter = activeFilter === '전체' || product.category === activeFilter;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleAddToCart = (product) => {
    addToCart(product);
    showSuccess(`${product.name}이(가) 장바구니에 추가되었습니다! ✨`, 2500);
  };


  return (
    <div className="App">
      <Background />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      {/* 장바구니 버튼 (오른쪽 하단 고정) */}
      <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 1000 }}>
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
        {/* Header Section */}
        <section className="card hero">
          <div className="hero-content">
            <div className="brand">
              <div className="kakao-logo">
                <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                  <path d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12z" fill="currentColor"/>
                  <path d="M16 8c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="currentColor"/>
                  <path d="M16 12c-2.206 0-4 1.794-4 4s1.794 4 4 4 4-1.794 4-4-1.794-4-4-4z" fill="currentColor"/>
                </svg>
              </div>
              <div className="brand-text">
                <div className="kakao-badge">KHAYISA</div>
                <h1>케이크 컬렉션</h1>
              </div>
            </div>
            
            <p className="subtitle">정성스럽게 만든 프리미엄 케이크</p>
          </div>
        </section>

        {/* Search and Filter Section */}
        <section className="card filter-section">
          <div className="search-bar">
            <div className="search-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="search-icon">
                <path d="M19 19l-4.35-4.35M17 9A8 8 0 1 1 1 9a8 8 0 0 1 16 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <input 
                type="text" 
                placeholder="케이크 검색" 
                className="search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn kakao-primary search-btn">검색</button>
          </div>
          
          <div className="filter-tabs">
            {filterTabs.map((tab) => (
              <button 
                key={tab}
                className={`filter-tab ${activeFilter === tab ? 'active' : ''}`}
                onClick={() => setActiveFilter(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {/* Products Grid */}
        <section className="products-section">
          <div className="products-header">
            <h2>인기 상품</h2>
            <div className="sort-options">
              <select className="sort-select">
                <option>인기순</option>
                <option>가격 낮은순</option>
                <option>가격 높은순</option>
              </select>
            </div>
          </div>

          <div className="products-grid">
            {loading ? (
              <SkeletonGrid count={6} />
            ) : filteredProducts.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">🔍</div>
                <h3>검색 결과가 없습니다</h3>
                <p>다른 검색어를 시도해보세요</p>
              </div>
            ) : (
              filteredProducts.map((product) => (
              <div key={product.id} className="product-card">
                <div 
                  className="product-image"
                  onClick={() => navigate(`/product/${product.id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <img src={product.image} alt={product.name} loading="lazy" />
                  {product.badge && (
                    <div className={`product-badge ${product.badge === 'NEW' ? 'new' : ''}`}>
                      {product.badge}
                    </div>
                  )}
                </div>
                <div className="product-info">
                  <h3 
                    className="product-name"
                    onClick={() => navigate(`/product/${product.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    {product.name}
                  </h3>
                  <p className="product-description">{product.description}</p>
                  <div className="product-rating">
                    <span className="rating-text">{product.rating} ({product.reviewCount})</span>
                  </div>
                  <div className="product-price">
                    <span className="price">₩{formatPrice(product.price)}</span>
                    {product.originalPrice && (
                      <span className="original-price">₩{formatPrice(product.originalPrice)}</span>
                    )}
                  </div>
                  <button 
                    className="btn kakao-primary add-to-cart"
                    onClick={() => handleAddToCart(product)}
                  >
                    장바구니 담기
                  </button>
                </div>
              </div>
              ))
            )}
          </div>
        </section>

        <div className="demo-note">
          <a className="link" href="/">메인 페이지 보기</a> · 
          <a className="link" href="/cart">장바구니 페이지 보기</a> · 
          <a className="link" href="/product-edit">관리자 상품 수정</a> · 
          <a className="link" href="/product-delete">관리자 상품 삭제</a>
        </div>
      </main>
    </div>
  );
};

export default CakesPage;
