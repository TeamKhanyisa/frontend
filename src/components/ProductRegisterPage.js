import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from './Background';
import { productAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const ProductRegisterPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    originalPrice: '',
    stock: '',
    description: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);

  const categories = ['생일케이크', '웨딩케이크', '디저트', '시즌한정'];

  // role 체크: admin이 아니면 접근 차단
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

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
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      
      // 이미지 미리보기
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // FormData 생성
      const productData = new FormData();
      productData.append('name', formData.name);
      productData.append('category', formData.category);
      productData.append('price', formData.price);
      productData.append('originalPrice', formData.originalPrice || '0');
      productData.append('stock', formData.stock);
      productData.append('description', formData.description);
      if (formData.image) {
        productData.append('image', formData.image);
      }
      
      // 백엔드 API 호출 (쿠키 자동 포함)
      const response = await productAPI.createProduct(productData);
      
      console.log('상품 등록 성공:', response);
      alert('상품이 등록되었습니다!');
      
      // 폼 초기화
      setFormData({
        name: '',
        category: '',
        price: '',
        originalPrice: '',
        stock: '',
        description: '',
        image: null
      });
      setImagePreview(null);
      
    } catch (error) {
      console.error('상품 등록 실패:', error);
      const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류가 발생했습니다.';
      alert(`상품 등록 실패: ${errorMessage}`);
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
                <h1>상품 등록</h1>
              </div>
            </div>
            
            <p className="subtitle">새로운 케이크 상품을 등록하세요</p>
          </div>
        </section>

        {/* Product Form */}
        <section className="card">
          <form className="product-form" onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label className="form-label">상품명 *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="상품명을 입력하세요" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">카테고리 *</label>
                <select 
                  className="form-input" 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">카테고리 선택</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label className="form-label">판매가 *</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="판매가를 입력하세요" 
                  required 
                />
              </div>
              <div className="form-group">
                <label className="form-label">정가</label>
                <input 
                  type="number" 
                  className="form-input" 
                  name="originalPrice"
                  value={formData.originalPrice}
                  onChange={handleChange}
                  placeholder="정가를 입력하세요" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">재고 수량 *</label>
              <input 
                type="number" 
                className="form-input" 
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                placeholder="재고 수량을 입력하세요" 
                required 
              />
            </div>

            <div className="form-group">
              <label className="form-label">상품 설명</label>
              <textarea 
                className="form-input" 
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3" 
                placeholder="상품에 대한 설명을 입력하세요"
              />
            </div>

            <div className="form-group">
              <label className="form-label">상품 이미지</label>
              <div className="image-upload">
                <input 
                  type="file" 
                  id="image-upload"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
                <label htmlFor="image-upload" className="upload-area">
                  {imagePreview ? (
                    <div className="image-preview">
                      <img src={imagePreview} alt="미리보기" />
                    </div>
                  ) : (
                    <>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <polyline points="7,10 12,15 17,10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <p>이미지를 드래그하거나 클릭하여 업로드</p>
                      <span className="upload-hint">JPG, PNG, WebP 형식 지원 (최대 10MB)</span>
                    </>
                  )}
                </label>
              </div>
            </div>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => window.history.back()}>취소</button>
              <button type="submit" className="btn kakao-primary">상품 등록</button>
            </div>
          </form>
        </section>

        <div className="demo-note">
          <a className="link" href="/">메인 페이지 보기</a> · 
          <a className="link" href="/cakes">상품 목록 보기</a>
        </div>
      </main>
    </div>
  );
};

export default ProductRegisterPage;
