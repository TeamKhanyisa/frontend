import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { productAPI } from '../utils/api';
import { SkeletonGrid } from './SkeletonLoader';

const FeaturedProducts = () => {
  const navigate = useNavigate();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeaturedProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getFeaturedProducts(4);
        if (data && data.data) {
          setFeaturedProducts(data.data);
        } else if (Array.isArray(data)) {
          setFeaturedProducts(data);
        }
      } catch (error) {
        console.error('인기 상품 조회 실패:', error);
        // 기본 데이터 사용
        setFeaturedProducts([
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
          },
          {
            id: 3,
            name: '뉴욕 치즈케이크',
            description: '진짜 뉴욕의 맛, 진한 치즈',
            price: 28000,
            rating: 4.3,
            reviewCount: 156,
            image: 'https://i.pinimg.com/474x/12/45/00/124500c8574e4b3ac1655fe44758a139.jpg',
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
          },
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedProducts();
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  return (
    <section className="card featured-section">
      <div className="section-header">
        <div className="section-title-group">
          <h2 className="section-title">인기 상품</h2>
          <p className="section-subtitle">지금 가장 사랑받는 케이크들을 만나보세요</p>
        </div>
        <Link to="/cakes" className="btn section-link-btn">
          전체 보기
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M6 12l4-4-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
      </div>

      {loading ? (
        <SkeletonGrid count={4} />
      ) : (
        <div className="featured-products-grid">
          {featuredProducts.map((product) => (
            <div
              key={product.id}
              className="featured-product-card"
              onClick={() => navigate(`/product/${product.id}`)}
            >
              <div className="featured-product-image">
                <img src={product.image || product.images?.[0]} alt={product.name} loading="lazy" />
                {product.badge && (
                  <div className={`featured-product-badge ${product.badge === 'NEW' ? 'new' : ''}`}>
                    {product.badge}
                  </div>
                )}
                <div className="featured-product-overlay">
                  <div className="featured-product-rating">
                    <span className="rating-star">⭐</span>
                    <span className="rating-value">{product.rating || product.rating_average || 4.5}</span>
                    <span className="rating-count">({product.reviewCount || product.rating_count || 0})</span>
                  </div>
                </div>
              </div>
              <div className="featured-product-info">
                <h3 className="featured-product-name">{product.name}</h3>
                <p className="featured-product-description">{product.description}</p>
                <div className="featured-product-price">
                  <span className="price">₩{formatPrice(product.price)}</span>
                  {product.originalPrice && (
                    <span className="original-price">₩{formatPrice(product.originalPrice)}</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default FeaturedProducts;



