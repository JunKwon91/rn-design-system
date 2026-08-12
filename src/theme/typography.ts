// ============================================================================
// 타이포그래피(글꼴) 토큰
// ============================================================================
//
// [개념: 타이포그래피 스케일 (Type Scale)]
// 화면에 쓰이는 글자 크기/굵기/줄간격을 미리 몇 개 "스타일 묶음"으로
// 정의해두고, 컴포넌트는 이 묶음 중 하나를 선택해서 쓴다.
// 자유롭게 쓰면 "16px과 17px이 섞이거나, 굵기가 들쭉날쭉" 해진다.
//
// [폰트 페어링: Manrope + Inter]
//   - Manrope: 기하학적, 모던한 느낌 → 큰 제목과 숫자 강조에 사용
//   - Inter:  가독성 최고 → 본문, 라벨, 작은 텍스트에 사용
//
// [폰트 파일은 앱이 링크한다 — 라이브러리는 번들하지 않는다]
// 이 라이브러리는 .ttf/.otf를 포함하지 않는다(package.json files = src, lib).
// 아래 fontFamily 값은 "이 이름으로 등록된 폰트를 쓴다"는 선언일 뿐이고,
// 실제 렌더는 앱이 폰트를 링크했을 때만 이루어진다. 링크하지 않으면
// 시스템 기본 폰트로 fallback된다(에러는 나지 않는다).
//   - iOS: Info.plist의 UIAppFonts + Resources에 폰트 파일 추가
//   - Android: android/app/src/main/assets/fonts/ 에 복사
//   - react-native.config.js에 assets 경로 명시
//
// [앱이 폰트를 교체할 수 있다]
// AppTheme의 typography 타입은 아래 TypographyShape 인터페이스다.
// fontFamily가 string이므로, 앱은 테마를 스프레드해 폰트만 갈아끼울 수 있다.
//
//   const appTheme: AppTheme = {
//     ...lightTheme,
//     typography: {
//       ...lightTheme.typography,
//       displayLg: { ...lightTheme.typography.displayLg, fontFamily: 'Pretendard' },
//     },
//   };
//
// colors가 ColorsShape로 계약을 고정하는 것과 같은 패턴이다(ADR-04).
//
// [개념: 'as const' + 'satisfies']
// fontWeight: '700' as const 처럼 좁히는 이유는 React Native의 fontWeight
// 타입이 좁은 union('100' | ... | 'normal' | 'bold')이기 때문이다. 그냥
// '700'이라고 쓰면 string으로 추론되어 TextStyle에 넣을 때 타입 에러가 난다.
// 여기에 `satisfies TypographyShape`를 붙여, 키 누락·오타·값 타입 오류를
// 정의 시점에 잡는다. as const가 만드는 정확한 리터럴 타입은 그대로 유지되고,
// AppTheme을 거치면 TypographyShape로 넓어져 앱이 값을 덮어쓸 수 있다.
// ============================================================================

import type { TextStyle } from 'react-native';

// ----------------------------------------------------------------------------
// TypographyStyle — 스타일 한 묶음의 계약
// ----------------------------------------------------------------------------
// React Native TextStyle에 그대로 펼쳐 넣을 수 있는 형태.
// fontWeight/textTransform은 RN의 좁은 union을 그대로 재사용한다.
export interface TypographyStyle {
  fontFamily: string;
  fontSize: number;
  fontWeight: NonNullable<TextStyle['fontWeight']>;
  lineHeight: number;
  /** labelCaps처럼 자간이 필요한 스타일에서만 쓴다. */
  letterSpacing?: number;
  /** labelCaps처럼 대문자 변환이 필요한 스타일에서만 쓴다. */
  textTransform?: NonNullable<TextStyle['textTransform']>;
}

// ----------------------------------------------------------------------------
// TypographyShape — typography 객체 전체의 계약
// ----------------------------------------------------------------------------
// 새 스타일을 추가할 때 이 인터페이스에도 키를 넣어야 한다.
// 넣지 않으면 아래 satisfies에서 컴파일 에러가 난다(의도된 안전장치).
export interface TypographyShape {
  displayLg: TypographyStyle;
  headlineMd: TypographyStyle;
  headlineSm: TypographyStyle;
  bodyBase: TypographyStyle;
  bodySm: TypographyStyle;
  bodyXs: TypographyStyle;
  labelXs: TypographyStyle;
  labelSm: TypographyStyle;
  labelMd: TypographyStyle;
  labelLg: TypographyStyle;
  numericMd: TypographyStyle;
  labelCaps: TypographyStyle;
}

