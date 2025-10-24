# Khanyisa React App

Khanyisa 케이크샵의 React 버전입니다.

## 프로젝트 구조

```
REACT/
├── public/
│   ├── images/
│   │   ├── strawberry-cake.svg
│   │   ├── chocolate-cake.svg
│   │   ├── cheesecake.svg
│   │   └── tiramisu.svg
│   └── index.html
├── src/
│   ├── components/
│   │   ├── Background.js
│   │   ├── HomePage.js
│   │   ├── LoginSection.js
│   │   ├── QuickAccessSection.js
│   │   ├── AdminSection.js
│   │   ├── CakesPage.js
│   │   ├── ProductRegisterPage.js
│   │   ├── ProductEditPage.js
│   │   ├── ProductDeletePage.js
│   │   └── AdminControlPage.js
│   ├── utils/
│   │   └── api.js (쿠키 기반 API 통신)
│   ├── App.js
│   ├── index.js
│   └── index.css
├── package.json
└── README.md
```

## 설치 및 실행

1. 의존성 설치:
```bash
npm install
```

2. 개발 서버 실행:
```bash
npm start
```

3. 브라우저에서 `http://localhost:3000` 접속

## 빌드

```bash
npm run build
```

## 페이지 및 컴포넌트 설명

### 페이지
- **HomePage** (`/`): 메인 페이지
- **CakesPage** (`/cakes`): 상품 목록 페이지 (백엔드 연동)
- **ProductRegisterPage** (`/product-register`): 상품 등록 페이지
- **ProductEditPage** (`/product-edit`): 상품 수정 페이지
- **ProductDeletePage** (`/product-delete`): 상품 삭제 페이지
- **AdminControlPage** (`/admin-control`): 관리자 원격제어 페이지

### 공통 컴포넌트
- **Background.js**: 배경 그라디언트 오브 애니메이션
- **LoginSection.js**: 로그인 섹션
- **QuickAccessSection.js**: 빠른 접근 메뉴
- **AdminSection.js**: 관리자 메뉴

### API 유틸리티 (`src/utils/api.js`)
- **쿠키 기반 인증**: 모든 API 요청에 쿠키 자동 포함
- **상품 API**: 조회, 등록, 수정, 삭제
- **인증 API**: 로그인, 로그아웃, 사용자 정보
- **출입 요청 API**: 조회, 승인, 거부
- **문 제어 API**: 열기, 닫기, 긴급 모드

## 백엔드 연동

### 쿠키 기반 세션 관리
모든 API 요청은 `credentials: 'include'` 옵션으로 쿠키를 자동으로 포함합니다.

### API 엔드포인트 설정
환경 변수 `.env` 파일에서 백엔드 URL 설정:
```
REACT_APP_API_URL=http://localhost:8080/api
```

### API 사용 예시 (axios)
```javascript
import { productAPI } from './utils/api';

// 상품 목록 조회 (쿠키 자동 포함)
const products = await productAPI.getProducts();

// 상품 등록 (쿠키 자동 포함)
// POST /api/product/upload
const formData = new FormData();
formData.append('name', '상품명');
formData.append('price', 35000);
formData.append('image', imageFile);
const newProduct = await productAPI.createProduct(formData);
```

### 상품 등록 API 엔드포인트
- **URL**: `/api/product/upload`
- **Method**: `POST`
- **Content-Type**: `multipart/form-data`
- **쿠키**: 자동 포함 (`withCredentials: true`)


## 스타일

- 다크 테마
- 글래스모피즘 효과
- 반응형 디자인
- 애니메이션 효과

## 주요 기능

- ✅ 쿠키 기반 인증 및 세션 관리
- ✅ 상품 CRUD (등록, 조회, 수정, 삭제)
- ✅ 출입 요청 실시간 관리
- ✅ 문 원격 제어
- ✅ 이미지 업로드 및 미리보기
