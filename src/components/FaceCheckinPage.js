// src/components/FaceRegisterPage.js
import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from 'react-router-dom';
import Webcam from "react-webcam";
import axios from "axios";
import Background from "./Background";
import "../face.css";
 

const API_URL = "http://172.111.121.77:8000/api/register_face_step";

const FaceRegisterPage = () => {
  const webcamRef = useRef(null);
  const navigate = useNavigate();

  const [scanStatus, setScanStatus] = useState("얼굴을 프레임 안에 맞춰주세요");
  const [step, setStep] = useState(0); // 0=대기, 1~5=방향별 촬영
  const [countdown, setCountdown] = useState(null);
  const [uploaded, setUploaded] = useState(false);

  // 같은 step에서 재시작 강제 트리거(동일 step 재촬영)
  const [retryTick, setRetryTick] = useState(0);

  const directions = ["정면", "위쪽", "아래쪽", "왼쪽", "오른쪽"];

  const videoConstraints = {
    width: 640,
    height: 480,
    facingMode: "user",
  };

  // 초기 3초 후 인식 → step 1 시작
  useEffect(() => {
    if (step === 0) {
      setScanStatus("얼굴을 프레임 안에 맞춰주세요");
      const timer = setTimeout(() => {
        setScanStatus("얼굴이 인식되었습니다!");
        setStep(1);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  // 각 step마다 카운트다운 후 캡처 → 즉시 업로드(A안)
  useEffect(() => {
    if (uploaded) return;

    if (step > 0 && step <= directions.length) {
      const direction = directions[step - 1];
      setScanStatus(`${direction}을(를) 바라봐주세요`);

      let count = 3;
      setCountdown(count);

      const interval = setInterval(() => {
        count -= 1;
        setCountdown(count);

        if (count === 0) {
          clearInterval(interval);
          captureAndUpload(step);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [step, uploaded, retryTick]); // retryTick 바뀌면 동일 step 재실행

  // 캡처 → 곧장 백엔드 호출
  const captureAndUpload = async (currentStep) => {
    // 모바일/브라우저에서 첫 프레임 null 방지용 약간의 대기 + 1회 재시도
    await new Promise((r) => setTimeout(r, 150));
    let img = webcamRef.current?.getScreenshot();
    if (!img) {
      await new Promise((r) => setTimeout(r, 150));
      img = webcamRef.current?.getScreenshot();
    }
    if (!img) {
      setScanStatus("카메라 준비 중 — 다시 촬영합니다.");
      setTimeout(() => setRetryTick((t) => t + 1), 800);
      return;
    }

    setScanStatus(`${directions[currentStep - 1]} 촬영 중...`);

    try {
      const blob = await fetch(img).then((res) => res.blob());
      const formData = new FormData();
      formData.append("step", String(currentStep));           // ✅ 백엔드 시그니처와 일치
      formData.append("file", blob, `face_${currentStep}.jpg`);

      // validateStatus로 4xx/5xx도 catch 대신 data 확인 가능
      const res = await axios.post(API_URL, formData, { validateStatus: () => true });

      const ok = res?.data?.success === true;
      if (!ok) {
        // DeepFace 검출 실패 또는 서버 로직 실패 → 동일 step 재촬영
        const msg = res?.data?.message || res?.data?.error || "재촬영이 필요합니다.";
        setScanStatus(`❗ ${directions[currentStep - 1]} 재촬영 필요 — ${msg}`);
        setTimeout(() => setRetryTick((t) => t + 1), 1200);
        return;
      }

      // 성공 → 다음 step 혹은 완료
      if (currentStep === 5) {
        setScanStatus("얼굴 등록이 완료되었습니다!");
        setUploaded(true);
      } else {
        setScanStatus(`${directions[currentStep - 1]} 저장 완료`);
        setTimeout(() => setStep(currentStep + 1), 900);
      }
    } catch (err) {
      setScanStatus("서버 오류 — 다시 촬영해주세요.");
      setTimeout(() => setRetryTick((t) => t + 1), 1200);
    }
  };

  // 업로드 완료 후 UI 고정(기존 그대로)
  if (uploaded) {
    return (
      <div className="App">
        <Background />
        <main className="container">
          <section className="card hero">
            <h1>🎉 얼굴 등록 완료!</h1>
            <p>얼굴 정보가 성공적으로 등록되었습니다.</p>
            <p>이제 메인 페이지로 이동하실 수 있습니다.</p>
            <button className="btn kakao-primary" onClick={() => navigate('/')}>메인 페이지</button>
          </section>
        </main>
      </div>
    );
  }

  // ★ UI는 기존 그대로 유지 ★
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
                  <path
                    d="M16 0C7.163 0 0 7.163 0 16s7.163 16 16 16 16-7.163 16-16S24.837 0 16 0zm0 28C9.373 28 4 22.627 4 16S9.373 4 16 4s12 5.373 12 12-5.373 12-12 12z"
                    fill="currentColor"
                  />
                  <path
                    d="M16 8c-4.411 0-8 3.589-8 8s3.589 8 8 8 8-3.589 8-8-3.589-8-8-8zm0 14c-3.314 0-6-2.686-6-6s2.686-6 6-6 6 2.686 6 6-2.686 6-6 6z"
                    fill="currentColor"
                  />
                </svg>
              </div>
              <div className="brand-text">
                <div className="kakao-badge">KHAYISA</div>
                <h1>얼굴 등록</h1>
              </div>
            </div>

            <p className="subtitle">얼굴 정보를 등록해주세요.</p>
          </div>
        </section>

        {/* Camera Section */}
        <section className="card">
          <div className="face-camera-container">
            <div className="face-camera">
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                screenshotQuality={0.95}
                videoConstraints={videoConstraints}
                className="camera-video"
              />

              <div className="camera-frame">
                <div className="face-overlay">
                  {/* <div className="face-outline"> */}
                    <div className="face-corners">
                      <div className="face-guide"></div>
                    </div>
                  {/* </div> */}
                  {/* <div className="face-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path
                        d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <circle
                        cx="12"
                        cy="7"
                        r="4"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div> */}
                  <div className="face-text">
                    {countdown ? `${scanStatus} (${countdown})` : scanStatus}
                  </div>
                </div>
              </div>
            </div>

            <div className="face-status">
              <div className="status-indicator">
                <div className="status-dot scanning"></div>
                
              </div>
            </div>
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

export default FaceRegisterPage;
