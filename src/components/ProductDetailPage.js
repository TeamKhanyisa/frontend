import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Background from './Background';
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';
import { productAPI } from '../utils/api';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toasts, showSuccess, removeToast } = useToast();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('1호 (4-6인분)');
  const [selectedFlavor, setSelectedFlavor] = useState('딸기');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('info');

  // 백엔드에서 상품 정보 가져오기
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const productData = await productAPI.getProduct(id);
        
        if (productData) {
          // 이미지가 없을 경우 기본 이미지 설정
          const productImage = productData.image || (productData.id === 1 
            ? '/images/strawberry-cake.svg' 
            : productData.id === 2 
            ? '/images/chocolate-cake.svg' 
            : '/images/placeholder.svg');
          
          // 백엔드 데이터를 프론트엔드 형식에 맞게 변환
          setProduct({
            ...productData,
            image: productImage,
            originalPrice: productData.originalPrice || productData.original_price,
            discount: productData.discountPercentage || 0,
          });
        }
      } catch (error) {
        console.error('상품 정보 조회 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  const handleQuantityChange = (change) => {
    const newQuantity = quantity + change;
    if (newQuantity >= 1) {
      setQuantity(newQuantity);
    }
  };

  const handleAddToCart = () => {
    if (product) {
      addToCart({
        ...product,
        quantity,
        selectedSize,
        selectedFlavor
      });
      showSuccess('장바구니에 추가되었습니다! ✨', 2500);
    }
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  if (loading) {
    return (
      <div className="App">
        <Background />
        <main className="container">
          <section className="card">
            <div className="loading-skeleton">
              <div className="skeleton-image-large"></div>
              <div className="skeleton-content-large">
                <div className="skeleton-line skeleton-title-large"></div>
                <div className="skeleton-line skeleton-description-large"></div>
                <div className="skeleton-line skeleton-price-large"></div>
              </div>
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="App">
        <Background />
        <main className="container">
          <section className="card">
            <div className="error">상품을 찾을 수 없습니다.</div>
            <Link to="/cakes" className="btn kakao-primary">상품 목록으로 돌아가기</Link>
          </section>
        </main>
      </div>
    );
  }

  return (
    <div className="App">
      <Background />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
      <main className="container">
        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb">
          <Link to="/cakes" className="breadcrumb-link">케이크 컬렉션</Link>
          <span className="breadcrumb-separator">></span>
          <span className="breadcrumb-current">{product.name}</span>
        </nav>

        {/* Product Detail Section */}
        <section className="product-detail">
          <div className="product-gallery">
            <div className="main-image">
              <img 
                src={product.image || '/images/placeholder.svg'} 
                alt={product.name}
                onError={(e) => {
                  // 이미지 로드 실패 시 기본 이미지로 대체
                  if (product.id === 1) {
                    e.target.src = '/images/strawberry-cake.svg';
                  } else if (product.id === 2) {
                    e.target.src = '/images/chocolate-cake.svg';
                  } else {
                    e.target.src = '/images/placeholder.svg';
                  }
                }}
              />
              {(product.isFeatured || product.is_featured) && (
                <div className="product-badge">BEST</div>
              )}
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              {(product.isFeatured || product.is_featured) && (
                <div className="product-rating">
                  <div className="stars">★★★★★</div>
                  <span className="rating-text">인기 상품</span>
                </div>
              )}
            </div>

            <div className="product-description">
              <p>{product.description}</p>
            </div>

            <div className="product-specs">
              <div className="spec-item">
                <span className="spec-label">크기</span>
                <div className="spec-options">
                  {['1호 (4-6인분)', '2호 (8-10인분)', '3호 (12-15인분)'].map((size) => (
                    <button 
                      key={size}
                      className={`spec-option ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
              <div className="spec-item">
                <span className="spec-label">맛</span>
                <div className="spec-options">
                  {['딸기', '바닐라', '초콜릿'].map((flavor) => (
                    <button 
                      key={flavor}
                      className={`spec-option ${selectedFlavor === flavor ? 'active' : ''}`}
                      onClick={() => setSelectedFlavor(flavor)}
                    >
                      {flavor}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="product-price-section">
              <div className="price-info">
                <span className="current-price">₩{formatPrice(product.price)}</span>
                {((product.originalPrice || product.original_price) && (product.originalPrice || product.original_price) > product.price) && (
                  <>
                    <span className="original-price">₩{formatPrice(product.originalPrice || product.original_price)}</span>
                    <span className="discount-badge">{product.discountPercentage || Math.round(((product.originalPrice || product.original_price) - product.price) / (product.originalPrice || product.original_price) * 100)}% 할인</span>
                  </>
                )}
              </div>
              <div className="delivery-info">
                <div className="delivery-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" fill="currentColor"/>
                  </svg>
                  <span>무료배송</span>
                </div>
                <div className="delivery-item">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M8 0C3.589 0 0 3.589 0 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="currentColor"/>
                  </svg>
                  <span>당일 제작</span>
                </div>
              </div>
            </div>

            <div className="product-actions">
              <div className="quantity-selector">
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(-1)}
                >
                  -
                </button>
                <span className="quantity">{quantity}</span>
                <button 
                  className="quantity-btn"
                  onClick={() => handleQuantityChange(1)}
                >
                  +
                </button>
              </div>
              <button 
                className="btn kakao-primary add-to-cart-large"
                onClick={handleAddToCart}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M7 4V2C7 1.45 7.45 1 8 1H12C12.55 1 13 1.45 13 2V4H16C16.55 4 17 4.45 17 5S16.55 6 16 6H15V15C15 16.1 14.1 17 13 17H7C5.9 17 5 16.1 5 15V6H4C3.45 6 3 5.55 3 5S3.45 4 4 4H7ZM9 3V4H11V3H9ZM6 6V15C6 15.55 6.45 16 7 16H13C13.55 16 14 15.55 14 15V6H6Z" fill="currentColor"/>
                </svg>
                장바구니 담기
              </button>
              <button 
                className="btn secondary buy-now"
                onClick={handleBuyNow}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
                  <path d="M10 4c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="currentColor"/>
                </svg>
                바로 구매
              </button>
            </div>

            <div className="product-features">
              <div className="feature-item">
                <div className="feature-icon">🍰</div>
                <div className="feature-text">
                  <h4>신선한 재료</h4>
                  <p>매일 아침 신선한 재료로 제작합니다</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">🏠</div>
                <div className="feature-text">
                  <h4>수제 제작</h4>
                  <p>경험 많은 셰프의 손으로 정성스럽게 제작합니다</p>
                </div>
              </div>
              <div className="feature-item">
                <div className="feature-icon">📦</div>
                <div className="feature-text">
                  <h4>무인 매장</h4>
                  <p>24시간 언제든지 주문 가능합니다</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Product Details Tabs */}
        <section className="product-tabs">
          <div className="tab-navigation">
            <button 
              className={`tab-btn ${activeTab === 'info' ? 'active' : ''}`}
              onClick={() => setActiveTab('info')}
            >
              상품 정보
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              리뷰
            </button>
            <button 
              className={`tab-btn ${activeTab === 'shipping' ? 'active' : ''}`}
              onClick={() => setActiveTab('shipping')}
            >
              배송/교환
            </button>
            <button 
              className={`tab-btn ${activeTab === 'inquiry' ? 'active' : ''}`}
              onClick={() => setActiveTab('inquiry')}
            >
              문의하기
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'info' && (
              <div className="tab-panel active">
                <h3>상품 상세 정보</h3>
                <div className="detail-grid">
                  <div className="detail-item">
                    <span className="detail-label">카테고리</span>
                    <span className="detail-value">{product.category}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">재고</span>
                    <span className="detail-value">{product.stock}개</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">보관 방법</span>
                    <span className="detail-value">냉장 보관, 3일 이내 섭취 권장</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">제조일</span>
                    <span className="detail-value">주문일 기준 당일 제작</span>
                  </div>
                </div>
                
                <div className="nutrition-info">
                  <h4>상품 설명</h4>
                  <p>{product.description}</p>
                </div>
              </div>
            )}
          </div>
        </section>

        <div className="demo-note">
          <Link to="/cakes" className="link">케이크 목록 보기</Link> · 
          <Link to="/cart" className="link">장바구니 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;






