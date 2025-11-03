import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';

const QRCheckinPage = () => {
  const [qrCode, setQrCode] = useState('');
  const [codeNumber, setCodeNumber] = useState('#KH2024-001234');
  const [validTime, setValidTime] = useState('5분');
  const [generatedTime, setGeneratedTime] = useState('14:30');

  // QR 코드 새로고침 함수
  const refreshQR = () => {
    const newCodeNumber = `#KH2024-${Math.floor(Math.random() * 900000) + 100000}`;
    setCodeNumber(newCodeNumber);
    setGeneratedTime(new Date().toLocaleTimeString('ko-KR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  };

  // QR 코드 패턴 생성
  const generateQRPattern = () => {
    const pattern = [];
    for (let i = 0; i < 21; i++) {
      const row = [];
      for (let j = 0; j < 21; j++) {
        // 랜덤하게 블랙/화이트 결정 (실제 QR 코드 패턴 시뮬레이션)
        const isBlack = Math.random() > 0.5;
        row.push(isBlack ? 'black' : '');
      }
      pattern.push(row);
    }
    return pattern;
  };

  const [qrPattern, setQrPattern] = useState(generateQRPattern());

  useEffect(() => {
    const interval = setInterval(() => {
      setQrPattern(generateQRPattern());
    }, 5000); // 5초마다 QR 코드 패턴 변경

    return () => clearInterval(interval);
  }, []);

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
            <h2>임시 QR 코드</h2>
            <p className="qr-description">아래 QR 코드를 리더기에 스캔해주세요</p>
            
            <div className="qr-code-display">
              <div className="qr-code">
                {/* 실제 QR 코드 패턴 시뮬레이션 */}
                {qrPattern.map((row, rowIndex) => (
                  <div key={rowIndex} className="qr-row">
                    {row.map((cell, cellIndex) => (
                      <div 
                        key={cellIndex} 
                        className={`qr-cell ${cell}`}
                      ></div>
                    ))}
                  </div>
                ))}
                <div className="qr-center">
                  <div className="qr-logo">K</div>
                </div>
              </div>
            </div>
            
            <div className="qr-info">
              <div className="info-item">
                <span className="info-label">코드 번호</span>
                <span className="info-value">{codeNumber}</span>
              </div>
              <div className="info-item">
                <span className="info-label">유효시간</span>
                <span className="info-value">{validTime}</span>
              </div>
              <div className="info-item">
                <span className="info-label">생성시간</span>
                <span className="info-value">{generatedTime}</span>
              </div>
            </div>
            
            <button 
              className="btn kakao-primary refresh-qr"
              onClick={refreshQR}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M1 4v6h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              QR 코드 새로고침
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
          <Link to="/face-checkin" className="link">얼굴인식 체크인 보기</Link> · 
          <Link to="/admin-control" className="link">관리자 원격 제어 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default QRCheckinPage;








