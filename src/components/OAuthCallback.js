import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { tokenManager } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // URL 파라미터에서 토큰 추출
        const accessToken = searchParams.get('accessToken');
        const refreshToken = searchParams.get('refreshToken');
        const error = searchParams.get('error');

        if (error) {
          // 에러가 있는 경우
          console.error('OAuth error:', error);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
          navigate('/');
          return;
        }

        if (accessToken && refreshToken) {
          // 토큰을 localStorage에 저장
          tokenManager.setTokens(accessToken, refreshToken);
          
          // 인증 상태 확인 및 사용자 정보 가져오기
          await checkAuth();
          
          // 홈으로 리다이렉트
          navigate('/');
        } else {
          // 토큰이 없는 경우 (백엔드가 쿠키로 설정했을 수도 있음)
          // 프로필 API를 호출하여 로그인 상태 확인
          try {
            const { authAPI } = await import('../utils/api');
            const profile = await authAPI.getProfile();
            if (profile) {
              // 프로필 조회 성공 = 로그인 성공
              await checkAuth();
              navigate('/');
            } else {
              throw new Error('Profile fetch failed');
            }
          } catch (profileError) {
            // 프로필 조회 실패 = 로그인 실패
            console.error('Profile fetch error:', profileError);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            navigate('/');
          }
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, searchParams, checkAuth]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      flexDirection: 'column'
    }}>
      <div style={{ fontSize: '24px', marginBottom: '20px' }}>로그인 처리 중...</div>
      <div style={{ fontSize: '16px', color: '#666' }}>잠시만 기다려주세요.</div>
    </div>
  );
};

export default OAuthCallback;

