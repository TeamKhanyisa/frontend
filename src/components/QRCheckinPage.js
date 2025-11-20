import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Background from './Background';
import { qrAPI, paymentAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const QRCheckinPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [qrCodeDataURL, setQrCodeDataURL] = useState(null);
  const [keyInfo, setKeyInfo] = useState(null);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  // QR 코드 생성 함수
  const generateQR = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      // 먼저 사용자의 결제 내역을 조회하여 boxNumber가 0이 아닌 결제건이 있는지 확인
      let payments = [];
      
      try {
        const myPayments = await paymentAPI.getMyPayments({ limit: 100 });
        payments = myPayments?.payments || [];
      } catch (apiError) {
        // API가 없거나 에러가 발생한 경우, QR 생성 API에서 직접 검증하도록 진행
        // 백엔드에서 검증하도록 하거나, 여기서는 경고만 표시
        console.warn('결제 내역 조회 실패, 백엔드에서 검증하도록 진행:', apiError);
      }
      
      // 프론트엔드에서 검증: boxNumber가 0이 아니고 null이 아닌 결제건이 있는지 확인
      const hasValidBoxNumber = payments.length > 0 && payments.some(payment => {
        const boxNumber = payment.boxNumber;
        // boxNumber가 0이 아니고 null/undefined가 아닌 경우만 유효
        return boxNumber !== null && 
               boxNumber !== undefined && 
               boxNumber !== 0;
      });
      
      // 결제 내역이 있고 검증이 실패한 경우에만 에러 표시
      if (payments.length > 0 && !hasValidBoxNumber) {
        setError('박스 번호가 할당된 결제 내역이 없습니다. 관리자가 박스 번호를 할당한 후 QR 코드를 생성할 수 있습니다.');
        setLoading(false);
        return;
      }
      
      // 결제 내역이 없는 경우 (API가 없거나 데이터가 없는 경우)
      // 백엔드에서 검증하도록 QR 생성 요청 진행
      // 백엔드에서도 동일한 검증을 수행해야 함
      
      // QR 코드 생성 요청
      const response = await qrAPI.generatePrivateKeyQR();
      
      // 백엔드에서 검증 실패 시 에러 응답 처리
      if (!response.success) {
        const errorMessage = response.message || 'QR 코드 생성에 실패했습니다.';
        if (errorMessage.includes('박스 번호') || errorMessage.includes('boxNumber')) {
          setError('박스 번호가 할당된 결제 내역이 없습니다. 관리자가 박스 번호를 할당한 후 QR 코드를 생성할 수 있습니다.');
        } else {
          setError(errorMessage);
        }
        setLoading(false);
        return;
      }
      
      if (response.success && response.data) {
        // QR 코드 이미지 URL 저장
        if (response.data.qrCode?.dataURL) {
          setQrCodeDataURL(response.data.qrCode.dataURL);
        }
        
        // 키 정보 저장
        if (response.data.keyInfo) {
          setKeyInfo(response.data.keyInfo);
        }
        
        // 주문 정보 저장
        if (response.data.order) {
          setOrder(response.data.order);
        }
      } else {
        setError('QR 코드 생성에 실패했습니다.');
      }
    } catch (err) {
      console.error('QR code generation error:', err);
      
      // API 에러 처리
      if (err.response?.status === 400 || err.response?.status === 403) {
        // 400 또는 403 에러는 검증 실패로 간주
        const errorMessage = err.response?.data?.message || 'QR 코드 생성 조건을 만족하지 않습니다.';
        if (errorMessage.includes('박스 번호') || errorMessage.includes('boxNumber')) {
          setError('박스 번호가 할당된 결제 내역이 없습니다. 관리자가 박스 번호를 할당한 후 QR 코드를 생성할 수 있습니다.');
        } else {
          setError(errorMessage);
        }
      } else if (err.response?.status === 404) {
        setError('결제 내역을 찾을 수 없습니다. 먼저 결제를 완료해주세요.');
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError('QR 코드 생성 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // 컴포넌트 마운트 시 QR 코드 생성 (페이지 진입 시 자동 호출)
  useEffect(() => {
    if (isAuthenticated) {
      generateQR();
    }
  }, [generateQR, isAuthenticated]);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 만료 시간까지 남은 시간 계산
  const getRemainingTime = (expiresAt) => {
    if (!expiresAt) return '-';
    const now = new Date();
    const expires = new Date(expiresAt);
    const diff = expires - now;
    
    if (diff <= 0) return '만료됨';
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}시간 ${minutes % 60}분`;
    }
    return `${minutes}분`;
  };

  // 로그인하지 않은 경우 아무것도 렌더링하지 않음
  if (authLoading) {
    return (
      <div className="App">
        <Background />
        <main className="container">
          <div style={{ textAlign: 'center', padding: '2rem' }}>로딩 중...</div>
        </main>
      </div>
    );
  }

  if (!isAuthenticated) {
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
                <h1>QR 체크인</h1>
              </div>
            </div>
            
            <p className="subtitle">QR 코드를 스캔하여 입장하세요</p>
          </div>
        </section>

        {/* QR Code Display Section */}
        <section className="card">
          <div className="qr-code-container">
            <h2>QR 코드</h2>
            <p className="qr-description">아래 QR 코드를 리더기에 스캔해주세요</p>
            
            {error && (
              <div style={{
                padding: '1rem',
                background: '#ff4444',
                color: '#fff',
                borderRadius: '8px',
                marginBottom: '1rem',
                textAlign: 'center'
              }}>
                {error}
              </div>
            )}

            {loading ? (
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                flexDirection: 'column',
                gap: '1rem'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '4px solid #f3f3f3',
                  borderTop: '4px solid #FEE500',
                  borderRadius: '50%',
                  animation: 'rotate 1s linear infinite'
                }}></div>
                <p>QR 코드 생성 중...</p>
              </div>
            ) : qrCodeDataURL ? (
              <>
                <div className="qr-code-display" style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                  background: '#fff',
                  borderRadius: '8px',
                  marginBottom: '1rem'
                }}>
                  <img 
                    src={qrCodeDataURL} 
                    alt="QR Code" 
                    style={{
                      maxWidth: '100%',
                      height: 'auto',
                      maxHeight: '400px',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                
                {keyInfo && (
                  <div className="qr-info" style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#2a2a2a',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a'
                  }}>
                    <div className="info-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span className="info-label" style={{ color: '#aaaaaa' }}>거래 ID</span>
                      <span className="info-value" style={{ color: '#ffffff', wordBreak: 'break-all', textAlign: 'right' }}>
                        {keyInfo.transactionId || '-'}
                      </span>
                    </div>
                    <div className="info-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span className="info-label" style={{ color: '#aaaaaa' }}>공개키</span>
                      <span className="info-value" style={{ color: '#ffffff', wordBreak: 'break-all', textAlign: 'right', fontSize: '0.85rem' }}>
                        {keyInfo.publicKey ? `${keyInfo.publicKey.substring(0, 20)}...` : '-'}
                      </span>
                    </div>
                    <div className="info-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span className="info-label" style={{ color: '#aaaaaa' }}>생성시간</span>
                      <span className="info-value" style={{ color: '#ffffff' }}>
                        {formatDate(keyInfo.timestamp)}
                      </span>
                    </div>
                    <div className="info-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span className="info-label" style={{ color: '#aaaaaa' }}>만료시간</span>
                      <span className="info-value" style={{ color: '#ffffff' }}>
                        {formatDate(keyInfo.expiresAt)}
                      </span>
                    </div>
                    <div className="info-item" style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0'
                    }}>
                      <span className="info-label" style={{ color: '#aaaaaa' }}>남은 시간</span>
                      <span className="info-value" style={{ 
                        color: keyInfo.expiresAt && new Date(keyInfo.expiresAt) > new Date() ? '#4CAF50' : '#ff4444',
                        fontWeight: '600'
                      }}>
                        {getRemainingTime(keyInfo.expiresAt)}
                      </span>
                    </div>
                  </div>
                )}

                {order && (
                  <div style={{
                    marginBottom: '1rem',
                    padding: '1rem',
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a'
                  }}>
                    <h3 style={{ color: '#ffffff', marginBottom: '0.75rem', fontSize: '1rem' }}>주문 정보</h3>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span style={{ color: '#aaaaaa' }}>주문 번호</span>
                      <span style={{ color: '#ffffff' }}>#{order.id}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span style={{ color: '#aaaaaa' }}>박스 번호</span>
                      <span style={{ color: '#ffffff' }}>{order.boxNumber || '-'}</span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span style={{ color: '#aaaaaa' }}>총 금액</span>
                      <span style={{ color: '#ffffff', fontWeight: '600' }}>
                        ₩{order.totalAmount?.toLocaleString('ko-KR') || '0'}
                      </span>
                    </div>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '0.5rem 0',
                      borderBottom: '1px solid #3a3a3a'
                    }}>
                      <span style={{ color: '#aaaaaa' }}>상태</span>
                      <span style={{ 
                        color: order.status === 'pending' ? '#FEE500' : '#4CAF50',
                        fontWeight: '600'
                      }}>
                        {order.status === 'pending' ? '대기 중' : order.status}
                      </span>
                    </div>
                    {order.shippingAddress && (
                      <div style={{
                        padding: '0.5rem 0',
                        borderBottom: '1px solid #3a3a3a'
                      }}>
                        <span style={{ color: '#aaaaaa', display: 'block', marginBottom: '0.25rem' }}>배송 주소</span>
                        <span style={{ color: '#ffffff', wordBreak: 'break-all' }}>
                          {order.shippingAddress}
                        </span>
                      </div>
                    )}
                    {order.notes && (
                      <div style={{
                        padding: '0.5rem 0'
                      }}>
                        <span style={{ color: '#aaaaaa', display: 'block', marginBottom: '0.25rem' }}>요청사항</span>
                        <span style={{ color: '#ffffff', wordBreak: 'break-all' }}>
                          {order.notes}
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: '#aaaaaa'
              }}>
                QR 코드를 생성할 수 없습니다.
              </div>
            )}
            
            <button 
              className="btn kakao-primary refresh-qr"
              onClick={generateQR}
              disabled={loading}
              style={{
                width: '100%',
                opacity: loading ? 0.6 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {loading ? '생성 중...' : 'QR 코드 새로고침'}
            </button>
          </div>

          {/* Manual Request Option */}
          <div className="manual-input-section">
            <div className="divider">
              <span>또는</span>
            </div>
            
            <div className="manual-input">
              <label className="form-label">관리자에게 출입요청을 보내세요</label>
              <div className="request-info">
                <p className="request-description">QR 코드 스캔이 어려운 경우 관리자에게 직접 요청하실 수 있습니다</p>
                <div className="request-details">
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>요청 후 관리자가 직접 문을 열어드립니다</span>
                  </div>
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>평균 대기시간: 2-3분</span>
                  </div>
                  <div className="detail-item">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span>24시간 관리자 대기 중</span>
                  </div>
                </div>
              </div>
              <button className="btn kakao-primary request-btn">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M8 0L10.5 5.5H16L11.5 9L13 14.5L8 11L3 14.5L4.5 9L0 5.5H5.5L8 0Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                관리자에게 출입요청 보내기
              </button>
            </div>
          </div>
        </section>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/face-checkin" className="link">얼굴등록 체크인 보기</Link> · 
          <Link to="/admin-control" className="link">관리자 원격 제어 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default QRCheckinPage;









