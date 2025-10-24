import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';
import { productAPI } from '../utils/api';

const ProductDeletePage = () => {
  // 임시 상품 데이터 (나중에 백엔드에서 가져올 데이터)
  const [products, setProducts] = useState([
    { id: 1, name: '딸기 생크림 케이크', price: 35000, stock: 15, image: 'https://i.pinimg.com/1200x/ad/62/12/ad6212628fa7ca2851db2f90bef2bf58.jpg', status: '판매중' },
    { id: 2, name: '초콜릿 무스 케이크', price: 45000, stock: 8, image: 'https://i.pinimg.com/736x/65/b5/19/65b519ed94b29e7e92c22fe7c6e3ecef.jpg', status: '판매중' },
    { id: 3, name: '뉴욕 치즈케이크', price: 28000, stock: 0, image: 'https://i.pinimg.com/474x/12/45/00/124500c8574e4b3ac1655fe44758a139.jpg', status: '품절' }
  ]);

  const [selectedProducts, setSelectedProducts] = useState([]);

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map(p => p.id));
    }
  };

  const handleSelectProduct = (id) => {
    if (selectedProducts.includes(id)) {
      setSelectedProducts(selectedProducts.filter(pid => pid !== id));
    } else {
      setSelectedProducts([...selectedProducts, id]);
    }
  };

  // 백엔드에서 상품 목록 가져오기 (쿠키 자동 포함)
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productAPI.getProducts();
        setProducts(data);
      } catch (error) {
        console.error('상품 목록 조회 실패:', error);
        // 에러 시 기본 데이터 유지
      }
    };
    
    fetchProducts();
  }, []);

  const handleDelete = async () => {
    if (selectedProducts.length === 0) {
      alert('삭제할 상품을 선택해주세요.');
      return;
    }

    if (window.confirm(`선택한 ${selectedProducts.length}개의 상품을 삭제하시겠습니까?`)) {
      try {
        // 백엔드 API 호출 (쿠키 자동 포함)
        await productAPI.bulkDeleteProducts(selectedProducts);
        
        console.log('삭제 성공:', selectedProducts);
        
        // 프론트엔드에서도 삭제
        setProducts(products.filter(p => !selectedProducts.includes(p.id)));
        setSelectedProducts([]);
        alert('상품이 삭제되었습니다!');
        
      } catch (error) {
        console.error('상품 삭제 실패:', error);
        alert(`상품 삭제 실패: ${error.message}`);
      }
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
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
                <h1>상품 삭제</h1>
              </div>
            </div>
            
            <p className="subtitle">삭제할 상품을 선택하세요</p>
          </div>
        </section>

        {/* Product List */}
        <section className="card">
          <div className="delete-header">
            <h2>상품 목록</h2>
            <button className="select-all-btn" onClick={handleSelectAll}>
              {selectedProducts.length === products.length ? '전체 해제' : '전체 선택'}
            </button>
          </div>

          <div className="product-list">
            {products.map((product) => (
              <div key={product.id} className="product-item">
                <div className="product-checkbox">
                  <input 
                    type="checkbox" 
                    id={`product${product.id}`}
                    checked={selectedProducts.includes(product.id)}
                    onChange={() => handleSelectProduct(product.id)}
                  />
                  <label htmlFor={`product${product.id}`}></label>
                </div>
                <img src={product.image} alt={product.name} />
                <div className="product-info">
                  <h3>{product.name}</h3>
                  <p>₩{formatPrice(product.price)} • 재고: {product.stock}개</p>
                </div>
                <div className="product-status">
                  <span className={`status-badge ${product.status === '판매중' ? 'active' : ''}`}>
                    {product.status}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="delete-actions">
            <button className="btn secondary" onClick={() => window.history.back()}>취소</button>
            <button className="btn error" onClick={handleDelete}>
              선택한 상품 삭제 ({selectedProducts.length})
            </button>
          </div>
        </section>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/product-register" className="link">상품 등록 보기</Link> · 
          <Link to="/product-edit" className="link">상품 수정 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default ProductDeletePage;
