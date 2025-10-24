import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Background from './Background';

const FaceCheckinPage = () => {
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState('얼굴인식 진행 중...');

  useEffect(() => {
    // 얼굴인식 시뮬레이션
    const scanningInterval = setInterval(() => {
      const statuses = [
        '얼굴을 인식하고 있습니다...',
        '얼굴 특징을 분석 중...',
        '신원을 확인하고 있습니다...',
        '얼굴인식 진행 중...'
      ];
      const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
      setScanStatus(randomStatus);
    }, 2000);

    return () => clearInterval(scanningInterval);
  }, []);

  const handleManualRequest = () => {
    alert('관리자에게 출입요청이 전송되었습니다. 잠시만 기다려주세요.');
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
                <h1>얼굴인식 체크인</h1>
              </div>
            </div>
            
            <p className="subtitle">얼굴을 인식하여 입장하세요</p>
          </div>
        </section>

        {/* Face Recognition Section */}
        <section className="card">
          <div className="face-camera-container">
            <div className="face-camera">
              <div className="camera-frame">
                <div className="face-overlay">
                  <div className="face-outline">
                    <div className="face-corners">
                      <div className="face-guide"></div>
                    </div>
                  </div>
                  <div className="face-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="face-text">얼굴을 프레임 안에 맞춰주세요</div>
                </div>
              </div>
              
              <div className="scanning-overlay">
                <div className="scanning-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
                <div className="scanning-text">{scanStatus}</div>
              </div>
            </div>
            
            <div className="face-status">
              <div className="status-indicator">
                <div className="status-dot scanning"></div>
                <span>{scanStatus}</span>
              </div>
            </div>
          </div>

          {/* Manual Request Option */}
          <div className="manual-input-section">
            <div className="divider">
              <span>또는</span>
            </div>
            
            <div className="manual-input">
              <label className="form-label">관리자에게 출입요청을 보내세요</label>
              <div className="request-info">
                <p className="request-description">얼굴인식이 어려운 경우 관리자에게 직접 요청하실 수 있습니다</p>
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
              <button 
                className="btn kakao-primary request-btn"
                onClick={handleManualRequest}
              >
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
          <Link to="/qr-checkin" className="link">QR 체크인 보기</Link> · 
          <Link to="/admin-control" className="link">관리자 원격 제어 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default FaceCheckinPage;




