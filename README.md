# @junkwon91/rn-design-system

React Native 0.81+ 디자인 시스템. `styled-components/native` 위에 라이트/다크 토큰을 얹고, 8 카테고리 35 컴포넌트(시각 컴포넌트 31 + Host 4) + 전역 imperative 호스트(Toast / Dialog / BottomSheet / Popup)를 제공합니다.

- 컴포넌트: primitives · surface · action · input · display · list · feedback · modal
- 테마: `AppTheme` (mode / colors / spacing / radius / typography / interaction) + `lightTheme` / `darkTheme`
- imperative API: `toast` · `dialog` · `bottomSheet` · `popup` (각 Host를 앱 루트에 1회 마운트)

자세한 문서:

- [docs/theme.md](docs/theme.md) — AppTheme 구조 · 토큰 레퍼런스 · 앱에서 테마 타입 확장하기
- [docs/components.md](docs/components.md) — 35종 컴포넌트별 props 레퍼런스
- [docs/imperative.md](docs/imperative.md) — toast/dialog/bottomSheet/popup 셋업 + 호출 API

---

## 설치

GitHub 브랜치/태그 의존성으로 설치합니다(npm 레지스트리 미배포):

```bash
npm install '@junkwon91/rn-design-system@github:JunKwon91/rn-design-system#feature/library'
```

설치 시 `prepare` 스크립트가 `react-native-builder-bob` 빌드를 자동 실행해 `lib/` 산출물을 생성합니다.

peer 의존성 8종은 앱이 직접 설치합니다. 한 패키지라도 두 벌이 설치되면 Context / 네이티브 모듈 등록이 깨지므로 단일 인스턴스를 보장하세요(`npm ls`로 deduped 확인).

```bash
npm install \
  react react-native styled-components \
  react-native-reanimated react-native-gesture-handler \
  react-native-safe-area-context react-native-svg react-native-worklets
```

dependencies(`lucide-react-native`, `zustand`)는 라이브러리가 함께 끌어옵니다 — 별도 설치 불필요.

### peer 의존성 표

| 패키지 | 범위 | 단일 인스턴스 필요? |
|---|---|---|
| react | `>=19.0.0` | ✓ (renderer) |
| react-native | `>=0.81.0` | ✓ (네이티브 브리지) |
| styled-components | `>=6.0.0` | ✓ (ThemeContext) |
| react-native-reanimated | `>=4.0.0` | ✓ (worklet runtime · UI thread) |
| react-native-gesture-handler | `>=2.0.0` | ✓ (네이티브 등록) |
| react-native-safe-area-context | `>=5.0.0` | ✓ (SafeAreaProvider Context) |
| react-native-svg | `>=15.0.0` | ✓ (네이티브 view 등록) |
| react-native-worklets | `>=0.8.0` | ✓ (reanimated 4 의존) |

`react-native-reanimated` 셋업 시 `babel.config.js`에 `'react-native-worklets/plugin'`을 마지막 plugin으로 추가해야 합니다.

---

## 빠른 시작

라이브러리를 쓰려면 App 루트에 다음 3가지를 한 번 셋업합니다:

1. **테마 타입 확장** — `styled-components`의 `DefaultTheme`은 빈 인터페이스로 시작합니다. 이 라이브러리는 그 타입을 점유하지 않으므로, 앱에서 `AppTheme`을 연결하면 styled 콜백 안에서 `theme.colors.x` 자동완성과 오타 검사가 동작합니다.
2. **Provider 중첩** — `GestureHandlerRootView` → `ThemeProvider` → `SafeAreaProvider` → 본 화면 → 4 Hosts.
3. **imperative Host 마운트** — `<DialogHost />`, `<ToastHost />`, `<BottomSheetHost />`, `<PopupHost />`를 각각 1회만.

### 1) `src/styled.d.ts` — DefaultTheme 보강

```ts
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

도메인 토큰을 더하려면(예: 자체 색·간격 추가) [docs/theme.md](docs/theme.md)의 "앱에서 테마 타입 확장하기" 섹션을 참고하세요.

### 2) `App.tsx` — Provider 중첩 + 호스트 마운트

```tsx
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import {
  lightTheme,
  darkTheme,
  BottomSheetHost,
  DialogHost,
  PopupHost,
  ToastHost,
} from '@junkwon91/rn-design-system';

import RootNavigator from './src/navigation/RootNavigator';

export default function App() {
  const isDark = useColorScheme() === 'dark';
  const theme = isDark ? darkTheme : lightTheme;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={theme}>
        <SafeAreaProvider>
          <RootNavigator />
          <DialogHost />
          <ToastHost />
          <BottomSheetHost />
          <PopupHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

4 Host 중 쓰지 않는 영역이 있으면 그것만 빼도 됩니다(예: BottomSheet 미사용이면 `<BottomSheetHost />` 생략).

### 3) 첫 화면 — Screen + Card + Button

```tsx
import {
  Screen,
  Section,
  Card,
  Text,
  Button,
  Spacer,
  toast,
} from '@junkwon91/rn-design-system';

export default function HomeScreen() {
  return (
    <Screen>
      <Section title="개요">
        <Card title="이번 달" meta="2026-06" showDivider>
          <Text variant="bodyBase">최근 활동이 12건 있습니다.</Text>
          <Spacer size="md" />
          <Button
            label="자세히 보기"
            onPress={() => toast.success('이동 중', '잠시만 기다려주세요.')}
          />
        </Card>
      </Section>
    </Screen>
  );
}
```

`Screen`은 `react-native-safe-area-context`와 통합해 `edges` prop으로 safe area 처리를 자동화합니다. 자세한 props는 [docs/components.md](docs/components.md) 참고.

---

## 컴포넌트 카테고리 (35종)

| 카테고리 | 수 | 컴포넌트 |
|---|---|---|
| primitives | 3 | Text, Spacer, Divider |
| surface | 3 | Screen, Card, Section |
| action | 3 | Button, IconButton, FAB |
| input | 6 | Input, SearchInput, Checkbox, Radio, RadioGroup, Switch |
| display | 5 | DataTable, SegmentedControl, Tabs, Badge, Chip |
| list | 1 | SettingsRow |
| feedback | 6 | EmptyState, ErrorView, LoadingView, Skeleton, Progress (Linear + Circular), Tooltip |
| modal | 8 | Toast, ToastHost, Dialog, DialogHost, BottomSheet, BottomSheetHost, Popup, PopupHost |

시각 컴포넌트 31 + Host 4 = 총 35. 각 컴포넌트의 props 레퍼런스는 [docs/components.md](docs/components.md) 참고.

---

## License

MIT License — Copyright (c) 2026 JunKwon91
