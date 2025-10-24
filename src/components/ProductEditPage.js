import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Background from './Background';
import { productAPI } from '../utils/api';

const ProductEditPage = () => {
  // 임시 상품 데이터 (나중에 백엔드에서 가져올 데이터)
  const [formData, setFormData] = useState({
    id: 1,
    name: '딸기 생크림 케이크',
    category: '생일케이크',
    price: '35000',
    originalPrice: '42000',
    stock: '15',
    description: '신선한 딸기와 부드러운 생크림의 완벽한 조화'
  });

  const [imagePreview, setImagePreview] = useState('/images/strawberry-cake.svg');

  const categories = ['생일케이크', '웨딩케이크', '디저트', '시즌한정'];

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
      
      // 백엔드 API 호출 (쿠키 자동 포함)
      const response = await productAPI.updateProduct(formData.id, productData);
      
      console.log('상품 수정 성공:', response);
      alert('상품이 수정되었습니다!');
      
    } catch (error) {
      console.error('상품 수정 실패:', error);
      alert(`상품 수정 실패: ${error.message}`);
    }
  };

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
                <label className="form-label">상품명 *</label>
                <input 
                  type="text" 
                  className="form-input" 
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
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
              />
            </div>

            <div className="form-group">
              <label className="form-label">상품 이미지</label>
              <div className="image-upload">
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
            </div>

            <div className="form-actions">
              <button type="button" className="btn secondary" onClick={() => window.history.back()}>취소</button>
              <button type="submit" className="btn kakao-primary">수정 완료</button>
            </div>
          </form>
        </section>

        <div className="demo-note">
          <a className="link" href="/">메인 페이지 보기</a> · 
          <a className="link" href="/product-register">상품 등록 보기</a> · 
          <a className="link" href="/product-delete">상품 삭제 보기</a>
        </div>
      </main>
    </div>
  );
};

export default ProductEditPage;
