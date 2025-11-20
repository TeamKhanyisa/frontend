// WebCrypto API를 사용한 암호화 유틸리티

/**
 * RSA 키 쌍 생성 (개인키와 공개키)
 * 개인키는 extractable: true로 생성되어 localStorage에 저장 가능
 * @returns {Promise<{privateKey: CryptoKey, publicKey: CryptoKey}>}
 */
export const generateKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSA-OAEP',
        modulusLength: 2048, // 2048비트 키
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true, // extractable: true - 키를 내보내서 localStorage에 저장 가능
      ['encrypt', 'decrypt'] // 사용 용도
    );

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    };
  } catch (error) {
    console.error('키 쌍 생성 실패:', error);
    throw new Error('키 쌍 생성에 실패했습니다.');
  }
};

/**
 * CryptoKey를 PEM 형식의 문자열로 변환
 * @param {CryptoKey} key - 변환할 키
 * @param {boolean} isPrivate - 개인키 여부
 * @returns {Promise<string>} PEM 형식의 키 문자열
 */
export const exportKeyToPEM = async (key, isPrivate = false) => {
  try {
    const format = isPrivate ? 'pkcs8' : 'spki';
    const exported = await window.crypto.subtle.exportKey(format, key);
    const exportedAsBuffer = new Uint8Array(exported);
    const exportedAsBase64 = btoa(String.fromCharCode(...exportedAsBuffer));
    const header = isPrivate
      ? '-----BEGIN PRIVATE KEY-----\n'
      : '-----BEGIN PUBLIC KEY-----\n';
    const footer = isPrivate
      ? '\n-----END PRIVATE KEY-----'
      : '\n-----END PUBLIC KEY-----';
    
    // 64자마다 줄바꿈 추가
    const base64WithLineBreaks = exportedAsBase64.match(/.{1,64}/g)?.join('\n') || exportedAsBase64;
    
    return header + base64WithLineBreaks + footer;
  } catch (error) {
    console.error('키 변환 실패:', error);
    throw new Error('키를 PEM 형식으로 변환하는데 실패했습니다.');
  }
};

/**
 * PEM 형식의 키 문자열에서 순수 Base64 문자열만 추출
 * 헤더, 푸터, 줄바꿈 문자를 모두 제거
 * @param {string} pemKey - PEM 형식의 키 문자열
 * @returns {string} 순수 Base64 문자열
 */
export const extractBase64FromPEM = (pemKey) => {
  if (!pemKey) {
    return '';
  }
  
  // PEM 헤더와 푸터 제거, 모든 공백(줄바꿈, 공백 등) 제거
  return pemKey
    .replace(/-----BEGIN (PRIVATE|PUBLIC) KEY-----/g, '')
    .replace(/-----END (PRIVATE|PUBLIC) KEY-----/g, '')
    .replace(/\s/g, ''); // 모든 공백 문자 제거 (줄바꿈, 공백 등)
};

/**
 * PEM 형식의 키 문자열을 CryptoKey로 복원
 * @param {string} pemKey - PEM 형식의 키 문자열
 * @param {boolean} isPrivate - 개인키 여부
 * @param {string} algorithm - 알고리즘 이름 ('RSA-OAEP', 'RSASSA-PKCS1-v1_5' 등)
 * @param {string[]} keyUsages - 키 사용 용도 (['encrypt', 'decrypt'] 또는 ['sign', 'verify'])
 * @returns {Promise<CryptoKey>} CryptoKey 객체
 */
