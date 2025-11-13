import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Background from './Background';
import { useAuth } from '../contexts/AuthContext';

const AdminControlPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: 1,   
      type: 'QR 체크인 요청',
      requester: '김고객님',
      time: '2분 전',
      status: 'urgent',
      statusText: '긴급'
    },
    {
      id: 2,
      type: '얼굴등록 요청',
      requester: '이고객님',
      time: '5분 전',
      status: 'normal',
      statusText: '일반'
    }
  ]);

  const [systemStatus, setSystemStatus] = useState({
    qrScanner: 'online',
    faceRecognition: 'online',
    pendingCount: 2
  });

  const handleApprove = (requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    setSystemStatus(prev => ({
      ...prev,
      pendingCount: prev.pendingCount - 1
    }));
    alert('출입이 승인되었습니다.');
  };

  const handleReject = (requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId));
    setSystemStatus(prev => ({
      ...prev,
      pendingCount: prev.pendingCount - 1
    }));
    alert('출입이 거부되었습니다.');
  };

  const handleDoorOpen = () => {
    alert('문이 열렸습니다.');
  };

  const handleDoorClose = () => {
    alert('문이 닫혔습니다.');
  };

  const handleEmergencyMode = () => {
    alert('긴급 모드가 활성화되었습니다. 모든 출입이 자동으로 승인됩니다.');
  };

  // role 체크: admin이 아니면 접근 차단
  useEffect(() => {
    if (!loading) {
      if (!user || user.role !== 'admin') {
        alert('관리자만 접근할 수 있는 페이지입니다.');
        navigate('/');
      }
    }
  }, [user, loading, navigate]);

  // admin이 아니면 아무것도 렌더링하지 않음
  if (loading) {
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
                <h1>관리자 원격 제어</h1>
              </div>
            </div>
            
            <p className="subtitle">출입요청을 원격으로 처리하세요</p>
          </div>
        </section>

        {/* Status Overview */}
        <section className="card status-overview">
          <h2>시스템 상태</h2>
          <div className="status-grid">
            <div className="status-card">
              <div className="status-icon online">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12l2 2 4-4M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="status-content">
                <h3>QR 스캐너</h3>
                <p className="status-text online">정상 작동</p>
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-icon online">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="status-content">
                <h3>얼굴등록</h3>
                <p className="status-text online">정상 작동</p>
              </div>
            </div>
            
            <div className="status-card">
              <div className="status-icon warning">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div className="status-content">
                <h3>대기 중인 요청</h3>
                <p className="status-text warning">{systemStatus.pendingCount}건</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pending Requests */}
        <section className="card requests-section">
          <div className="section-header">
            <h2>대기 중인 출입요청</h2>
            <div className="request-count">
              <span className="count-badge">{systemStatus.pendingCount}</span>
              <span>건 대기 중</span>
            </div>
          </div>
          
          <div className="requests-list">
            {pendingRequests.map((request) => (
              <div key={request.id} className={`request-item ${request.status}`}>
                <div className="request-info">
                  <div className="request-header">
                    <h3>{request.type}</h3>
                    <span className="request-time">{request.time}</span>
                  </div>
                  <div className="request-details">
                    <div className="detail-row">
                      <span className="detail-label">요청자</span>
                      <span className="detail-value">{request.requester}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">상태</span>
                      <span className={`status-badge ${request.status}`}>{request.statusText}</span>
                    </div>
                  </div>
                </div>
                <div className="request-actions">
                  <button 
                    className="btn kakao-primary approve-btn"
                    onClick={() => handleApprove(request.id)}
                  >
                    출입 승인
                  </button>
                  <button 
                    className="btn secondary reject-btn"
                    onClick={() => handleReject(request.id)}
                  >
                    거부
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Manual Control */}
        <section className="card control-section">
          <h2>수동 제어</h2>
          <div className="control-grid">
            <div className="control-item">
              <div className="control-info">
                <h3>문 제어</h3>
                <p>매장 입구문을 수동으로 제어합니다</p>
              </div>
              <div className="control-actions">
                <button 
                  className="btn kakao-primary door-open-btn"
                  onClick={handleDoorOpen}
                >
                  문 열기
                </button>
                <button 
                  className="btn secondary door-close-btn"
                  onClick={handleDoorClose}
                >
                  문 닫기
                </button>
              </div>
            </div>
            
            <div className="control-item">
              <div className="control-info">
                <h3>긴급 모드</h3>
                <p>모든 출입을 자동으로 승인합니다</p>
              </div>
              <div className="control-actions">
                <button 
                  className="btn error emergency-btn"
                  onClick={handleEmergencyMode}
                >
                  긴급 모드 활성화
                </button>
              </div>
            </div>
          </div>
        </section>

        <div className="demo-note">
          <Link to="/" className="link">메인 페이지 보기</Link> · 
          <Link to="/qr-checkin" className="link">QR 체크인 보기</Link> · 
          <Link to="/face-checkin" className="link">얼굴등록 체크인 보기</Link>
        </div>
      </main>
    </div>
  );
};

export default AdminControlPage;