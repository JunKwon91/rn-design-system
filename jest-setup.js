// ============================================================================
// jest 셋업 (setupFilesAfterEnv) — matcher 확장 + 네이티브 라이브러리 mock
// ============================================================================
//
// jest 환경(node/JSDOM 없는 RN env)에는 네이티브 모듈이 없으므로, UI 스레드
// worklet·제스처·safe-area를 쓰는 라이브러리를 각 공식 방식으로 mock/setup한다.
// (버전마다 방식이 달라 node_modules의 실제 mock 파일을 열어 확인 후 적용.)

// ---------------------------------------------------------------------------
// 1) RNTL 접근성 matcher (toHaveAccessibilityState, toBeOnTheScreen 등)
//    RNTL 12.4+는 main 엔트리 import 시 jest matcher를 자동 확장하므로 별도
//    setup import가 불필요하다(구버전의 @testing-library/jest-native 대체).
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// 2) react-native-reanimated (v4.3)
//    reanimated가 배포하는 공식 mock 사용. mock은 애니메이션을 즉시-완료(no-op)
//    처리해 UI 스레드/worklet 네이티브 없이 렌더 가능하게 한다.
//    (node_modules/react-native-reanimated/mock.js → src/mock.ts, transform 대상)
// ---------------------------------------------------------------------------
jest.mock('react-native-reanimated', () =>
  require('react-native-reanimated/mock'),
);

// ---------------------------------------------------------------------------
// 3) react-native-gesture-handler
//    패키지가 배포하는 공식 jestSetup(네이티브 모듈·제스처 버튼 mock) 로드.
// ---------------------------------------------------------------------------
require('react-native-gesture-handler/jestSetup');

// ---------------------------------------------------------------------------
// 4) react-native-safe-area-context
//    패키지가 배포하는 공식 jest mock(고정 insets/frame 제공).
// ---------------------------------------------------------------------------
jest.mock('react-native-safe-area-context', () =>
  require('react-native-safe-area-context/jest/mock').default,
);