export const importKeyFromPEM = async (pemKey, isPrivate, algorithm = 'RSA-OAEP', keyUsages = ['encrypt', 'decrypt']) => {
  try {
    // PEM 헤더와 푸터 제거
    const base64Key = pemKey
      .replace(/-----BEGIN (PRIVATE|PUBLIC) KEY-----/g, '')
      .replace(/-----END (PRIVATE|PUBLIC) KEY-----/g, '')
      .replace(/\s/g, ''); // 모든 공백 제거

    // Base64 디코딩
    const binaryString = atob(base64Key);
    const keyBuffer = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      keyBuffer[i] = binaryString.charCodeAt(i);
    }

    // CryptoKey로 가져오기
    const format = isPrivate ? 'pkcs8' : 'spki';
    const key = await window.crypto.subtle.importKey(
      format,
      keyBuffer,
      {
        name: algorithm,
        hash: 'SHA-256',
      },
      false, // extractable: false로 복원 (보안 강화)
      keyUsages
    );

    return key;
  } catch (error) {
    console.error('키 복원 실패:', error);
    throw new Error('키를 CryptoKey로 복원하는데 실패했습니다.');
  }
};

// 메모리 기반 키 캐시 (성능 최적화용)
let privateKeyCache = null;

/**
 * 개인키를 localStorage에 저장
 * 개인키를 PEM 형식으로 변환하여 localStorage에 저장
 * 공개키는 전송 형식(헤더/푸터/개행 제거된 순수 Base64)으로 저장
 * @param {CryptoKey} privateKey - CryptoKey 객체 (extractable: true)
 * @param {string} publicKeyPEM - 공개키 PEM 문자열 (선택적)
 * @returns {Promise<void>}
 */
export const savePrivateKey = async (privateKey, publicKeyPEM = null) => {
  try {
    // 메모리 캐시에도 저장 (성능 최적화)
    privateKeyCache = privateKey;
    
    // 개인키를 PEM 형식으로 변환
    const privateKeyPEM = await exportKeyToPEM(privateKey, true);
    
    // localStorage에 PEM 형식의 개인키와 공개키 저장
    const keyData = {
      privateKeyPEM: privateKeyPEM,
      createdAt: new Date().toISOString(),
    };
    
    // 공개키가 제공되면 전송 형식(헤더/푸터/개행 제거된 순수 Base64)으로 변환하여 저장
    if (publicKeyPEM) {
      // PEM 형식에서 순수 Base64 문자열만 추출 (백엔드 전송 형식과 동일)
      const publicKeyBase64 = publicKeyPEM
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '') // 개행 문자 제거
        .replace(/\r/g, '') // 캐리지 리턴 제거
        .replace(/\s/g, ''); // 모든 공백 문자 제거
      
      keyData.publicKeyPEM = publicKeyBase64;
    }

    localStorage.setItem('userPrivateKey', JSON.stringify(keyData));
    console.log('개인키 localStorage 저장 완료');
  } catch (error) {
    console.error('개인키 저장 실패:', error);
    throw new Error('개인키 저장에 실패했습니다.');
  }
};

/**
 * localStorage에서 개인키 가져오기
 * 메모리 캐시가 있으면 우선 사용, 없으면 localStorage에서 읽어와서 복원
 * @returns {Promise<CryptoKey|null>} CryptoKey 객체 또는 null
 */
