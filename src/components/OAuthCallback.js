import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { tokenManager, authAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';
import { getOrGenerateKeyPair, getOrGenerateSigningKeyPair } from '../utils/crypto';

const OAuthCallback = () => {
  const navigate = useNavigate();
  const { checkAuth } = useAuth();
  const hasProcessed = useRef(false); // 중복 실행 방지

  useEffect(() => {
    // 이미 처리되었으면 실행하지 않음
    if (hasProcessed.current) {
      return;
    }

    // URL 파라미터에서 직접 읽기 (searchParams 의존성 제거)
    const urlParams = new URLSearchParams(window.location.search);
    const accessToken = urlParams.get('accessToken');
    const refreshToken = urlParams.get('refreshToken');
    const error = urlParams.get('error');

    const handleCallback = async () => {
      // 처리 시작 표시
      hasProcessed.current = true;

      try {
        if (error) {
          // 에러가 있는 경우
          console.error('OAuth error:', error);
          alert('로그인에 실패했습니다. 다시 시도해주세요.');
          navigate('/');
          return;
        }

        // 로그인 성공 여부 확인
        let loginSuccess = false;

        if (accessToken && refreshToken) {
          // 토큰을 localStorage에 저장 (기존 방식 호환성 유지)
          tokenManager.setTokens(accessToken, refreshToken);
          loginSuccess = true;
        } else {
          // 토큰이 없는 경우 (백엔드가 httpOnly 쿠키로 설정했을 수도 있음)
          // 프로필 API를 호출하여 로그인 상태 확인
          try {
            const profile = await authAPI.getProfile();
            if (profile) {
              // 프로필 조회 성공 = 로그인 성공
              loginSuccess = true;
            } else {
              throw new Error('Profile fetch failed');
            }
          } catch (profileError) {
            // 프로필 조회 실패 = 로그인 실패
            console.error('Profile fetch error:', profileError);
            alert('로그인에 실패했습니다. 다시 시도해주세요.');
            navigate('/');
            return;
          }
        }

        if (loginSuccess) {
          // 인증 상태 확인 및 사용자 정보 가져오기
          await checkAuth();

          // WebCrypto를 사용하여 기존 키 확인 또는 새 키 쌍 생성 및 공개키 전송
          try {
            // 암호화용 키 쌍 생성/가져오기 및 공개키 전송
            const { publicKeyPEM, isNew } = await getOrGenerateKeyPair();
            
            if (isNew) {
              console.log('새 암호화용 키 쌍 생성 완료. 공개키 서버로 전송 중...');
            } else {
              console.log('기존 암호화용 키 쌍 사용. 공개키 서버로 전송 중...');
            }
            
            await authAPI.sendPublicKey(publicKeyPEM);
            console.log('암호화용 공개키 전송 완료');

            // 서명용 키 쌍 생성/가져오기 및 공개키 전송
            const { publicKeyBase64: signingPublicKey, isNew: isSigningKeyNew } = await getOrGenerateSigningKeyPair();
            
            if (isSigningKeyNew) {
              console.log('새 서명용 키 쌍 생성 완료. 공개키 서버로 전송 중...');
            } else {
              console.log('기존 서명용 키 쌍 사용. 공개키 서버로 전송 중...');
            }
            
            await authAPI.sendSigningPublicKey(signingPublicKey);
            console.log('서명용 공개키 전송 완료');
          } catch (keyError) {
            console.error('키 생성 또는 전송 실패:', keyError);
            // 키 생성/전송 실패해도 로그인은 성공한 상태이므로 계속 진행
            // 사용자에게는 알리지 않음 (백그라운드 작업)
          }

          // 홈으로 리다이렉트
          navigate('/');
        }
      } catch (error) {
        console.error('OAuth callback error:', error);
        alert('로그인 처리 중 오류가 발생했습니다.');
        navigate('/');
      }
    };

    handleCallback();
  }, [navigate, checkAuth]); // navigate와 checkAuth만 의존성에 포함

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

