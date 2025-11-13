import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Background from './Background';
import { useAuth } from '../contexts/AuthContext';

const FaceCheckinPage = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState('카메라를 시작하는 중...');
  const [cameraError, setCameraError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // 로그인 체크
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      alert('로그인이 필요한 기능입니다.');
      navigate('/');
    }
  }, [isAuthenticated, authLoading, navigate]);

  useEffect(() => {
    // 로그인하지 않은 경우 카메라 시작하지 않음
    if (!isAuthenticated) {
      return;
    }

    // 카메라 스트림 시작
    const startCamera = async () => {
      try {
        setCameraError(null);
        setScanStatus('카메라를 시작하는 중...');
        
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 1280 },
            height: { ideal: 720 },
            facingMode: 'user' // 전면 카메라 사용
          },
          audio: false
        });

        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setScanStatus('얼굴을 등록하고 있습니다...');
        }
      } catch (error) {
        console.error('카메라 접근 오류:', error);
        setCameraError('카메라에 접근할 수 없습니다. 카메라 권한을 확인해주세요.');
        setScanStatus('카메라 접근 실패');
      }
    };

    startCamera();

    // 얼굴등록 시뮬레이션
    const scanningInterval = setInterval(() => {
      if (!cameraError) {
        const statuses = [
          '얼굴을 등록하고 있습니다...',
          '얼굴 특징을 분석 중...',
          '얼굴 정보를 저장 중...',
          '얼굴등록 진행 중...'
        ];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        setScanStatus(randomStatus);
      }
    }, 2000);

    // 정리 함수
    return () => {
      if (!isAuthenticated) {
        return;
      }
      clearInterval(scanningInterval);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraError, isAuthenticated]);

  const handleFaceRegister = () => {
    alert('얼굴 등록이 완료되었습니다.');
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
                <h1>얼굴등록</h1>
              </div>
            </div>
            
            <p className="subtitle">얼굴을 등록하세요</p>
          </div>
        </section>

        {/* Face Registration Section */}
        <section className="card">
          <div className="face-camera-container">
            <div className="face-camera">
              <div className="camera-frame">
                {cameraError ? (
                  <div className="face-overlay">
                    <div className="face-icon">
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                      </svg>
                    </div>
                    <div className="face-text">{cameraError}</div>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        borderRadius: '16px',
                        transform: 'scaleX(-1)', // 미러 효과
                      }}
                    />
                    <div className="face-overlay">
                      <div className="face-outline">
                        <div className="face-corners">
                          <div className="face-guide"></div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              
              {!cameraError && (
                <div className="scanning-overlay">
                  <div className="scanning-dots">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                  </div>
                  <div className="scanning-text">{scanStatus}</div>
                </div>
              )}
            </div>
            
          </div>

          {/* Face Registration Button */}
          <div className="manual-input-section" style={{ marginTop: '24px' }}>
            <button 
              className="btn kakao-primary request-btn"
              onClick={handleFaceRegister}
              style={{ width: '100%' }}
            >
              얼굴 등록하기
            </button>
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









