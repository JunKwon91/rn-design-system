// ============================================================================
// jest 커스텀 resolver — RN preset resolver + worklets 'native' 확장 제거 합성
// ============================================================================
//
// 문제: reanimated v4는 react-native-worklets에 의존한다. jest 기본 플랫폼은
// 'ios'(haste)라, worklets 내부 require가 `initializers.native.ts` →
// `NativeWorklets.native.ts`를 집어 "Native part of Worklets doesn't seem to be
// initialized" 로 터진다. 네이티브가 없는 jest에서는 `.native`가 붙지 않은 base
// 구현(JS fallback)을 써야 한다.
//
// 해결: react-native-worklets가 배포하는 resolver(jest/resolver.js)와 동일하게
// worklets 관련 요청에 대해서만 확장자에서 'native'를 제거한 뒤, RN preset의
// resolver로 위임한다(react-native exports 처리 등 RN 고유 로직 유지). 둘 중
// 하나만 쓰면 다른 하나의 처리가 빠지므로 명시적으로 합성한다.

const rnResolver = require('@react-native/jest-preset/jest/resolver');

module.exports = (request, options) => {
  const isWorklets =
    options.basedir.includes('react-native-worklets') ||
    request.includes('react-native-worklets');

  if (isWorklets && options.extensions) {
    const stripped = {
      ...options,
      extensions: options.extensions.filter((ext) => !ext.includes('native')),
    };
    return rnResolver(request, stripped);
  }

  return rnResolver(request, options);
};
