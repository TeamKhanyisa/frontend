// JWT 토큰 기반 API 통신 유틸리티 (axios)
import axios from 'axios';

// 환경변수에서 백엔드 API 주소 가져오기
const API_BASE_URL = process.env.REACT_APP_API_URL;

if (!API_BASE_URL) {
  console.error(
    'REACT_APP_API_URL 환경변수가 설정되지 않았습니다. .env 파일에 REACT_APP_API_URL을 설정해주세요.'
  );
  throw new Error(
    'REACT_APP_API_URL 환경변수가 필요합니다. .env 파일을 확인해주세요.'
  );
}

// 토큰 관리 유틸리티
const tokenManager = {
  getAccessToken: () => localStorage.getItem('accessToken'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setTokens: (accessToken, refreshToken) => {
    if (accessToken) localStorage.setItem('accessToken', accessToken);
    if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
  },
  clearTokens: () => {
    try {
      // localStorage에서 토큰 삭제
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      
      // 삭제 확인 (선택적)
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (accessToken || refreshToken) {
        console.warn('토큰 삭제 실패: 일부 토큰이 남아있습니다.');
        // 강제 삭제 시도
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    } catch (error) {
      console.error('토큰 삭제 중 오류 발생:', error);
    }
  },
};

// axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // httpOnly 쿠키 자동 포함
});

