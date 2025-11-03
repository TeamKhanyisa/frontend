# Khanyisa API 연동 가이드

## 📦 사용 라이브러리
- **axios**: HTTP 클라이언트 (쿠키 기반 인증)
- **react-router-dom**: 라우팅

## 🔐 쿠키 기반 인증

모든 API 요청은 자동으로 쿠키를 포함합니다:
```javascript
const axiosInstance = axios.create({
  baseURL: 'http://localhost:8080',
  withCredentials: true, // 🍪 쿠키 자동 포함
});
```

## 🎯 상품 등록 API

### 엔드포인트
```
POST /api/product/upload
```

### 요청 형식
- **Content-Type**: `multipart/form-data`
- **쿠키**: 자동 포함

### FormData 구조
```javascript
const formData = new FormData();
formData.append('name', '상품명');           // 필수
formData.append('category', '생일케이크');    // 필수
formData.append('price', '35000');          // 필수
formData.append('originalPrice', '42000');  // 선택
formData.append('stock', '15');             // 필수
formData.append('description', '상품 설명'); // 선택
formData.append('image', imageFile);        // 선택 (File 객체)
```

### 사용 예시
```javascript
import { productAPI } from '../utils/api';

const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    const formData = new FormData();
    formData.append('name', formData.name);
    formData.append('category', formData.category);
    formData.append('price', formData.price);
    formData.append('originalPrice', formData.originalPrice || '0');
    formData.append('stock', formData.stock);
    formData.append('description', formData.description);
    
    if (formData.image) {
      formData.append('image', formData.image);
    }
    
    // API 호출 (쿠키 자동 포함)
    const response = await productAPI.createProduct(formData);
    
    console.log('상품 등록 성공:', response);
    alert('상품이 등록되었습니다!');
    
  } catch (error) {
    console.error('상품 등록 실패:', error);
    const errorMessage = error.response?.data?.message || error.message;
    alert(`상품 등록 실패: ${errorMessage}`);
  }
};
```

## 📡 전체 API 목록

### 1. 상품 API (`productAPI`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `getProducts()` | `GET /api/products` | 상품 목록 조회 |
| `getProduct(id)` | `GET /api/products/:id` | 상품 상세 조회 |
| `createProduct(formData)` | `POST /api/product/upload` | 상품 등록 ⭐ |
| `updateProduct(id, formData)` | `PUT /api/products/:id` | 상품 수정 |
| `deleteProduct(id)` | `DELETE /api/products/:id` | 상품 삭제 |
| `bulkDeleteProducts(ids)` | `DELETE /api/products/bulk-delete` | 상품 일괄 삭제 |

### 2. 인증 API (`authAPI`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `login(email, password)` | `POST /api/auth/login` | 로그인 |
| `logout()` | `POST /api/auth/logout` | 로그아웃 |
| `getCurrentUser()` | `GET /api/auth/me` | 현재 사용자 정보 |
| `signup(userData)` | `POST /api/auth/signup` | 회원가입 |

### 3. 출입 요청 API (`accessRequestAPI`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `getRequests()` | `GET /api/access-requests` | 출입 요청 목록 |
| `approveRequest(id)` | `POST /api/access-requests/:id/approve` | 출입 승인 |
| `rejectRequest(id)` | `POST /api/access-requests/:id/reject` | 출입 거부 |
| `createRequest(type)` | `POST /api/access-requests` | 출입 요청 생성 |

### 4. 문 제어 API (`doorControlAPI`)

| 메서드 | 엔드포인트 | 설명 |
|--------|-----------|------|
| `openDoor()` | `POST /api/door/open` | 문 열기 |
| `closeDoor()` | `POST /api/door/close` | 문 닫기 |
| `activateEmergencyMode()` | `POST /api/door/emergency-mode` | 긴급 모드 활성화 |

## 🔧 백엔드 CORS 설정

백엔드에서 다음과 같이 CORS를 설정해야 합니다:

### Express.js 예시
```javascript
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000', // React 앱 URL
  credentials: true // 쿠키 허용 ⭐
}));
```

### Spring Boot 예시
```java
@Configuration
public class WebConfig implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:3000")
                .allowCredentials(true) // 쿠키 허용 ⭐
                .allowedMethods("GET", "POST", "PUT", "DELETE");
    }
}
```

## 🍪 쿠키 설정 예시

### Express.js
```javascript
res.cookie('sessionId', sessionId, {
  httpOnly: true,      // XSS 방지
  secure: false,       // production에서는 true (HTTPS)
  sameSite: 'lax',     // CSRF 방지
  maxAge: 24 * 60 * 60 * 1000 // 24시간
});
```

### Spring Boot
```java
Cookie cookie = new Cookie("JSESSIONID", sessionId);
cookie.setHttpOnly(true);
cookie.setSecure(false); // production에서는 true
cookie.setPath("/");
cookie.setMaxAge(24 * 60 * 60); // 24시간
response.addCookie(cookie);
```

## ⚠️ 에러 처리

### 401 Unauthorized
인증 실패 시 자동으로 메인 페이지로 리다이렉트됩니다:
```javascript
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      window.location.href = '/'; // 로그인 페이지로 리다이렉트
    }
    return Promise.reject(error);
  }
);
```

### 에러 메시지 표시
```javascript
catch (error) {
  const errorMessage = error.response?.data?.message || error.message || '알 수 없는 오류';
  alert(`에러: ${errorMessage}`);
}
```

## 🌐 환경 변수

`.env` 파일 생성:
```bash
REACT_APP_API_URL=http://localhost:8080
```

개발/프로덕션 환경 분리:
- `.env.development`: `http://localhost:8080`
- `.env.production`: `https://api.khanyisa.com`

## 🧪 테스트 방법

### 1. 백엔드 서버 실행
```bash
# 포트 8080에서 실행
```

### 2. React 앱 실행
```bash
cd FACT_DESIGN/REACT
npm start
```

### 3. 상품 등록 테스트
1. 메인 페이지에서 "상품 등록" 클릭
2. 상품 정보 입력
3. 이미지 업로드
4. "등록하기" 클릭
5. 개발자 도구 Network 탭에서 요청 확인:
   - URL: `http://localhost:8080/api/product/upload`
   - Method: `POST`
   - Content-Type: `multipart/form-data`
   - Cookies: 자동 포함됨

## 📝 디버깅 팁

### Console에서 FormData 확인
```javascript
for (let [key, value] of formData.entries()) {
  console.log(key, value);
}
```

### Network 탭에서 확인 사항
- ✅ Request Headers에 `Cookie` 포함
- ✅ Request Payload에 FormData 포함
- ✅ Response 상태 코드 (200, 201 등)
- ✅ Response Body에 성공 메시지

### 일반적인 문제 해결

1. **CORS 에러**
   - 백엔드에서 `credentials: true` 설정 확인
   - `Access-Control-Allow-Origin`에 정확한 URL 설정

2. **쿠키가 전송되지 않음**
   - axios에서 `withCredentials: true` 확인
   - 백엔드에서 `credentials: true` 확인

3. **401 Unauthorized**
   - 로그인 상태 확인
   - 쿠키 만료 시간 확인
   - 백엔드 세션 설정 확인

4. **이미지 업로드 실패**
   - FormData에 파일이 올바르게 추가되었는지 확인
   - 백엔드에서 파일 크기 제한 확인
   - Content-Type이 `multipart/form-data`인지 확인












