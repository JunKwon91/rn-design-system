// ============================================================================
// useAppTheme — styled-components의 useTheme()을 AppTheme 타입으로 좁힌 헬퍼
// ============================================================================
//
// styled-components의 useTheme()은 DefaultTheme를 반환한다. consumer 앱이
// DefaultTheme augmentation을 어떻게 하든(라이브러리 AppTheme + 자체 확장),
// 본 라이브러리 내부 컴포넌트는 항상 AppTheme이라는 "라이브러리가 보장하는
// 표면"만 보면 충분하다. useAppTheme()은 그 보장 표면으로 좁혀 반환한다.
//
// 라이브러리 내부 컴포넌트(Button, SettingsRow 등)는 useTheme() 대신
// useAppTheme()을 쓰면 consumer의 augmentation 유무와 무관하게 타입 자동완성·
// 체크가 안정적으로 동작한다. consumer도 라이브러리 토큰만 다루면 본 훅을
// 그대로 쓸 수 있다.
// ============================================================================

import { useTheme } from 'styled-components/native';

import type { AppTheme } from './index';

export const useAppTheme = (): AppTheme => useTheme() as AppTheme;
