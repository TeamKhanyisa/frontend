import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function LogoutCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    // 카카오 로그아웃 완료 후 메인 페이지로 이동
    // localStorage의 토큰은 이미 로그아웃 API에서 삭제됨
    navigate('/');
  }, [navigate]);

  return (
    <div>
      <p>로그아웃 처리 중...</p>
    </div>
  );
}

export default LogoutCallback;

