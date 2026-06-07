// ============================================================================
// example 전용 styled-components DefaultTheme 보강
// ============================================================================
//
// 라이브러리 본체(src/)는 ADR-39에 따라 DefaultTheme augmentation을 하지
// 않는다(소비자 앱의 theme 확장 보존을 위해 theme 타입만 export). example/
// 갤러리는 소비자 입장에서 라이브러리 AppTheme을 그대로 쓰면 되므로, 본
// 파일이 그 augmentation 역할을 한다. 이 파일은 example/ 영역 전용이고
// 라이브러리 빌드(tsconfig.build.json — example exclude)에는 포함되지 않아
// 배포 산출물에 영향 0.
// ============================================================================

import 'styled-components';
import 'styled-components/native';

import type { AppTheme } from '@/theme';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
