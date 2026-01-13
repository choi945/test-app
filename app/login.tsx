import { getApiUrl } from '@/constants/api';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { WebView } from 'react-native-webview';

export default function LoginScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const webViewRef = useRef<WebView>(null);
  const qrData = params.qrData as string | undefined;
  const [isLoading, setIsLoading] = useState(false);

  // 로그인 API 호출
  const handleLogin = async (userId: string, password: string, autoLogin: boolean) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          password,
          autoLogin,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 로그인 성공
        console.log('로그인 성공:', data.data.user);
        // 자동로그인 정보 저장 (필요시 AsyncStorage 사용)
        if (autoLogin) {
          // TODO: 세션 토큰 저장
        }
        // 메인 화면으로 이동
        router.replace('/(tabs)');
      } else {
        Alert.alert('로그인 실패', data.message || '아이디 또는 비밀번호가 올바르지 않습니다.');
      }
    } catch (error: any) {
      console.error('로그인 오류:', error);
      console.error('API URL:', getApiUrl());
      console.error('에러 상세:', error.message);
      
      let errorMessage = '서버에 연결할 수 없습니다.\n\n';
      
      if (error.message?.includes('Network request failed')) {
        errorMessage += '가능한 원인:\n';
        errorMessage += '1. 서버가 실행 중인지 확인\n';
        errorMessage += '2. URL이 올바른지 확인\n';
        errorMessage += '3. 실제 기기 사용 시 IP 주소 확인\n';
        errorMessage += `\n현재 API URL: ${getApiUrl()}`;
      } else {
        errorMessage += error.message || '알 수 없는 오류가 발생했습니다.';
      }
      
      Alert.alert('연결 오류', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // WebView에서 메시지 수신 처리
  const handleMessage = (event: any) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      
      if (message.type === 'navigate') {
        // 회원가입 페이지로 이동
        router.replace(message.path);
      } else if (message.type === 'login') {
        const { userId, password, autoLogin } = message.data;
        
        // 로그인 API 호출
        handleLogin(userId, password, autoLogin);
      }
    } catch (error) {
      console.error('메시지 파싱 오류:', error);
    }
  };

  // HTML 내용 (제공된 HTML 파일 기반)
  const htmlContent = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>FLOXN 로그인</title>
    <script src="https://cdn.tailwindcss.com"></script>
  </head>
  <body class="min-h-screen bg-white text-gray-900">
    <main class="min-h-screen flex items-start justify-center">
      <section class="w-full max-w-[420px] px-6">
        <div class="pt-24 pb-10 flex flex-col items-center">
          <div class="flex flex-col items-center">
            <div class="relative h-20 w-28 mb-3">
              <div class="absolute left-0 top-0 h-14 w-14 rounded-xl bg-black"></div>
              <div class="absolute right-0 top-0 h-14 w-14 rounded-xl bg-[#0A84FF]"></div>
              <div class="absolute left-0 top-12 h-12 w-12 rounded-full border-[10px] border-black"></div>
              <div class="absolute right-0 top-12 h-12 w-12 rounded-full border-[10px] border-black"></div>
              <div class="absolute left-1/2 top-[64px] h-5 w-5 -translate-x-1/2 rotate-45 bg-black"></div>
            </div>
            <div class="text-3xl font-extrabold tracking-wide">FLOXN</div>
          </div>
        </div>
        <form class="space-y-4" id="loginForm">
          <div>
            <label class="sr-only" for="userId">아이디</label>
            <input
              id="userId"
              type="text"
              placeholder="아이디"
              class="w-full h-14 rounded-xl border border-gray-200 bg-white px-5 text-base placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/40"
            />
          </div>
          <div class="relative">
            <label class="sr-only" for="password">비밀번호</label>
            <input
              id="password"
              type="password"
              placeholder="비밀번호"
              class="w-full h-14 rounded-xl border border-gray-200 bg-white px-5 pr-14 text-base placeholder:text-gray-400
                     focus:outline-none focus:ring-2 focus:ring-[#0A84FF]/30 focus:border-[#0A84FF]/40"
            />
            <button
              type="button"
              aria-label="비밀번호 보기/숨김"
              class="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600"
              onclick="togglePassword()"
            >
              <svg
                id="eyeIcon"
                xmlns="http://www.w3.org/2000/svg"
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94"></path>
                <path d="M1 1l22 22"></path>
                <path d="M9.9 9.9a3 3 0 0 0 4.24 4.24"></path>
                <path d="M14.12 14.12 9.88 9.88"></path>
                <path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.32 3.19"></path>
              </svg>
            </button>
          </div>
          <div class="flex items-center gap-3 pt-1">
            <input
              id="autoLogin"
              type="checkbox"
              checked
              class="h-5 w-5 rounded border-gray-300 text-[#0A84FF] focus:ring-[#0A84FF]/30"
            />
            <label for="autoLogin" class="text-base text-gray-800">자동로그인</label>
          </div>
          <div class="pt-6">
            <button
              type="submit"
              class="w-full h-14 rounded-2xl bg-[#0A84FF] text-white text-lg font-semibold
                     hover:brightness-95 active:brightness-90 transition"
            >
              로그인
            </button>
          </div>
          <div class="pt-2 text-center">
            <button
              type="button"
              onclick="goToSignup()"
              class="text-[#0A84FF] text-base font-medium"
            >
              계정이 없으신가요? 회원가입
            </button>
          </div>
        </form>
        <div class="h-14"></div>
      </section>
    </main>
    <script>
      function goToSignup() {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "navigate",
            path: "/signup"
          }));
        }
      }

      function togglePassword() {
        const input = document.getElementById("password");
        const eyeIcon = document.getElementById("eyeIcon");
        if (input.type === "password") {
          input.type = "text";
          eyeIcon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
        } else {
          input.type = "password";
          eyeIcon.innerHTML = '<path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-6.94"></path><path d="M1 1l22 22"></path><path d="M9.9 9.9a3 3 0 0 0 4.24 4.24"></path><path d="M14.12 14.12 9.88 9.88"></path><path d="M10.73 5.08A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a21.77 21.77 0 0 1-2.32 3.19"></path>';
        }
      }
      document.getElementById("loginForm").addEventListener("submit", function(e) {
        e.preventDefault();
        const userId = document.getElementById("userId").value;
        const password = document.getElementById("password").value;
        const autoLogin = document.getElementById("autoLogin").checked;
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "login",
            data: { userId, password, autoLogin }
          }));
        } else {
          console.log("Login attempt:", { userId, password, autoLogin });
          alert("로그인 시도: " + userId);
        }
      });
    </script>
  </body>
</html>`;

  return (
    <View style={styles.container}>
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#0A84FF" />
        </View>
      )}
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        // QR 데이터가 있으면 JavaScript로 전달
        injectedJavaScript={qrData ? `window.qrData = ${JSON.stringify(qrData)}; true;` : undefined}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  webview: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
});
