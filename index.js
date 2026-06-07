// 라이브러리 패키지 진입점은 lib/(빌드 산출물)이고, 본 파일은 example/ 갤러리
// 데모를 react-native start/run-android/run-ios가 찾을 수 있도록 example/
// index.js로 한 줄 redirect한다. 네이티브(android/ios)는 루트 위치 보류 그대로,
// JS entry만 example로 우회.
require('./example/index.js');