export const getPrivateKey = async () => {
  try {
    // 메모리 캐시에서 키 가져오기 (성능 최적화)
    if (privateKeyCache) {
      return privateKeyCache;
    }

    // localStorage에서 개인키 읽기
    const keyDataStr = localStorage.getItem('userPrivateKey');
    if (!keyDataStr) {
      return null;
    }

    const result = JSON.parse(keyDataStr);

    // localStorage에 개인키가 있는 경우 PEM 형식에서 CryptoKey로 복원
    if (result?.privateKeyPEM) {
      try {
        const privateKey = await importKeyFromPEM(
          result.privateKeyPEM,
          true,
          'RSA-OAEP',
          ['encrypt', 'decrypt']
        );
        // 메모리 캐시에 저장
        privateKeyCache = privateKey;
        return privateKey;
      } catch (importError) {
        console.error('개인키 복원 실패:', importError);
        // 복원 실패 시 localStorage에서 해당 키 삭제 (손상된 키일 수 있음)
        localStorage.removeItem('userPrivateKey');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('개인키 읽기 실패:', error);
    return null;
  }
};

/**
 * 개인키 삭제
 * 메모리와 localStorage 모두에서 삭제
 * @returns {Promise<void>}
 */
export const clearPrivateKey = async () => {
  try {
    // 메모리 캐시 삭제
    privateKeyCache = null;

    // localStorage에서 개인키 삭제
    localStorage.removeItem('userPrivateKey');
    console.log('개인키 localStorage 삭제 완료');
  } catch (error) {
    console.error('개인키 삭제 실패:', error);
    throw error; // 에러를 다시 throw하여 상위에서 처리 가능하도록
  }
};

/**
 * 서명용 개인키 삭제
 * 메모리와 localStorage 모두에서 삭제
 * @returns {Promise<void>}
 */
export const clearSigningPrivateKey = async () => {
  try {
    // 메모리 캐시 삭제
    signingPrivateKeyCache = null;

    // localStorage에서 서명용 개인키 삭제
    localStorage.removeItem('userSigningPrivateKey');
    console.log('서명용 개인키 localStorage 삭제 완료');
  } catch (error) {
    console.error('서명용 개인키 삭제 실패:', error);
    throw error; // 에러를 다시 throw하여 상위에서 처리 가능하도록
  }
};

/**
 * 모든 개인키 삭제 (암호화용 + 서명용)
 * 로그아웃 시 사용
 * @returns {Promise<void>}
 */
export const clearAllPrivateKeys = async () => {
  try {
    // 각 키 삭제를 순차적으로 실행하여 확실히 완료되도록 함
    await clearPrivateKey();
    await clearSigningPrivateKey();
    
    // 삭제 확인: localStorage에서 실제로 삭제되었는지 확인
    const privateKeyExists = localStorage.getItem('userPrivateKey') !== null;
    const signingKeyExists = localStorage.getItem('userSigningPrivateKey') !== null;
    
    if (privateKeyExists) {
      console.warn('경고: 개인키가 여전히 localStorage에 존재합니다.');
    }
    if (signingKeyExists) {
      console.warn('경고: 서명용 개인키가 여전히 localStorage에 존재합니다.');
    }
    
    if (!privateKeyExists && !signingKeyExists) {
      console.log('모든 개인키 삭제 완료 및 확인됨');
    } else {
      console.warn('일부 개인키가 삭제되지 않았을 수 있습니다.');
    }
  } catch (error) {
    console.error('모든 개인키 삭제 실패:', error);
    // 에러가 발생해도 계속 진행 (로그아웃은 완료되어야 함)
  }
};

/**
 * 키 쌍 생성 및 공개키를 PEM 형식으로 반환
 * 개인키는 extractable: true로 생성되어 localStorage에 PEM 형식으로 저장됨
 * @returns {Promise<{publicKeyPEM: string}>}
 */
export const generateAndExportKeyPair = async () => {
  try {
    // 키 쌍 생성 (개인키는 extractable: true)
    const { privateKey, publicKey } = await generateKeyPair();
    
    // 공개키를 PEM 형식으로 변환
    const publicKeyPEM = await exportKeyToPEM(publicKey, false);
    
    // 개인키와 공개키를 localStorage에 PEM 형식으로 저장
    await savePrivateKey(privateKey, publicKeyPEM);
    
    return {
      publicKeyPEM,
    };
  } catch (error) {
    console.error('키 생성 및 변환 실패:', error);
    throw error;
  }
};

/**
 * 기존 개인키가 있으면 공개키를 반환, 없으면 새로 생성
 * 로그인 시 사용하여 기존 키를 재사용하거나 새 키를 생성
 * @returns {Promise<{publicKeyPEM: string, isNew: boolean}>}
 */
export const getOrGenerateKeyPair = async () => {
  try {
    // 기존 개인키 확인
    const existingPrivateKey = await getPrivateKey();
    
    if (existingPrivateKey) {
      // 기존 개인키가 있는 경우, 저장된 공개키를 가져오거나 개인키에서 추출
      const keyDataStr = localStorage.getItem('userPrivateKey');
      if (keyDataStr) {
        const result = JSON.parse(keyDataStr);
        
        // 저장된 공개키가 있으면 사용
        if (result?.publicKeyPEM) {
          return {
            publicKeyPEM: result.publicKeyPEM,
            isNew: false,
          };
        }
      }
      
      // 공개키가 없으면 개인키에서 공개키 추출 불가능하므로 새로 생성
      // (RSA 키 쌍에서는 개인키에서 공개키를 직접 추출할 수 없음)
      console.warn('저장된 공개키가 없습니다. 새 키 쌍을 생성합니다.');
      const { publicKeyPEM } = await generateAndExportKeyPair();
      return {
        publicKeyPEM,
        isNew: true,
      };
    } else {
      // 개인키가 없으면 새로 생성
      const { publicKeyPEM } = await generateAndExportKeyPair();
      return {
        publicKeyPEM,
        isNew: true,
      };
    }
  } catch (error) {
    console.error('키 쌍 가져오기 또는 생성 실패:', error);
    throw error;
  }
};

/**
 * 서명용 RSA 키 쌍 생성 (RSA-PKCS1-v1_5 알고리즘, RSA-SHA256과 호환)
 * 개인키는 extractable: true로 생성되어 localStorage에 저장 가능
 * @returns {Promise<{privateKey: CryptoKey, publicKey: CryptoKey}>}
 */
export const generateSigningKeyPair = async () => {
  try {
    const keyPair = await window.crypto.subtle.generateKey(
      {
        name: 'RSASSA-PKCS1-v1_5', // RSA-SHA256과 호환되는 알고리즘
        modulusLength: 2048, // 2048비트 키
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true, // extractable: true - 키를 내보내서 localStorage에 저장 가능
      ['sign', 'verify'] // 서명 및 검증 용도
    );

    return {
      privateKey: keyPair.privateKey,
      publicKey: keyPair.publicKey,
    };
  } catch (error) {
    console.error('서명용 키 쌍 생성 실패:', error);
    throw new Error('서명용 키 쌍 생성에 실패했습니다.');
  }
};

/**
 * 서명용 키 쌍 생성 및 공개키를 Base64 형식으로 반환
 * 개인키는 extractable: true로 생성되어 localStorage에 PEM 형식으로 저장됨
 * @returns {Promise<{publicKeyBase64: string}>}
 */
export const generateAndExportSigningKeyPair = async () => {
  try {
    // 키 쌍 생성 (개인키는 extractable: true)
    const { privateKey, publicKey } = await generateSigningKeyPair();
    
    // 공개키를 PEM 형식으로 변환
    const publicKeyPEM = await exportKeyToPEM(publicKey, false);
    
    // 개인키와 공개키를 localStorage에 저장
    await saveSigningPrivateKey(privateKey, publicKey);
    
    // 공개키를 Base64 형식으로 변환 (서버 전송용)
    const publicKeyBase64 = publicKeyPEM
      .replace(/-----BEGIN PUBLIC KEY-----/g, '')
      .replace(/-----END PUBLIC KEY-----/g, '')
      .replace(/\n/g, '') // 개행 문자 제거
      .replace(/\r/g, '') // 캐리지 리턴 제거
      .replace(/\s/g, ''); // 모든 공백 문자 제거
    
    return {
      publicKeyBase64,
    };
  } catch (error) {
    console.error('서명용 키 생성 및 변환 실패:', error);
    throw error;
  }
};

/**
 * 기존 서명용 개인키가 있으면 공개키를 반환, 없으면 새로 생성
 * 로그인 시 사용하여 기존 키를 재사용하거나 새 키를 생성
 * @returns {Promise<{publicKeyBase64: string, isNew: boolean}>}
 */
export const getOrGenerateSigningKeyPair = async () => {
  try {
    // 기존 서명용 개인키 확인
    const existingPrivateKey = await getSigningPrivateKey();
    
    if (existingPrivateKey) {
      // 기존 개인키가 있는 경우, 저장된 공개키를 가져오기
      const savedPublicKey = await getSigningPublicKey();
      
      if (savedPublicKey) {
        return {
          publicKeyBase64: savedPublicKey,
          isNew: false,
        };
      }
      
      // 공개키가 없으면 새로 생성
      console.warn('저장된 서명용 공개키가 없습니다. 새 키 쌍을 생성합니다.');
    }
    
    // 개인키가 없거나 공개키가 없는 경우 새로 생성
    const { publicKeyBase64 } = await generateAndExportSigningKeyPair();
    return {
      publicKeyBase64,
      isNew: true,
    };
  } catch (error) {
    console.error('서명용 키 쌍 가져오기 또는 생성 실패:', error);
    throw error;
  }
};

// 서명용 개인키 캐시 (성능 최적화용)
let signingPrivateKeyCache = null;

/**
 * 서명용 개인키를 localStorage에 저장
 * 개인키를 PEM 형식으로 변환하여 localStorage에 저장
 * 공개키도 함께 저장 (서버 전송용)
 * @param {CryptoKey} privateKey - 서명용 개인키 CryptoKey 객체 (extractable: true)
 * @param {CryptoKey} publicKey - 서명용 공개키 CryptoKey 객체 (선택적)
 * @returns {Promise<void>}
 */
export const saveSigningPrivateKey = async (privateKey, publicKey = null) => {
  try {
    // 메모리 캐시에도 저장 (성능 최적화)
    signingPrivateKeyCache = privateKey;
    
    // 개인키를 PEM 형식으로 변환
    const privateKeyPEM = await exportKeyToPEM(privateKey, true);
    
    // localStorage에 PEM 형식의 개인키 저장
    const keyData = {
      privateKeyPEM: privateKeyPEM,
      createdAt: new Date().toISOString(),
    };

    // 공개키가 제공되면 전송 형식(헤더/푸터/개행 제거된 순수 Base64)으로 변환하여 저장
    if (publicKey) {
      const publicKeyPEM = await exportKeyToPEM(publicKey, false);
      // PEM 형식에서 순수 Base64 문자열만 추출 (백엔드 전송 형식과 동일)
      const publicKeyBase64 = publicKeyPEM
        .replace(/-----BEGIN PUBLIC KEY-----/g, '')
        .replace(/-----END PUBLIC KEY-----/g, '')
        .replace(/\n/g, '') // 개행 문자 제거
        .replace(/\r/g, '') // 캐리지 리턴 제거
        .replace(/\s/g, ''); // 모든 공백 문자 제거
      
      keyData.publicKeyPEM = publicKeyBase64;
    }

    localStorage.setItem('userSigningPrivateKey', JSON.stringify(keyData));
    console.log('서명용 개인키 localStorage 저장 완료');
  } catch (error) {
    console.error('서명용 개인키 저장 실패:', error);
    throw new Error('서명용 개인키 저장에 실패했습니다.');
  }
};

/**
 * localStorage에서 서명용 개인키 가져오기
 * 메모리 캐시가 있으면 우선 사용, 없으면 localStorage에서 읽어와서 복원
 * @returns {Promise<CryptoKey|null>} 서명용 개인키 CryptoKey 객체 또는 null
 */
export const getSigningPrivateKey = async () => {
  try {
    // 메모리 캐시에서 키 가져오기 (성능 최적화)
    if (signingPrivateKeyCache) {
      return signingPrivateKeyCache;
    }

    // localStorage에서 개인키 읽기
    const keyDataStr = localStorage.getItem('userSigningPrivateKey');
    if (!keyDataStr) {
      return null;
    }

    const result = JSON.parse(keyDataStr);

    // localStorage에 개인키가 있는 경우 PEM 형식에서 CryptoKey로 복원
    if (result?.privateKeyPEM) {
      try {
        const privateKey = await importKeyFromPEM(
          result.privateKeyPEM,
          true,
          'RSASSA-PKCS1-v1_5',
          ['sign', 'verify']
        );
        // 메모리 캐시에 저장
        signingPrivateKeyCache = privateKey;
        return privateKey;
      } catch (importError) {
        console.error('서명용 개인키 복원 실패:', importError);
        // 복원 실패 시 localStorage에서 해당 키 삭제 (손상된 키일 수 있음)
        localStorage.removeItem('userSigningPrivateKey');
        return null;
      }
    }

    return null;
  } catch (error) {
    console.error('서명용 개인키 읽기 실패:', error);
    return null;
  }
};

/**
 * 서명용 공개키 가져오기 (서버 전송용)
 * localStorage에서 서명용 키의 공개키를 가져옴
 * @returns {Promise<string|null>} Base64 형식의 공개키 문자열 또는 null
 */
export const getSigningPublicKey = async () => {
  try {
    const keyDataStr = localStorage.getItem('userSigningPrivateKey');
    if (!keyDataStr) {
      return null;
    }

    const result = JSON.parse(keyDataStr);
    
    // 저장된 공개키가 있으면 반환
    if (result?.publicKeyPEM) {
      return result.publicKeyPEM;
    }

    return null;
  } catch (error) {
    console.error('서명용 공개키 읽기 실패:', error);
    return null;
  }
};

/**
 * 데이터를 개인키로 서명 (백엔드와 동일한 로직)
 * Node.js crypto.createSign('RSA-SHA256') 로직과 동일하게 구현
 * @param {Object} data - 서명할 데이터 객체
 * @returns {Promise<string>} Base64로 인코딩된 서명 문자열
 */
export const signData = async (data) => {
  try {
    // 서명용 개인키 가져오기
    let privateKey = await getSigningPrivateKey();
    
    // 키가 없으면 생성
    if (!privateKey) {
      const { privateKey: newPrivateKey, publicKey: newPublicKey } = await generateSigningKeyPair();
      await saveSigningPrivateKey(newPrivateKey, newPublicKey);
      privateKey = newPrivateKey;
    }

    // 1단계: 데이터를 키 순서대로 정렬하여 JSON 문자열로 변환
    const dataString = JSON.stringify(data, Object.keys(data).sort());

    // 2단계: RSA-SHA256 알고리즘으로 서명 객체 생성
    // (Web Crypto API에서는 RSASSA-PKCS1-v1_5를 사용하며, 이는 Node.js의 RSA-SHA256과 동일)
    // Node.js의 crypto.createSign('RSA-SHA256')에 해당

    // 3단계: 데이터 문자열을 UTF-8로 인코딩하여 업데이트
    // Node.js의 sign.update(dataString, 'utf8')에 해당
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(dataString);

    // 4단계: 서명 프로세스 종료
    // (Web Crypto API에서는 sign() 호출 시 자동으로 처리되므로 별도 작업 불필요)
    // Node.js의 sign.end()에 해당

    // 5단계: 개인키로 서명하고 Base64로 인코딩
    // Node.js의 sign.sign(privateKeyPem, 'base64')에 해당
    const signature = await window.crypto.subtle.sign(
      {
        name: 'RSASSA-PKCS1-v1_5', // RSA-SHA256과 호환
      },
      privateKey,
      dataBuffer
    );

    // 서명을 Base64 문자열로 변환
    const signatureArray = new Uint8Array(signature);
    const signatureBase64 = btoa(String.fromCharCode(...signatureArray));

    return signatureBase64;
  } catch (error) {
    console.error('데이터 서명 실패:', error);
    throw new Error('데이터 서명에 실패했습니다.');
  }
};

