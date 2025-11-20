import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Background from './Background';
import { productAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  
  // 상품 목록 및 선택 상태
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState(id || '');

  // 임시 상품 데이터 (나중에 백엔드에서 가져올 데이터)
  const [formData, setFormData] = useState({
    name: '딸기 생크림 케이크',
    category: 'birthday',
    price: '35000',
    originalPrice: '',
    stock: '15',
    description: '신선한 딸기와 부드러운 생크림의 완벽한 조화'
  });

  const [imagePreview, setImagePreview] = useState('https://via.placeholder.com/200x150.png?text=Strawberry+Cake');
  const [imageFile, setImageFile] = useState(null);

  // 상품 목록 불러오기
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const list = await productAPI.getProducts();
        setProducts(Array.isArray(list) ? list : []);
      } catch (error) {
        console.error('상품 목록 조회 실패:', error);
        setProducts([]);
      }
    };
    fetchProducts();
  }, []);

  // role 체크: admin이 아니면 접근 차단
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // 선택된 상품 정보 가져오기 (URL 파라미터 또는 선택값 기준)
  useEffect(() => {
    const fetchProduct = async () => {
      const effectiveId = selectedProductId || id;
      if (effectiveId) {
        try {
          const product = await productAPI.getProduct(effectiveId);
          if (product) {
            setFormData({
              name: product.name || '',
              category: product.category || 'birthday',
              price: product.price?.toString() || '',
              originalPrice: (product.originalPrice || product.original_price)?.toString() || '',
              stock: product.stock?.toString() || '',
              description: product.description || ''
            });
            if (product.image) {
              setImagePreview(product.image);
            }
          }
        } catch (error) {
          console.error('상품 정보 조회 실패:', error);
          // 에러 시 기본 데이터 유지
        }
      }
      // id가 없으면 기본 데이터 유지 (새 상품처럼 작동)
    };
    fetchProduct();
  }, [id, selectedProductId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const effectiveId = selectedProductId || id;
    if (!effectiveId) {
      alert('상품 ID가 필요합니다. 상품 목록에서 수정할 상품을 선택해주세요.');
      navigate('/product-delete');
      return;
    }
    
    try {
      // FormData 생성
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('category', formData.category);
      productData.append('price', formData.price);
      if (formData.originalPrice) {
        productData.append('originalPrice', formData.originalPrice);
      }
      productData.append('stock', formData.stock);
      productData.append('description', formData.description);
      
      // 이미지 파일이 있으면 추가
      if (imageFile) {
        productData.append('image', imageFile);
      }
      
      // 백엔드 API 호출 (쿠키 자동 포함)
      await productAPI.updateProduct(effectiveId, productData);
      
      alert('상품이 수정되었습니다!');
      navigate('/cakes');
      
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert(`상품 수정 실패: ${error.message || '알 수 없는 오류가 발생했습니다.'}`);
    }
  };

  // admin이 아니면 아무것도 렌더링하지 않음
  if (loading) {
    return (
      <div className="App">
        <Background />
        <main className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        </main>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="App">
      <Background />
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
                <h1>상품 수정</h1>
              </div>
            </div>
            
            <p className="subtitle">기존 상품 정보를 수정하세요</p>
          </div>
        </section>

        {/* Product Form */}
        <section className="card">
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">수정할 상품 선택 *</label>
                <select
                  className="form-input"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">상품을 선택하세요</option>
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">상품명</label>
                <input
                  type="text"
                  className="form-input"
                  name="name"
                  value={formData.name}
                  disabled
                />
              </div>
              <div className="form-group">
                <label className="form-label">카테고리</label>
                <select 
                  className="form-input" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="birthday">생일케이크</option>
                  <option value="wedding">웨딩케이크</option>
                  <option value="dessert">디저트</option>
                  <option value="seasonal">시즌한정</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">가격</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">원가 (할인 표시용, 선택사항)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="할인 전 가격"
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">재고 수량</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  required 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">상품 설명</label>
              <textarea 
                className="form-input" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label className="form-label">상품 이미지</label>
              <div className="image-preview">
                <img src={imagePreview} alt="현재 이미지" />
                <input 
                  type="file" 
                  id="image-change"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-change" className="btn secondary change-image-btn">
                  이미지 변경
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button 
                type="button" 
                className="btn secondary" 
                onClick={() => navigate('/cakes')}
              >
                취소
              </button>
              <button type="submit" className="btn kakao-primary">수정 완료</button>
            </div>
          </form>
        </section>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/product-register" className="link">상품 등록 보기</Link> · 
          <Link to="/product-delete" className="link">상품 삭제 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default ProductEditPage;
