import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';
import { useCart } from '../contexts/CartContext';
import { useToast } from '../hooks/useToast';
import ToastContainer from './ToastContainer';

const CartPage = () => {
  const { items: cartItems, removeFromCart, updateQuantity, getTotalPrice, getTotalItems } = useCart();
  const { toasts, showSuccess, showError, removeToast } = useToast();
  const [selectedItems, setSelectedItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');

  // cartItems가 변경될 때 selectedItems 업데이트
  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      setSelectedItems(cartItems.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  }, [cartItems]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const handleQuantityChange = (id, newQuantity) => {
    if (newQuantity >= 1) {
      updateQuantity(id, newQuantity);
    }
  };

  const handleRemoveItem = (id) => {
    const item = cartItems.find(item => item.id === id);
    removeFromCart(id);
    setSelectedItems(prev => prev.filter(itemId => itemId !== id));
    if (item) {
      showSuccess(`${item.name}이(가) 장바구니에서 제거되었습니다`, 2500);
    }
  };

  const handleItemSelect = (id) => {
    setSelectedItems(prev => 
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === (cartItems || []).length) {
      setSelectedItems([]);
    } else {
      setSelectedItems((cartItems || []).map(item => item.id));
    }
  };

  const getSelectedTotal = () => {
    return (cartItems || [])
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const selectedTotal = getSelectedTotal();
  const finalPrice = selectedTotal;

  return (
    <div className="App">
      <Background />
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      
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
                <h1>장바구니</h1>
              </div>
            </div>
            
            <p className="subtitle">선택하신 상품들을 확인해보세요</p>
          </div>
        </section>

        {/* Cart Content */}
        <div className="cart-layout">
          {/* Cart Items */}
          <section className="cart-items">
            <div className="cart-header">
              <h2>장바구니 상품 ({getTotalItems()}개)</h2>
              <button 
                className="select-all-btn"
                onClick={handleSelectAll}
              >
                {selectedItems.length === (cartItems || []).length ? '전체 해제' : '전체 선택'}
              </button>
            </div>

            {(cartItems || []).length === 0 ? (
              <div className="empty-cart">
                <div className="empty-cart-icon">🛒</div>
                <h3>장바구니가 비어있습니다</h3>
                <p>맛있는 케이크를 추가해보세요!</p>
                <Link to="/cakes" className="btn kakao-primary">
                  케이크 보러가기
                </Link>
              </div>
            ) : (
              (cartItems || []).map((item) => (
                <div key={item.id} className="cart-item">
                  <div className="item-checkbox">
                    <input 
                      type="checkbox" 
                      id={`item${item.id}`} 
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleItemSelect(item.id)}
                    />
                    <label htmlFor={`item${item.id}`}></label>
                  </div>
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  <div className="item-info">
                    <h3 className="item-name">{item.name}</h3>
                    <p className="item-option">옵션: 기본 사이즈</p>
                    <div className="item-price">₩{formatPrice(item.price)}</div>
                  </div>
                  <div className="item-quantity">
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span className="quantity">{item.quantity}</span>
                    <button 
                      className="quantity-btn" 
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  <div className="item-total">₩{formatPrice(item.price * item.quantity)}</div>
                  <button 
                    className="item-remove" 
                    onClick={() => handleRemoveItem(item.id)}
                  >
                    ×
                  </button>
                </div>
              ))
            )}
          </section>

          {/* Order Summary */}
          <section className="order-summary">
            <h2>주문 요약</h2>
            
            <div className="summary-row">
              <span>상품 금액</span>
              <span>₩{formatPrice(selectedTotal)}</span>
            </div>
            
            <div className="summary-divider"></div>
            
            <div className="summary-total">
              <span>총 결제금액</span>
              <span className="total-amount">₩{formatPrice(finalPrice)}</span>
            </div>
            
            <button 
              className="btn kakao-primary checkout-btn"
              disabled={selectedItems.length === 0}
              onClick={() => {
                if (selectedItems.length === 0) {
                  showError('주문할 상품을 선택해주세요', 2500);
                } else {
                  showSuccess('주문이 완료되었습니다! 🎉', 3000);
                }
              }}
            >
              주문하기
            </button>
            
            <div className="payment-methods">
              <h3>결제 수단</h3>
              <div className="payment-options">
                <button 
                  className={`payment-btn ${paymentMethod === 'card' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('card')}
                >
                  카드결제
                </button>
                <button 
                  className={`payment-btn ${paymentMethod === 'transfer' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('transfer')}
                >
                  계좌이체
                </button>
                <button 
                  className={`payment-btn ${paymentMethod === 'simple' ? 'active' : ''}`}
                  onClick={() => setPaymentMethod('simple')}
                >
                  간편결제
                </button>
              </div>
            </div>
          </section>
        </div>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/cakes" className="link">케이크 상품 목록 보기</Link> · 
          <Link to="/checkout" className="link">결제 페이지 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default CartPage;