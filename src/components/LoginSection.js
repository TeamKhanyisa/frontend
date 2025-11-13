import React, { useState } from 'react';
import { authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const LoginSection = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [isRequesting, setIsRequesting] = useState(false);
  const [requestStatus, setRequestStatus] = useState(null); // 'success', 'error', null

  // Kakao OAuth 로그인 시작
  const handleKakaoLogin = () => {
    authAPI.startKakaoLogin();
  };

  // 로그아웃 처리
  const handleLogout = async () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      await logout();
      // AuthContext의 logout 함수에서 리다이렉트 처리
    }
  };

  // 사장님으로 전환 요청
  const handleRequestRoleChange = async () => {
    if (!window.confirm('사장님으로 전환을 요청하시겠습니까?\n관리자의 승인이 필요합니다.')) {
      return;
    }

    setIsRequesting(true);
    setRequestStatus(null);

    try {
      const response = await authAPI.requestRoleChange();
      if (response.success) {
        setRequestStatus('success');
        alert('사장님으로 전환 요청이 완료되었습니다.\n관리자의 승인을 기다려주세요.');
      } else {
        setRequestStatus('error');
        alert(response.message || '요청 처리 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Role change request error:', error);
      setRequestStatus('error');
      const errorMessage = error.response?.data?.message || error.message || '요청 처리 중 오류가 발생했습니다.';
      alert(`요청 실패: ${errorMessage}`);
    } finally {
      setIsRequesting(false);
    }
  };

  // 로딩 중일 때
  if (loading) {
    return (
      <section className="card hero">
        <div className="hero-content">
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <p>로딩 중...</p>
          </div>
        </div>
      </section>
    );
  }

  // 로그인된 상태
  if (isAuthenticated && user) {
    return (
      <section className="card hero">
        <div className="hero-content">
          <div className="brand">
            <div className="kakao-logo">
              {user.profile_image ? (
                <img 
                  src={user.profile_image} 
                  alt="프로필" 
                  style={{ 
                    width: '64px', 
                    height: '64px', 
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }} 
                />
              ) : (
                <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
                  <circle cx="32" cy="32" r="32" fill="#f0f0f0"/>
                  <path d="M32 16c-8.837 0-16 7.163-16 16s7.163 16 16 16 16-7.163 16-16-7.163-16-16-16zm0 28c-6.627 0-12-5.373-12-12s5.373-12 12-12 12 5.373 12 12-5.373 12-12 12z" fill="#999"/>
                  <path d="M32 24c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z" fill="#999"/>
                </svg>
              )}
            </div>
            <div className="brand-text">
              <div className="kakao-badge">KHAYISA</div>
              <h1>환영합니다!</h1>
            </div>
          </div>
          
          <div style={{ 
            background: '#2a2a2a', 
            padding: '1.5rem', 
            borderRadius: '8px', 
            margin: '1rem 0',
            textAlign: 'center',
            border: '1px solid #3a3a3a'
          }}>
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '700', 
              marginBottom: '0.75rem',
              color: '#ffffff',
              letterSpacing: '0.5px'
            }}>
              {user.name || user.email || '사용자'}
            </div>
            {user.email && (
              <div style={{ 
                fontSize: '1rem', 
                color: '#cccccc', 
                marginBottom: '0.5rem',
                wordBreak: 'break-all'
              }}>
                {user.email}
              </div>
            )}
            {user.provider && (
              <div style={{ 
                fontSize: '0.85rem', 
                color: '#aaaaaa',
                marginTop: '0.5rem'
              }}>
                {user.provider === 'kakao' ? '카카오' : user.provider} 계정으로 로그인
              </div>
            )}
            {user.role && (
              <div style={{ 
                fontSize: '0.85rem', 
                color: user.role === 'admin' ? '#FEE500' : '#aaaaaa',
                marginTop: '0.5rem',
                fontWeight: user.role === 'admin' ? '600' : '400'
              }}>
                {user.role === 'admin' ? '👑 관리자' : '👤 일반 사용자'}
              </div>
            )}
          </div>

          {/* 사장님으로 전환 요청 버튼 (user role일 때만 표시) */}
          {user.role === 'user' && (
            <div style={{ 
              marginTop: '1rem',
              padding: '1rem',
              background: '#1a1a1a',
              borderRadius: '8px',
              border: '1px solid #3a3a3a'
            }}>
              <div style={{ 
                fontSize: '0.9rem', 
                color: '#cccccc',
                marginBottom: '0.75rem',
                textAlign: 'center'
              }}>
                사장님 기능이 필요하신가요?
              </div>
              <button 
                className="btn kakao-primary" 
                onClick={handleRequestRoleChange}
                disabled={isRequesting}
                type="button"
                style={{ 
                  width: '100%',
                  backgroundColor: isRequesting ? '#666' : '#FEE500',
                  color: '#000000',
                  border: 'none',
                  fontWeight: '600',
                  opacity: isRequesting ? 0.6 : 1,
                  cursor: isRequesting ? 'not-allowed' : 'pointer'
                }}
              >
                {isRequesting ? (
                  '⏳ 요청 중...'
                ) : requestStatus === 'success' ? (
                  '✓ 요청 완료'
                ) : (
                  '👑 사장님으로 전환 요청'
                )}
              </button>
              {requestStatus === 'success' && (
                <div style={{ 
                  fontSize: '0.8rem', 
                  color: '#4CAF50',
                  marginTop: '0.5rem',
                  textAlign: 'center'
                }}>
                  요청이 완료되었습니다. 관리자의 승인을 기다려주세요.
                </div>
              )}
            </div>
          )}

          <div className="actions" style={{ marginTop: '1rem' }}>
            <button 
              className="btn secondary" 
              onClick={handleLogout}
              type="button"
              style={{ width: '100%' }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </section>
    );
  }

  // 로그인되지 않은 상태
  return (
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
            <h1>로그인</h1>
          </div>
        </div>
        
        <p className="subtitle">Khanyisa에 오신 것을 환영합니다</p>
        <p className="muted">안전하고 빠른 계정으로 간편하게 시작하세요</p>

        <div className="actions">
          <button 
            className="btn kakao-primary" 
            onClick={handleKakaoLogin}
            type="button"
            style={{
              backgroundColor: '#FEE500',
              color: '#000000',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              fontWeight: '600'
            }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 0C4.03 0 0 3.42 0 7.64C0 10.28 1.73 12.59 4.33 13.9C4.25 14.49 4.05 16.09 4.93 16.42C5.21 16.55 5.58 16.23 6.16 15.52C6.16 15.52 6.94 14.68 7.27 14.32C7.92 14.51 8.62 14.62 9.32 14.62C14.29 14.62 18.32 11.2 18.32 6.98C18.32 3.42 13.97 0 9 0Z" fill="#000000"/>
              <circle cx="5.62" cy="7.64" r="1" fill="#FEE500"/>
              <circle cx="9" cy="7.64" r="1" fill="#FEE500"/>
              <circle cx="12.38" cy="7.64" r="1" fill="#FEE500"/>
            </svg>
            카카오 로그인
          </button>
        </div>

      </div>
    </section>
  );
};

export default LoginSection;






""
