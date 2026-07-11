// ============================================================================
// jest 설정 — @react-native/jest-preset 위에 DS 라이브러리용 정비를 얹는다.
// ============================================================================
//
// preset을 통째로 spread한 뒤 필요한 키만 덮어쓴다. moduleNameMapper 등 preset이
// 세팅한 react-native 매핑을 잃지 않기 위해 반드시 spread 후 병합한다.
//
// [핵심 정비 항목]
// 1) setupFilesAfterEnv: RNTL matcher + 라이브러리 mock 로드 (jest-setup.js).
// 2) transformIgnorePatterns: 기본값은 node_modules를 거의 다 transform 제외한다.
//    reanimated/worklets/gesture-handler/safe-area-context/svg/styled-components는
//    ESM/TS 소스를 배포해 babel 변환이 필요하므로 화이트리스트에 추가(부정형 lookahead).
// 3) '@' alias는 babel-plugin-module-resolver(babel.config.js)가 처리하므로
//    moduleNameMapper 추가 불필요(실사용도 주석 1곳뿐).

const preset = require('@react-native/jest-preset');

// transform에서 제외하지 "않을"(=변환할) node_modules 패키지 목록.
// 이들은 컴파일 전 소스(ESM/TS)를 배포해 babel 변환이 필요하다.
const transformWhitelist = [
  'react-native',
  '@react-native',
  '@react-native-community',
  'react-native-reanimated',
  'react-native-worklets',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-svg',
  'styled-components',
  // example 앱(갤러리) 데모용 — ESM 배포라 transform 필요
  '@react-navigation',
  'react-native-screens',
  'react-native-edge-to-edge',
].join('|');

module.exports = {
  ...preset,
  // reanimated v4 ← worklets: 네이티브 없는 jest에서 '.native' 구현 대신 base
  // 구현을 로드하도록 RN resolver와 worklets 확장 제거를 합성한 커스텀 resolver.
  resolver: '<rootDir>/jest-resolver.js',
  setupFilesAfterEnv: [
    ...(preset.setupFilesAfterEnv ?? []),
    '<rootDir>/jest-setup.js',
  ],
  transformIgnorePatterns: [
    `node_modules/(?!(jest-)?(${transformWhitelist})/)`,
  ],
};
