import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, tokenManager } from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 로그인 상태 확인
  const checkAuth = async () => {
    try {
      const accessToken = tokenManager.getAccessToken();
      if (!accessToken) {
        setUser(null);
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // 프로필 정보 가져오기
      const profileData = await authAPI.getProfile();
      if (profileData && profileData.success) {
        setUser(profileData.data);
        setIsAuthenticated(true);
      } else {
        setUser(null);
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Auth check error:', error);
      setUser(null);
      setIsAuthenticated(false);
      tokenManager.clearTokens();
    } finally {
      setLoading(false);
    }
  };

  // 로그아웃
  const logout = async () => {
    try {
      // 1. 백엔드 로그아웃 API 호출 (카카오 REST API 로그아웃 포함)
      await authAPI.logout();
    } catch (error) {
      console.error('로그아웃 오류:', error);
      // 에러가 발생해도 로컬 토큰은 삭제
    } finally {
      // 2. localStorage에서 토큰 삭제
      tokenManager.clearTokens();
      
      // 추가 안전장치: sessionStorage에서도 토큰 제거
      try {
        sessionStorage.removeItem('accessToken');
        sessionStorage.removeItem('refreshToken');
      } catch (e) {
        // sessionStorage가 없는 경우 무시
      }
      
      // 상태 초기화
      setUser(null);
      setIsAuthenticated(false);
      setLoading(false);
      
      // 3. 메인 페이지로 이동
      // 카카오 로그아웃 URL 리다이렉트 제거 (KOE003 오류 방지)
      // 백엔드에서 이미 카카오 REST API로 로그아웃 처리됨
      window.location.href = '/';
    }
  };

  // 프로필 업데이트
  const updateProfile = async (profileData) => {
    try {
      const updated = await authAPI.updateProfile(profileData);
      if (updated && updated.success) {
        setUser(updated.data);
        return updated;
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  // 초기 로드 시 인증 상태 확인
  useEffect(() => {
    checkAuth();
  }, []);

  const value = {
    user,
    isAuthenticated,
    loading,
    checkAuth,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

