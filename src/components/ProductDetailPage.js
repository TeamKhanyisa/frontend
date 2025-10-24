import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../contexts/CartContext';
import Background from './Background';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState('1호 (4-6인분)');
  const [selectedFlavor, setSelectedFlavor] = useState('딸기');
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [activeTab, setActiveTab] = useState('info');

  // 샘플 상품 데이터
  const sampleProducts = {
    1: {
      id: 1,
      name: '딸기 생크림 케이크',
      price: 35000,
      originalPrice: 42000,
      discount: 17,
      rating: 4.9,
      reviewCount: 127,
      description: '신선한 딸기와 부드러운 생크림의 완벽한 조화를 이룬 프리미엄 케이크입니다. 매일 아침 수확한 딸기와 정성스럽게 휘핑한 생크림으로 만들어져 더욱 신선하고 맛있습니다.',
      images: [
        '/images/strawberry-cake.svg',
        '/images/strawberry-cake.svg',
        '/images/strawberry-cake.svg',
        '/images/strawberry-cake.svg'
      ],
      features: [
        { icon: '🍓', title: '신선한 딸기', desc: '매일 아침 수확한 신선한 딸기 사용' },
        { icon: '🥛', title: '프리미엄 생크림', desc: '정성스럽게 휘핑한 고급 생크림' },
        { icon: '🏠', title: '수제 제작', desc: '경험 많은 셰프의 손으로 정성스럽게 제작' }
      ],
      details: {
        ingredients: '딸기, 생크림, 밀가루, 설탕, 계란, 버터',
        allergens: '밀, 계란, 우유 함유',
        storage: '냉장 보관, 3일 이내 섭취 권장',
        manufacturing: '주문일 기준 당일 제작'
      },
      nutrition: {
        calories: '320kcal',
        carbs: '45g',
        protein: '6g',
        fat: '12g'
      }
    },
    2: {
      id: 2,
      name: '초콜릿 무스 케이크',
      price: 45000,
      originalPrice: 50000,
      discount: 10,
      rating: 4.8,
      reviewCount: 89,
      description: '진한 초콜릿의 깊은 맛과 부드러운 무스의 조화를 이룬 프리미엄 케이크입니다.',
      images: [
        '/images/chocolate-cake.svg',
        '/images/chocolate-cake.svg',
        '/images/chocolate-cake.svg',
        '/images/chocolate-cake.svg'
      ],
      features: [
        { icon: '🍫', title: '프리미엄 초콜릿', desc: '벨기에산 고급 초콜릿 사용' },
        { icon: '🥛', title: '부드러운 무스', desc: '정성스럽게 휘핑한 초콜릿 무스' },
        { icon: '🏠', title: '수제 제작', desc: '경험 많은 셰프의 손으로 정성스럽게 제작' }
      ],
      details: {
        ingredients: '초콜릿, 생크림, 밀가루, 설탕, 계란, 버터',
        allergens: '밀, 계란, 우유, 견과류 함유',
        storage: '냉장 보관, 3일 이내 섭취 권장',
        manufacturing: '주문일 기준 당일 제작'
      },
      nutrition: {
        calories: '380kcal',
        carbs: '42g',
        protein: '8g',
        fat: '18g'
      }
    },
    3: {
      id: 3,
      name: '뉴욕 치즈케이크',
      price: 28000,
      originalPrice: 32000,
      discount: 12,
      rating: 4.7,
      reviewCount: 156,
      description: '뉴욕 스타일의 진한 치즈케이크로 부드럽고 진한 맛을 자랑합니다.',
      images: [
        '/images/cheesecake.svg',
        '/images/cheesecake.svg',
        '/images/cheesecake.svg',
        '/images/cheesecake.svg'
      ],
      features: [
        { icon: '🧀', title: '프리미엄 치즈', desc: '뉴욕산 고급 크림치즈 사용' },
        { icon: '🍪', title: '바삭한 크러스트', desc: '정성스럽게 만든 그레이엄 크래커' },
        { icon: '🏠', title: '수제 제작', desc: '경험 많은 셰프의 손으로 정성스럽게 제작' }
      ],
      details: {
        ingredients: '크림치즈, 그레이엄 크래커, 설탕, 계란, 버터',
        allergens: '밀, 계란, 우유 함유',
        storage: '냉장 보관, 5일 이내 섭취 권장',
        manufacturing: '주문일 기준 당일 제작'
      },
      nutrition: {
        calories: '350kcal',
        carbs: '38g',
        protein: '10g',
        fat: '15g'
      }
    },
    4: {
      id: 4,
      name: '클래식 티라미수',
      price: 32000,
      originalPrice: 38000,
      discount: 16,
      rating: 4.9,
      reviewCount: 203,
      description: '이탈리아 전통 레시피로 만든 진짜 티라미수입니다.',
      images: [
        '/images/tiramisu.svg',
        '/images/tiramisu.svg',
        '/images/tiramisu.svg',
        '/images/tiramisu.svg'
      ],
      features: [
        { icon: '☕', title: '프리미엄 커피', desc: '이탈리아산 에스프레소 사용' },
        { icon: '🧀', title: '마스카포네 치즈', desc: '정성스럽게 휘핑한 마스카포네' },
        { icon: '🏠', title: '수제 제작', desc: '경험 많은 셰프의 손으로 정성스럽게 제작' }
      ],
      details: {
        ingredients: '마스카포네, 에스프레소, 레이디핑거, 설탕, 계란',
        allergens: '밀, 계란, 우유, 알코올 함유',
        storage: '냉장 보관, 4일 이내 섭취 권장',
        manufacturing: '주문일 기준 당일 제작'
      },
      nutrition: {
        calories: '290kcal',
        carbs: '35g',
        protein: '7g',
        fat: '14g'
      }
    }
  };

  useEffect(() => {
    const productId = parseInt(id);
    if (sampleProducts[productId]) {
      setProduct(sampleProducts[productId]);
    }
    setLoading(false);
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
      alert('장바구니에 추가되었습니다!');
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
            <div className="loading">상품 정보를 불러오는 중...</div>
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
              <img src={product.images[selectedImage]} alt={product.name} />
              <div className="product-badge">BEST</div>
              <button className="btn-icon gallery-zoom">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M19 19l-4.35-4.35M17 9A8 8 0 1 1 1 9a8 8 0 0 1 16 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="thumbnail-gallery">
              {product.images.map((image, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={image} alt={`${product.name} ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>

          <div className="product-info">
            <div className="product-header">
              <h1 className="product-title">{product.name}</h1>
              <div className="product-rating">
                <div className="stars">★★★★★</div>
                <span className="rating-text">{product.rating} ({product.reviewCount}개 리뷰)</span>
                <a href="#reviews" className="review-link">리뷰 보기</a>
              </div>
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
                <span className="original-price">₩{formatPrice(product.originalPrice)}</span>
                <span className="discount-badge">{product.discount}% 할인</span>
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
              {product.features.map((feature, index) => (
                <div key={index} className="feature-item">
                  <div className="feature-icon">{feature.icon}</div>
                  <div className="feature-text">
                    <h4>{feature.title}</h4>
                    <p>{feature.desc}</p>
                  </div>
                </div>
              ))}
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
              리뷰 ({product.reviewCount})
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
                    <span className="detail-label">원재료</span>
                    <span className="detail-value">{product.details.ingredients}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">알레르기 정보</span>
                    <span className="detail-value">{product.details.allergens}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">보관 방법</span>
                    <span className="detail-value">{product.details.storage}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">제조일</span>
                    <span className="detail-value">{product.details.manufacturing}</span>
                  </div>
                </div>
                
                <div className="nutrition-info">
                  <h4>영양 정보 (100g 기준)</h4>
                  <div className="nutrition-grid">
                    <div className="nutrition-item">
                      <span>칼로리</span>
                      <span>{product.nutrition.calories}</span>
                    </div>
                    <div className="nutrition-item">
                      <span>탄수화물</span>
                      <span>{product.nutrition.carbs}</span>
                    </div>
                    <div className="nutrition-item">
                      <span>단백질</span>
                      <span>{product.nutrition.protein}</span>
                    </div>
                    <div className="nutrition-item">
                      <span>지방</span>
                      <span>{product.nutrition.fat}</span>
                    </div>
                  </div>
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

