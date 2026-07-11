module.exports = {
  root: true,
  extends: '@react-native',
  overrides: [
    {
      // jest 전역(jest/describe/it/expect)을 쓰는 테스트·셋업 파일.
      // @react-native 프리셋은 *.test.* 만 jest env로 잡으므로 setup/resolver
      // 파일과 __tests__ 디렉터리까지 명시적으로 포함한다.
      files: [
        '**/__tests__/**',
        '**/*.test.{js,ts,tsx}',
        'jest-setup.js',
        'jest-resolver.js',
      ],
      env: { jest: true, node: true },
    },
  ],
};
