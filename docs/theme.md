# Theme

라이브러리의 모든 시각적 결정(색·간격·반경·타이포·인터랙션)은 `AppTheme` 한 객체로 통합되어 `styled-components`의 `ThemeProvider`로 주입됩니다. 본 문서는 토큰 구조 전체와 앱에서 자기 theme을 확장하는 표준 패턴을 설명합니다.

- [AppTheme 구조](#apptheme-구조)
- [토큰 레퍼런스](#토큰-레퍼런스)
  - [Colors](#colors-mode-aware)
  - [spacing](#spacing)
  - [radius](#radius)
  - [typography](#typography)
  - [interaction](#interaction)
- [라이트 vs 다크](#라이트-vs-다크)
- [ThemeProvider 셋업](#themeprovider-셋업)
- [앱에서 테마 타입 확장하기](#앱에서-테마-타입-확장하기)
- [useAppTheme 훅](#useapptheme-훅)

---

## AppTheme 구조

```ts
export type ThemeMode = 'light' | 'dark';

export interface AppTheme {
  mode: ThemeMode;
  colors: Colors;                 // mode-aware 색 토큰
  spacing: typeof spacing;        // 간격 (px)
  radius: typeof radius;          // 반경 (px)
  typography: typeof typography;  // 폰트 variant 11종
  interaction: typeof interaction;// state opacity (mode 무관)
}
```

라이브러리는 두 개의 완성된 theme 객체를 제공합니다:

```ts
import { lightTheme, darkTheme } from '@junkwon91/rn-design-system';
```

`spacing` / `radius` / `typography` / `interaction`은 모드와 무관해 두 theme이 동일 값을 공유합니다. 차이는 **`colors`만** — `lightColors`와 `darkColors` 두 객체는 동일한 키 구조(`ColorsShape`)를 100% 채우므로, 한쪽에 새 토큰이 추가되면 다른 쪽에도 추가하지 않으면 컴파일 에러가 나도록 강제됩니다. 덕분에 모드 전환이 누락 없이 단일 prop 교체로 끝납니다.

---

## 토큰 레퍼런스

### Colors (mode-aware)

`Colors` (= `ColorsShape`)는 7개 의미 그룹으로 구성됩니다. 각 키는 라이트·다크 모두에서 정의되어 있어 한쪽에 누락되면 컴파일 에러가 납니다.

#### `colors.bg` — 화면 배경

| 키 | 의미 |
|---|---|
| `canvas` | 화면 전체 기본 배경. `Screen.background='canvas'` 기본값 |
| `sectionMain` | 큰 섹션 배경 |
| `sectionSub` | 보조 섹션 배경 |

#### `colors.surface` — 컨테이너 표면

| 키 | 의미 |
|---|---|
| `base` | 최상위 표면. Dialog/Toast 등 모달의 카드 |
| `containerLowest` | 가장 밝은 컨테이너. Input 필드 등 |
| `containerLow` | 약간 밝은 컨테이너. 헤더 등 |
| `container` | 표준 카드 표면. `Card` 기본 배경 |
| `containerHigh` | 강조된 컨테이너. 선택된 행 등 |
| `containerHighest` | 5단 완성용 준비 토큰. 현재 사용처 0(의도된 미사용) |
| `inverse` | 반전 표면. Tooltip 등 |

#### `colors.text` — 글자 색

| 키 | 의미 |
|---|---|
| `primary` | 본문 텍스트. 가장 진한 색 |
| `secondary` | 부제목 / 보조 텍스트 |
| `muted` | 흐릿한 메타 텍스트 (날짜·라벨 등) |
| `primaryInverse` | 반전 surface 위 본문 |
| `secondaryInverse` | 반전 surface 위 보조 |

#### `colors.border` — 1px 경계선

| 키 | 의미 |
|---|---|
| `default` | 기본 보더 |
| `subtle` | 매우 흐릿한 구분선 (Divider 등) |
| `strong` | 강조 보더 (선택 강조 등) |
| `control` | interactive control 보더. Checkbox/Radio 등의 WCAG 대비 충족용 |
| `divider` | 리스트 행 인셋 구분선 (SettingsRow 등) |

#### `colors.primary` — 브랜드 액션

| 키 | 의미 |
|---|---|
| `action` | 메인 액션 버튼 배경 |
| `onAction` | 액션 위 텍스트 |

#### `colors.state` — 의미 색

| 키 | 의미 |
|---|---|
| `success` | 성공 |
| `warning` | 경고 |
| `error` | 오류 액센트 (텍스트·아이콘·보더) |
| `errorAction` | destructive 버튼 배경 |
| `info` | 정보 |

#### `colors.overlay` — 오버레이

| 키 | 의미 |
|---|---|
| `scrim` | 모달 backdrop(반투명 검정) |

color 값(hex)의 정확한 라이트/다크 매핑은 `src/theme/colors.ts`에 있습니다. 색 토큰은 두 단으로 구성됩니다 — primitives(raw hex 팔레트)와 semantic(역할 명명, 모드별 alias). 컴포넌트 코드는 **항상 semantic 토큰만** 참조하므로, 같은 의미를 다른 raw 색으로 교체해도 컴포넌트 변경 없이 흡수됩니다.

### spacing

```ts
export const spacing = {
  none: 0,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
  containerMargin: 16,  // 화면 좌우 외곽 여백 (=lg)
  gutter: 12,           // 그리드 사이 (=md)
  stackSm: 8,           // 관련 요소 사이 (라벨↔인풋, =sm)
  stackMd: 16,          // 표준 컴포넌트 사이 (=lg)
  stackLg: 24,          // 큰 논리 섹션 사이 (=xl)
} as const;
```

크기 토큰(`xs`~`4xl`)과 의미 토큰(`containerMargin`/`gutter`/`stackSm`/`stackMd`/`stackLg`)이 공존합니다. 의미 토큰은 같은 값이지만 용도가 명확해 호출처 가독성을 높이고, 향후 정책 변경을 단일 위치 수정으로 끝낼 수 있습니다.

모든 값은 4px 베이스 그리드 기반(Material 3 / iOS HIG / Tailwind 표준). 한 화면 안에서 spacing을 일관되게 쓰면 4px 단위로 자연스럽게 정렬됩니다.

### radius

```ts
export const radius = {
  none: 0,    // 직각
  sm: 4,      // 체크박스 등 작은 요소
  base: 8,    // Input · 작은 Button
  md: 12,     // 중간 카드
  lg: 16,     // 메인 카드(Card 기본)
  xl: 24,     // Bottom Nav · SegmentedControl 등 캡슐형
  full: 9999, // 정원 · 캡슐
} as const;
```

### typography

11개 variant. Manrope(제목·숫자 강조)와 Inter(본문·라벨)를 페어링합니다. Manrope는 큰 사이즈에서 시각적 무게가 강해 제목·수치에 적합하고, Inter는 본문 가독성과 다국어(한글) 지원이 우수합니다. 두 폰트 모두 OFL 라이선스라 배포에 제약이 없습니다.

| variant | font | size | weight | lineHeight | 특수 |
|---|---|---|---|---|---|
| `displayLg` | Manrope | 32 | 700 | 38 | — |
| `headlineMd` | Manrope | 20 | 600 | 28 | — |
| `headlineSm` | Manrope | 17 | 600 | 22 | — |
| `bodyBase` | Inter | 16 | 400 | 24 | — |
| `bodySm` | Inter | 14 | 400 | 20 | — |
| `bodyXs` | Inter | 13 | 400 | 18 | — |
| `labelLg` | Inter | 14 | 600 | 20 | — |
| `labelMd` | Inter | 13 | 600 | 16 | — |
| `labelSm` | Inter | 11 | 600 | 14 | — |
| `labelCaps` | Inter | 12 | 600 | 16 | `letterSpacing: 0.6`, `textTransform: 'uppercase'` |
| `numericMd` | Manrope | 14 | 700 | 20 | — |

`Text` 컴포넌트의 `variant` prop으로 직접 선택합니다. 자세한 사용은 [components.md](components.md)의 Text 항목 참고.

### interaction

```ts
export const interaction = {
  pressedOpacity: 0.70,    // 탭 다운 시각 피드백
  disabledOpacity: 0.50,   // 비활성 상태
} as const;
```

`Button`·`IconButton`·`FAB`·`Chip`·`Switch`·`Tabs`·`SegmentedControl` 등 인터랙티브 컴포넌트가 단순 alpha 패턴으로 일관 적용합니다. hover / focus 토큰은 RN 네이티브 환경에서 의미가 없어 의도적으로 두지 않았고, RN-Web 호환을 진입하는 시점에 재정의될 예정입니다.

---

## 라이트 vs 다크

`lightTheme`과 `darkTheme`은 `colors`만 다르고 나머지(`spacing` / `radius` / `typography` / `interaction`)는 공유합니다. 두 colors 객체가 동일 키 구조를 100% 채우는 정합 정책 덕분에:

- 한쪽에만 새 토큰이 추가되면 컴파일 에러
- 컴포넌트 코드는 모드 분기 없이 `theme.colors.x.y`로만 참조 → 모드 전환은 `ThemeProvider`의 `theme` prop 교체 1줄

```ts
const isDark = useColorScheme() === 'dark';
const theme = isDark ? darkTheme : lightTheme;
```

라이트/다크 모드의 정확한 색 매핑(특히 Dark surface 5단의 명도 단계 — 본문 텍스트 WCAG 4.5:1 확보까지 균등 조정)은 `src/theme/colors.ts`에 인라인으로 정리되어 있습니다.

---

## ThemeProvider 셋업

`styled-components/native`의 `ThemeProvider`로 theme 객체를 주입합니다. 시스템 모드 자동 감지에는 RN의 `useColorScheme()`을 결합합니다:

```tsx
import { useColorScheme } from 'react-native';
import { ThemeProvider } from 'styled-components/native';
import { lightTheme, darkTheme } from '@junkwon91/rn-design-system';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeProvider theme={theme}>
      {/* 본 앱 */}
    </ThemeProvider>
  );
}
```

전체 Provider 중첩(GestureHandlerRootView · SafeAreaProvider · 4 Hosts)은 [README의 빠른 시작](../README.md#빠른-시작)을 참고하세요.

---

## 앱에서 테마 타입 확장하기

### 왜 타입 확장이 필요한가

`styled-components`는 `DefaultTheme`이라는 빈 인터페이스를 export하고, 사용 측이 `declare module`로 그 모양을 채우는 module augmentation 패턴을 표준으로 합니다. 이 라이브러리가 자기 영역에서 `DefaultTheme`을 점유해버리면 앱이 자기 theme을 확장하려 할 때 전역 단일 슬롯 충돌이 발생합니다. 그래서 이 라이브러리는 `DefaultTheme`에 자기 모양을 박지 않고, `AppTheme` / `Colors` / `ColorsShape` 타입만 export합니다. 타입 확장은 앱이 자기 영역에서 직접 합니다.

### 기본 패턴 — AppTheme 그대로 사용

라이브러리 theme을 그대로 쓰는 경우, 앱의 `src/styled.d.ts`를 다음 한 줄 augmentation으로 둡니다:

```ts
// src/styled.d.ts
import 'styled-components';
import 'styled-components/native';

import type { AppTheme } from '@junkwon91/rn-design-system';

declare module 'styled-components' {
  export interface DefaultTheme extends AppTheme {}
}

declare module 'styled-components/native' {
  export interface DefaultTheme extends AppTheme {}
}
```

이로써:

- styled 콜백 안에서 `theme.colors.x` 자동완성 + 오타 검사 정상 동작
- `useTheme()` 반환 타입이 `AppTheme`로 좁혀짐 → 자체 헬퍼 불필요

### 도메인 확장 패턴 — colors에 자체 토큰 추가

앱이 도메인 토큰(예: 상태 색 추가, 자체 카테고리 색)을 더하려면 라이브러리 `Colors`를 베이스로 한 자체 타입을 만듭니다:

```ts
// src/theme/index.ts
import {
  lightTheme as libLightTheme,
  darkTheme as libDarkTheme,
} from '@junkwon91/rn-design-system';
import type { AppTheme, Colors } from '@junkwon91/rn-design-system';

// 도메인 추가 토큰 정의(모드 무관 hex)
export const domainStateExtension = {
  hot: '#EF4444',
  cold: '#06B6D4',
} as const;

// 1) 라이브러리 Colors를 베이스로 도메인 키를 더한 자체 Colors
export interface DomainColors extends Omit<Colors, 'state'> {
  state: Colors['state'] & typeof domainStateExtension;
}

// 2) 라이브러리 AppTheme의 colors만 DomainColors로 교체한 자체 Theme
export interface DomainTheme extends Omit<AppTheme, 'colors'> {
  colors: DomainColors;
}

// 3) 라이브러리 lightTheme/darkTheme를 스프레드하고 도메인 토큰을 머지
export const lightTheme: DomainTheme = {
  ...libLightTheme,
  colors: {
    ...libLightTheme.colors,
    state: { ...libLightTheme.colors.state, ...domainStateExtension },
  },
};

export const darkTheme: DomainTheme = {
  ...libDarkTheme,
  colors: {
    ...libDarkTheme.colors,
    state: { ...libDarkTheme.colors.state, ...domainStateExtension },
  },
};
```

augmentation은 `AppTheme` 대신 `DomainTheme`을 extend합니다:

```ts
// src/styled.d.ts
declare module 'styled-components' {
  export interface DefaultTheme extends DomainTheme {}
}
```

이 패턴은 `Omit<AppTheme, 'colors'> & { colors: DomainColors }` 형태로 일반화됩니다. `Omit` + 교체로 라이브러리 호환을 깨지 않고(컴포넌트는 여전히 표준 `Colors` 키만 참조) 자체 토큰을 더할 수 있습니다.

### 라이브러리 컴포넌트에 도메인 토큰 전달하기

라이브러리 컴포넌트의 `color` prop은 미리 정의된 union(`'primary' | 'secondary' | 'muted' | 'accent' | 'inverse'` 등)만 받습니다. 도메인 확장 토큰(`state.hot` 같은)을 직접 넘길 prop은 없어, 현재는 `style` prop으로 우회합니다:

```tsx
<Text variant="labelCaps" style={{ color: theme.colors.state.hot }}>
  hot
</Text>
```

호출처가 `useTheme()`(augmentation 후 `DomainTheme` 타입)으로 도메인 색에 접근하고 inline style로 강제 주입하는 방식입니다. 라이브러리 입장에서는 색 union을 무한 확장하지 않고 `style` prop fallback을 표준으로 두는 트레이드오프이며, 자주 쓰는 도메인 색이라면 자체 wrapper 컴포넌트로 한 곳에 격리하는 것이 권장됩니다.

---

## useAppTheme 훅

라이브러리는 내부 자동완성용으로 `useAppTheme(): AppTheme` 헬퍼를 export합니다:

```ts
import { useAppTheme } from '@junkwon91/rn-design-system';

function MyComponent() {
  const theme = useAppTheme();
  return <View style={{ backgroundColor: theme.colors.surface.container }} />;
}
```

이 훅은 본질적으로 `useTheme() as AppTheme` 캐스트입니다. 앱이 위의 augmentation을 한 뒤에는 `useTheme()`도 동일한 타입을 자동으로 반환하므로, 직접 `useTheme()` 호출이 더 자연스러운 선택입니다(`AppTheme` 또는 자체 `DomainTheme` 둘 다 정상 추론). `useAppTheme()`는 augmentation 없이도 동작이 보장되어야 하는 라이브러리 본체 코드용 헬퍼라 이해하면 됩니다.
