import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Background from './Background';
import { useAuth } from '../contexts/AuthContext';
import { adminPaymentAPI } from '../utils/api';

const AdminPaymentPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [editingBoxNumber, setEditingBoxNumber] = useState(null);
  const [boxNumberInput, setBoxNumberInput] = useState('');
  const [updating, setUpdating] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
  });

  // totalPages 계산 함수
  const getTotalPages = () => {
    return Math.ceil(pagination.total / pagination.limit);
  };

  // 윈도우 크기 감지
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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

  // 결제 목록 조회
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchPayments();
    }
  }, [user, pagination.page]);

  const fetchPayments = async () => {
    try {
      setLoadingPayments(true);
      const response = await adminPaymentAPI.getSuccessfulPayments({
        page: pagination.page,
        limit: pagination.limit,
      });

      if (response && response.payments) {
        // 디버깅: 첫 번째 결제 데이터 구조 확인
        if (response.payments.length > 0) {
          console.log('결제 데이터 구조 확인:', response.payments[0]);
        }
        setPayments(response.payments);
        setPagination(prev => ({
          ...prev,
          total: response.count || 0,
        }));
      }
    } catch (error) {
      console.error('결제 목록 조회 실패:', error);
      alert('결제 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoadingPayments(false);
    }
  };

  const handleEditBoxNumber = (payment) => {
    // paymentId 필드 사용 (백엔드 응답에 paymentId 포함)
    const paymentId = payment.paymentId;
    if (!paymentId) {
      console.error('paymentId가 없습니다:', payment);
      alert('결제 ID를 찾을 수 없습니다.');
      return;
    }
    setEditingBoxNumber(paymentId);
    setBoxNumberInput(payment.boxNumber?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingBoxNumber(null);
    setBoxNumberInput('');
  };

  const handleUpdateBoxNumber = async (paymentId) => {
    const boxNumber = parseInt(boxNumberInput);
    
    // 유효성 검사
    if (!boxNumberInput || (boxNumber !== 1 && boxNumber !== 2)) {
      alert('상자 번호는 1번 또는 2번만 입력 가능합니다.');
      return;
    }

    // paymentId 유효성 검사
    if (!paymentId) {
      console.error('paymentId가 없습니다:', paymentId);
      alert('결제 ID를 찾을 수 없습니다.');
      return;
    }

    console.log('상자 번호 업데이트 요청:', { paymentId, boxNumber });

    try {
      setUpdating(true);
      await adminPaymentAPI.updateBoxNumber(paymentId, boxNumber);
      
      // 목록 새로고침
      await fetchPayments();
      
      setEditingBoxNumber(null);
      setBoxNumberInput('');
      alert('상자 번호가 업데이트되었습니다.');
    } catch (error) {
      console.error('상자 번호 업데이트 실패:', error);
      console.error('요청 데이터:', { paymentId, boxNumber });
      console.error('에러 응답:', error.response?.data);
      const errorMessage = error.response?.data?.message || error.message || '상자 번호 업데이트에 실패했습니다.';
      alert(`업데이트 실패: ${errorMessage}`);
    } finally {
      setUpdating(false);
    }
  };

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

  // admin이 아니면 아무것도 렌더링하지 않음
  if (loading || loadingPayments) {
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
                <h1>결제 관리</h1>
              </div>
            </div>
            
            <p className="subtitle">완료된 결제 목록 및 상자 번호 관리</p>
          </div>
        </section>

        {/* Payments List */}
        <section className="card" style={{ marginTop: '2rem', overflow: 'hidden' }}>
          <div className="section-header" style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <h2 style={{ margin: 0 }}>완료된 결제 목록</h2>
            <div style={{ color: '#666', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
              총 {pagination.total}건
            </div>
          </div>

          {payments.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '3rem',
              color: '#999'
            }}>
              완료된 결제가 없습니다.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {payments.map((payment) => {
                // paymentId 필드 사용 (백엔드 응답에 paymentId 포함)
                const paymentId = payment.paymentId;
                return (
                <div
                  key={paymentId}
                  style={{
                    padding: '1.5rem',
                    background: '#1a1a1a',
                    borderRadius: '8px',
                    border: '1px solid #3a3a3a',
                  }}
                >
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: windowWidth <= 768 ? '1fr' : 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1.5rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>
                        결제 ID
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontWeight: '600',
                        wordBreak: 'break-all',
                        overflowWrap: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        #{paymentId}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>
                        결제 금액
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontWeight: '600',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        {formatPrice(payment.amount || 0)}원
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>
                        결제 일시
                      </div>
                      <div style={{ 
                        color: '#fff',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        {formatDate(payment.createdAt)}
                      </div>
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ color: '#999', fontSize: '0.85rem', marginBottom: '0.5rem', whiteSpace: 'nowrap' }}>
                        상자 번호
                      </div>
                      <div style={{ 
                        color: '#fff', 
                        fontWeight: '600',
                        wordBreak: 'break-word',
                        overflowWrap: 'break-word',
                        lineHeight: '1.4'
                      }}>
                        {payment.boxNumber ? `${payment.boxNumber}번` : '미지정'}
                      </div>
                    </div>
                  </div>

                  {/* 상자 번호 입력/수정 */}
                  {editingBoxNumber === paymentId ? (
                    <div style={{
                      display: 'flex',
                      gap: '0.5rem',
                      alignItems: 'center',
                      paddingTop: '1rem',
                      borderTop: '1px solid #3a3a3a'
                    }}>
                      <label style={{ color: '#fff', fontWeight: '500' }}>
                        상자 번호:
                      </label>
                      <select
                        value={boxNumberInput}
                        onChange={(e) => setBoxNumberInput(e.target.value)}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #555',
                          background: '#2a2a2a',
                          color: '#fff',
                          fontSize: '1rem',
                          minWidth: '100px'
                        }}
                        disabled={updating}
                      >
                        <option value="">선택하세요</option>
                        <option value="1">1번</option>
                        <option value="2">2번</option>
                      </select>
                      <button
                        onClick={() => handleUpdateBoxNumber(paymentId)}
                        disabled={updating || !boxNumberInput}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          background: updating ? '#555' : '#FEE500',
                          color: updating ? '#999' : '#000',
                          fontWeight: '600',
                          cursor: updating || !boxNumberInput ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {updating ? '저장 중...' : '저장'}
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={updating}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: '1px solid #555',
                          background: 'transparent',
                          color: '#fff',
                          cursor: updating ? 'not-allowed' : 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        취소
                      </button>
                    </div>
                  ) : (
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      paddingTop: '1rem',
                      borderTop: '1px solid #3a3a3a'
                    }}>
                      <button
                        onClick={() => handleEditBoxNumber(payment)}
                        style={{
                          padding: '0.5rem 1rem',
                          borderRadius: '4px',
                          border: 'none',
                          background: '#FEE500',
                          color: '#000',
                          fontWeight: '600',
                          cursor: 'pointer',
                          fontSize: '0.9rem'
                        }}
                      >
                        {payment.boxNumber ? '상자 번호 수정' : '상자 번호 지정'}
                      </button>
                    </div>
                  )}
                </div>
              );
              })}
            </div>
          )}

          {/* Pagination */}
          {getTotalPages() > 1 && (
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '0.5rem',
              marginTop: '2rem',
              paddingTop: '2rem',
              borderTop: '1px solid #3a3a3a'
            }}>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: pagination.page === 1 ? '#2a2a2a' : '#1a1a1a',
                  color: pagination.page === 1 ? '#666' : '#fff',
                  cursor: pagination.page === 1 ? 'not-allowed' : 'pointer'
                }}
              >
                이전
              </button>
              <div style={{
                padding: '0.5rem 1rem',
                color: '#fff',
                display: 'flex',
                alignItems: 'center'
              }}>
                {pagination.page} / {getTotalPages()}
              </div>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(getTotalPages(), prev.page + 1) }))}
                disabled={pagination.page === getTotalPages()}
                style={{
                  padding: '0.5rem 1rem',
                  borderRadius: '4px',
                  border: '1px solid #555',
                  background: pagination.page === getTotalPages() ? '#2a2a2a' : '#1a1a1a',
                  color: pagination.page === getTotalPages() ? '#666' : '#fff',
                  cursor: pagination.page === getTotalPages() ? 'not-allowed' : 'pointer'
                }}
              >
                다음
              </button>
            </div>
          )}
        </section>

        <div className="demo-note" style={{ marginTop: '2rem' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#FEE500',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            메인 페이지로
          </button>
        </div>
      </main>
    </div>
  );
};

export default AdminPaymentPage;

