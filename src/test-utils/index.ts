// test-utils 배럴 — 테스트에서 renderWithTheme 등을 한 줄로 가져온다.
// (src/index.ts에서는 재export하지 않는다 — 라이브러리 공개 API가 아니라
//  테스트 전용 헬퍼이며, files 화이트리스트로 배포 산출물에서도 제외된다.)

export { renderWithTheme } from './renderWithTheme';
export type { RenderWithThemeOptions } from './renderWithTheme';
