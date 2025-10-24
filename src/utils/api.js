// 쿠키 기반 API 통신 유틸리티 (axios)
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// axios 인스턴스 생성 (쿠키 자동 포함)
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 쿠키를 자동으로 포함
  headers: {
    'Content-Type': 'application/json',
  },
});

// 응답 인터셉터 (에러 처리)
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 401 Unauthorized인 경우 로그인 페이지로 리다이렉트
    if (error.response && error.response.status === 401) {
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

export { axiosInstance };

// 상품 API
export const productAPI = {
  // 상품 목록 조회
  getProducts: async (params = {}) => {
    const response = await axiosInstance.get('/api/products', { params });
    return response.data;
  },

  // 상품 상세 조회
  getProduct: async (id) => {
    const response = await axiosInstance.get(`/api/products/${id}`);
    return response.data;
  },

  // 상품 등록 (FormData로 전송)
  createProduct: async (productData) => {
    const response = await axiosInstance.post('/api/product/upload', productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 상품 수정
  updateProduct: async (id, productData) => {
    const response = await axiosInstance.put(`/api/products/${id}`, productData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // 상품 삭제
  deleteProduct: async (id) => {
    const response = await axiosInstance.delete(`/api/products/${id}`);
    return response.data;
  },

  // 상품 일괄 삭제
  bulkDeleteProducts: async (ids) => {
    const response = await axiosInstance.delete('/api/products/bulk-delete', {
      data: { ids },
    });
    return response.data;
  },
};

// 인증 API
export const authAPI = {
  // 로그인
  login: async (email, password) => {
    const response = await axiosInstance.post('/api/auth/login', { email, password });
    return response.data;
  },

  // 로그아웃
  logout: async () => {
    const response = await axiosInstance.post('/api/auth/logout');
    return response.data;
  },

  // 현재 사용자 정보 조회
  getCurrentUser: async () => {
    const response = await axiosInstance.get('/api/auth/me');
    return response.data;
  },

  // 회원가입
  signup: async (userData) => {
    const response = await axiosInstance.post('/api/auth/signup', userData);
    return response.data;
  },
};

// 출입 요청 API
export const accessRequestAPI = {
  // 출입 요청 목록 조회
  getRequests: async () => {
    const response = await axiosInstance.get('/api/access-requests');
    return response.data;
  },

  // 출입 승인
  approveRequest: async (id) => {
    const response = await axiosInstance.post(`/api/access-requests/${id}/approve`);
    return response.data;
  },

  // 출입 거부
  rejectRequest: async (id) => {
    const response = await axiosInstance.post(`/api/access-requests/${id}/reject`);
    return response.data;
  },

  // 출입 요청 생성
  createRequest: async (type) => {
    const response = await axiosInstance.post('/api/access-requests', { type });
    return response.data;
  },
};

// 문 제어 API
export const doorControlAPI = {
  // 문 열기
  openDoor: async () => {
    const response = await axiosInstance.post('/api/door/open');
    return response.data;
  },

  // 문 닫기
  closeDoor: async () => {
    const response = await axiosInstance.post('/api/door/close');
    return response.data;
  },

  // 긴급 모드 활성화
  activateEmergencyMode: async () => {
    const response = await axiosInstance.post('/api/door/emergency-mode');
    return response.data;
  },
};

export default axiosInstance;