// 요청 인터셉터 (JWT 토큰 추가)
// httpOnly 쿠키를 사용하더라도, localStorage에 토큰이 있으면 Authorization 헤더로도 전송
// 이중 인증 방식: 쿠키(자동) + JWT 헤더(선택적)
axiosInstance.interceptors.request.use(
  (config) => {
    const accessToken = tokenManager.getAccessToken();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    // httpOnly 쿠키는 withCredentials: true로 자동 전송됨
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터 (에러 처리 및 토큰 갱신)
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 401 Unauthorized인 경우 토큰 갱신 시도
    if (error.response && error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = tokenManager.getRefreshToken();
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/api/auth/refresh`, {
            refreshToken,
          });

          const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;
          tokenManager.setTokens(newAccessToken, newRefreshToken);

          // 원래 요청 재시도
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // 토큰 갱신 실패 시 로그인 페이지로 리다이렉트
        tokenManager.clearTokens();
        window.location.href = '/';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export { axiosInstance, tokenManager };

// ==================== 공통 API ====================

export const commonAPI = {
  // Health Check
  healthCheck: async () => {
    const response = await axiosInstance.get('/api/health');
    return response.data;
  },
};

// ==================== 인증 관련 API ====================

export const authAPI = {
  // Kakao OAuth 로그인 시작
  startKakaoLogin: () => {
    window.location.href = `${API_BASE_URL}/api/auth/kakao`;
  },

  // 토큰 갱신
  refreshToken: async (refreshToken) => {
    const response = await axiosInstance.post('/api/auth/refresh', { refreshToken });
    if (response.data.accessToken && response.data.refreshToken) {
      tokenManager.setTokens(response.data.accessToken, response.data.refreshToken);
    }
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    try {
      // 서버에 로그아웃 요청 전송
      const response = await axiosInstance.post('/api/auth/logout');
      return response.data;
    } catch (error) {
      // 네트워크 오류나 서버 오류가 발생해도 토큰은 반드시 삭제
      console.error('Logout error:', error);
      throw error;
    }
  },

  // 프로필 조회
  getProfile: async () => {
    const response = await axiosInstance.get('/api/auth/profile');
    return response.data;
  },

  // 프로필 수정
  updateProfile: async (profileData) => {
    const response = await axiosInstance.put('/api/auth/profile', profileData);
    return response.data;
  },

  // 계정 삭제
  deleteAccount: async () => {
    const response = await axiosInstance.delete('/api/auth/account');
    tokenManager.clearTokens();
    return response.data;
  },

  // 사장님으로 전환 요청 (user -> admin)
  requestRoleChange: async () => {
    const response = await axiosInstance.post('/api/auth/request-role-change');
    return response.data;
  },

  // 공개키 전송 (암호화용)
  sendPublicKey: async (publicKeyPEM) => {
    // PEM 형식에서 순수 Base64 문자열만 추출
    // 헤더(-----BEGIN PUBLIC KEY-----), 푸터(-----END PUBLIC KEY-----), 개행문자(\n) 및 모든 공백 제거
    const publicKeyBase64 = publicKeyPEM
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\n/g, '') // 개행 문자 제거
      .replace(/\r/g, '') // 캐리지 리턴 제거
      .replace(/\s/g, ''); // 모든 공백 문자 제거 (공백, 탭 등)
    
    const response = await axiosInstance.put('/api/auth/public-key', {
      publicKey: publicKeyBase64,
    });
    return response.data;
  },

  // 서명용 공개키 전송
  sendSigningPublicKey: async (publicKeyBase64) => {
    // 이미 Base64 형식으로 받음 (getOrGenerateSigningKeyPair에서 변환됨)
    const response = await axiosInstance.put('/api/auth/signing-public-key', {
      publicKey: publicKeyBase64,
    });
    return response.data;
  },
};

// ==================== 상품 관련 API ====================

export const productAPI = {
  // 상품 목록 조회
  getProducts: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      category,
      minPrice,
      maxPrice,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      isActive = true,
      isFeatured,
    } = params;

    const queryParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      isActive,
      ...(category && { category }),
      ...(minPrice !== undefined && { minPrice }),
      ...(maxPrice !== undefined && { maxPrice }),
      ...(search && { search }),
      ...(isFeatured !== undefined && { isFeatured }),
    };

    const response = await axiosInstance.get('/api/products', { params: queryParams });
    // 백엔드 응답 구조: { success: true, data: { products: [...], pagination: {...} } }
    return response.data.data?.products || [];
  },

  // 상품 상세 조회
  getProduct: async (id) => {
    const response = await axiosInstance.get(`/api/products/${id}`);
    // 백엔드 응답 구조: { success: true, data: product }
    return response.data.data;
  },

  // 카테고리 목록 조회
  getCategories: async () => {
    const response = await axiosInstance.get('/api/products/categories/list');
    // 백엔드 응답 구조: { success: true, data: { categories: [...] } }
    return response.data.data;
  },

  // 인기 상품 조회
  getFeaturedProducts: async (limit = 10) => {
    const response = await axiosInstance.get('/api/products/featured/list', {
      params: { limit },
    });
    // 백엔드 응답 구조: { success: true, data: products }
    // products는 배열이므로 직접 반환
    return Array.isArray(response.data.data) ? response.data.data : [];
  },

  // 상품 등록
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/api/products', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // 백엔드 응답 구조: { success: true, message: '...', data: product }
    return response.data.data;
  },

  // 상품 수정
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/api/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // 백엔드 응답 구조: { success: true, message: '...', data: product }
    return response.data.data;
  },

  // 상품 삭제
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    // 백엔드 응답 구조: { success: true, message: '...' }
    return response.data;
  },
};

// ==================== QR코드 관련 API ====================

export const qrAPI = {
  // 개인키 포함 QR코드 생성
  generatePrivateKeyQR: async () => {
    const response = await axiosInstance.post('/api/qr/generate-private-key');
    return response.data;
  },

  // 사용자 정의 QR코드 생성
  generateCustomQR: async (data, options = {}) => {
    const response = await axiosInstance.post('/api/qr/generate-custom', {
      data,
      options,
    });
    return response.data;
  },

  // 개인키 검증
  validateKey: async (privateKey) => {
    const response = await axiosInstance.post('/api/qr/validate-key', {
      privateKey,
    });
    return response.data;
  },

  // QR코드 스캔 결과 처리
  scanQR: async (qrData) => {
    // qrData가 이미 JSON 문자열인 경우 그대로 전송, 객체인 경우 JSON.stringify
    const data = typeof qrData === 'string' ? qrData : JSON.stringify(qrData);
    const response = await axiosInstance.post('/api/qr/scan', {
      qrData: data,
    });
    return response.data;
  },
};

// ==================== 결제 관련 API ====================

export const paymentAPI = {
  // 결제 생성
  createPayment: async (paymentData) => {
    const response = await axiosInstance.post('/api/payment/create', paymentData);
    // 백엔드 응답 구조: { success: true, data: payment }
    return response.data.data;
  },

  // 결제 상태 조회
  getPayment: async (paymentId) => {
    const response = await axiosInstance.get(`/api/payment/get/${paymentId}`);
    // 백엔드 응답 구조: { success: true, data: payment }
    return response.data.data;
  },

  // 사용자 결제 내역 조회 (페이지네이션 없음)
  getMyPayments: async (params = {}) => {
    const {
      status,
    } = params;

    const queryParams = {
      ...(status && { status }),
    };

    const response = await axiosInstance.get('/api/payment/my', {
      params: queryParams,
    });
    // 백엔드 응답 구조: { success: true, data: { payments: [...], pagination: {...} } }
    return response.data.data;
  },

  // QR 인증
  verifyQR: async (verifyData) => {
    const response = await axiosInstance.post('/api/payment/verify', verifyData);
    // 백엔드 응답 구조: { success: true, message: '...', data: {...} }
    return response.data;
  },
};

// ==================== 관리자 결제 관련 API ====================

export const adminPaymentAPI = {
  // 성공한 결제 목록 조회 (관리자만)
  getSuccessfulPayments: async (params = {}) => {
    const {
      page = 1,
      limit = 20,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = params;

    const queryParams = {
      page,
      limit,
      sortBy,
      sortOrder,
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const response = await axiosInstance.get('/api/payment/admin/list', {
      params: queryParams,
    });
    // 백엔드 응답 구조: { success: true, data: { payments: [...], pagination: {...} } }
    return response.data.data;
  },

  // 상자번호 업데이트 (관리자만)
  updateBoxNumber: async (paymentId, boxNumber) => {
    const response = await axiosInstance.put('/api/payment/admin/update-box', {
      paymentId,
      boxNumber,
    });
    // 백엔드 응답 구조: { success: true, message: '...', data: payment }
    return response.data.data;
  },
};

export default axiosInstance;
