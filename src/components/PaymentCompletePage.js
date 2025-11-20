import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Background from './Background';

const PaymentCompletePage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { payments = [], totalAmount = 0 } = location.state || {};

  const formatPrice = (price) => {
    return new Intl.NumberFormat('ko-KR').format(price);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getStatusLabel = (status) => {
    const statusMap = {
      'PAID': '결제완료',
      'PENDING': '결제대기',
      'FAILED': '결제실패',
      'CANCELLED': '결제취소'
    };
    return statusMap[status] || status;
  };

  // state가 없으면 장바구니로 리다이렉트
  React.useEffect(() => {
    if (!location.state || !payments || payments.length === 0) {
      navigate('/cart');
    }
  }, [location.state, payments, navigate]);

  if (!location.state || !payments || payments.length === 0) {
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
                <h1>결제 완료</h1>
              </div>
            </div>
            
            <p className="subtitle">결제가 성공적으로 완료되었습니다</p>
          </div>
        </section>

        {/* Success Message */}
        <section className="card">
          <div className="payment-success">
            <div className="success-icon">✓</div>
            <h2>결제가 완료되었습니다!</h2>
            <p className="success-message">주문해주셔서 감사합니다.</p>
          </div>
        </section>

        {/* Payment Details */}
        <section className="card">
          <h2 className="section-title">결제 내역</h2>
          
          <div className="payment-details">
            {payments.map((payment, index) => (
              <div key={payment.paymentId || payment.id || index} className="payment-item">
                <div className="payment-item-header">
                  <div className="payment-item-title-section">
                    <h3 className="payment-item-title">
                      {payment.productName || `상품 ${index + 1}`}
                    </h3>
                    {payment.status && (
                      <span className={`status-badge ${payment.status.toLowerCase()}`}>
                        {getStatusLabel(payment.status)}
                      </span>
                    )}
                  </div>
                  {payment.paymentId && (
                    <div className="payment-id-section">
                      <span className="payment-id-label">결제번호</span>
                      <span className="payment-id-value">{payment.paymentId}</span>
                    </div>
                  )}
                </div>

                <div className="payment-item-body">
                  <div className="payment-info-grid">
                    {payment.productId && (
                      <div className="payment-info-item">
                        <span className="info-label">상품 ID</span>
                        <span className="info-value">{payment.productId}</span>
                      </div>
                    )}
                    {payment.quantity !== undefined && (
                      <div className="payment-info-item">
                        <span className="info-label">수량</span>
                        <span className="info-value">{payment.quantity}개</span>
                      </div>
                    )}
                    {payment.createdAt && (
                      <div className="payment-info-item">
                        <span className="info-label">결제일시</span>
                        <span className="info-value">{formatDate(payment.createdAt)}</span>
                      </div>
                    )}
                  </div>

                  {payment.amount && (
                    <div className="payment-item-amount-section">
                      <span className="amount-label">결제 금액</span>
                      <span className="amount-value">₩{formatPrice(payment.amount)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="payment-total">
            <div className="total-row">
              <span className="total-label">총 결제 금액</span>
              <span className="total-amount">₩{formatPrice(totalAmount)}</span>
            </div>
          </div>
        </section>

        {/* Face Registration CTA */}
        <section className="card face-registration-cta">
          <div className="face-registration-content">
            <div className="face-registration-icon">👤</div>
            <h2 className="face-registration-title">픽업을 위해 얼굴을 등록해주세요</h2>
            <p className="face-registration-message">
              등록하신 얼굴로 간편하게 픽업하실 수 있습니다
            </p>
            <Link to="/face-checkin" className="btn kakao-primary face-registration-btn">
              얼굴 등록하기
            </Link>
          </div>
        </section>

        {/* Action Buttons */}
        <section className="card">
          <div className="payment-actions">
            <Link to="/" className="btn kakao-secondary">
              홈으로 돌아가기
            </Link>
            <Link to="/cakes" className="btn kakao-secondary">
              케이크 더 보기
            </Link>
          </div>
        </section>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/cakes" className="link">케이크 상품 목록 보기</Link> · 
          <Link to="/cart" className="link">장바구니 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default PaymentCompletePage;