// ----------------------------------------------------------------------------
// typography — 12가지 글꼴 스타일 묶음
// ----------------------------------------------------------------------------
// 각 스타일은 React Native의 TextStyle과 호환되도록 구성:
//   { fontFamily, fontSize, fontWeight, lineHeight, ... }
// 사용 예) <Text style={theme.typography.displayLg}>제목</Text>
// ----------------------------------------------------------------------------
export const typography = {
  // displayLg — 가장 큰 표시용 텍스트 (메인 페이지 타이틀)
  // 예: 앱 메인 화면 큰 글씨
  displayLg: {
    fontFamily: 'Manrope',
    fontSize: 32, // px 단위 (RN은 단위 없는 숫자)
    fontWeight: '700' as const, // bold (700 = bold)
    lineHeight: 38, // 줄 간격 (보통 fontSize * 1.2 정도)
  },

  // headlineMd — 중간 크기 헤드라인 (카드 제목, 섹션 헤더)
  headlineMd: {
    fontFamily: 'Manrope',
    fontSize: 20,
    fontWeight: '600' as const, // semi-bold (600)
    lineHeight: 28,
  },

  // headlineSm — 작은 헤드라인 (Stack Navigator 헤더 타이틀)
  // headlineMd보다 한 단계 작음, 네비게이션 헤더용
  headlineSm: {
    fontFamily: 'Manrope',
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
  },

  // bodyBase — 기본 본문 텍스트
  // 예: 설명 단락, 카드 내부 본문
  bodyBase: {
    fontFamily: 'Inter',
    fontSize: 16,
    fontWeight: '400' as const, // regular (400)
    lineHeight: 24,
  },

  // bodySm — 작은 본문 (보조 정보, 데이터 테이블 셀 값)
  bodySm: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '400' as const,
    lineHeight: 20,
  },

  // bodyXs — 더 작은 본문 (Toast description, 보조 메타데이터)
  bodyXs: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '400' as const,
    lineHeight: 18,
  },

  // labelXs — 가장 작은 라벨 (Badge sm 등 좁은 컨테이너 안의 짧은 텍스트)
  // 스케일 최소값 — 본문에는 쓰지 않는다.
  labelXs: {
    fontFamily: 'Inter',
    fontSize: 10,
    fontWeight: '600' as const,
    lineHeight: 13,
  },

  // labelSm — 작은 라벨 (Bottom Tab 라벨, Badge md, Chip sm)
  // labelCaps와 달리 대문자 변환 없음 — 한글 라벨에 적합
  labelSm: {
    fontFamily: 'Inter',
    fontSize: 11,
    fontWeight: '600' as const,
    lineHeight: 14,
  },

  // labelMd — 중간 라벨 (Input 라벨, Settings Row 라벨, Chip md)
  labelMd: {
    fontFamily: 'Inter',
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 16,
  },

  // labelLg — 큰 라벨 (Segmented Control, Bottom Navigation active, FAB extended)
  labelLg: {
    fontFamily: 'Inter',
    fontSize: 14,
    fontWeight: '600' as const,
    lineHeight: 20,
  },

  // numericMd — 일반 숫자 표시 (Data Table 셀, 통계 수치)
  numericMd: {
    fontFamily: 'Manrope',
    fontSize: 14,
    fontWeight: '700' as const,
    lineHeight: 20,
  },

  // labelCaps — 대문자 라벨 (테이블 헤더, 카테고리 태그)
  // 예: "NUMBER", "FREQ", "TREND" 같은 컬럼 헤더
  labelCaps: {
    fontFamily: 'Inter',
    fontSize: 12,
    fontWeight: '600' as const,
    lineHeight: 16,
    letterSpacing: 0.6, // 자간 — 대문자 텍스트는 살짝 벌리면 가독성↑
    textTransform: 'uppercase' as const, // 자동으로 대문자로 변환
  },
} as const satisfies TypographyShape;

// ----------------------------------------------------------------------------
// Typography 타입 export
// ----------------------------------------------------------------------------
// 계약(TypographyShape)과 구현(typography)이 분리되어 있다.
//   - AppTheme.typography는 TypographyShape → 앱이 값을 덮어쓸 수 있다
//   - typography 상수 자체는 as const 리터럴 → 정확한 값이 타입에 남는다
// Colors/ColorsShape와 같은 구조다.
export type Typography = TypographyShape;
