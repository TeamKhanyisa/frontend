import React from 'react';

const LoginSection = () => {
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
          <button className="btn kakao-primary" aria-disabled="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
              <path d="M10 4c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="currentColor"/>
            </svg>
            로그인하기
            
          </button>
          <button className="btn secondary" aria-disabled="true">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 0C4.477 0 0 4.477 0 10s4.477 10 10 10 10-4.477 10-10S15.523 0 10 0zm0 18c-4.411 0-8-3.589-8-8s3.589-8 8-8 8 3.589 8 8-3.589 8-8 8z" fill="currentColor"/>
              <path d="M10 4c-3.314 0-6 2.686-6 6s2.686 6 6 6 6-2.686 6-6-2.686-6-6-6zm0 10c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4z" fill="currentColor"/>
            </svg>
            회원가입
          </button>
        </div>

      </div>
    </section>
  );
};

export default LoginSection;






""
