# Imperative API

화면 어디서든 함수 호출 한 줄로 띄울 수 있는 전역 호스트 4종 — `toast`, `dialog`, `bottomSheet`, `popup` — 의 셋업과 사용법입니다. 각 API는 컴포넌트 본문이 아니라 일반 함수처럼 호출되며, React 트리 밖(예: 이벤트 핸들러, 비동기 콜백)에서도 동작합니다.

- [셋업](#셋업)
- [toast](#toast)
- [dialog](#dialog)
- [bottomSheet](#bottomsheet)
- [popup](#popup)

---

## 셋업

App 루트에 각 Host 컴포넌트를 1회씩 마운트합니다. Host는 렌더되는 모달을 화면 위에 띄울 뿐 자체 UI가 없으므로, 어디에 두든 시각적 차이는 없습니다(보통 NavigationContainer 다음에).

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from 'styled-components/native';

import {
  lightTheme,
  ToastHost,
  DialogHost,
  BottomSheetHost,
  PopupHost,
} from '@junkwon91/rn-design-system';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider theme={lightTheme}>
        <SafeAreaProvider>
          {/* 본 화면 */}
          <ToastHost />
          <DialogHost />
          <BottomSheetHost />
          <PopupHost />
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
```

`BottomSheetHost`는 제스처 인식이 필요하므로 `GestureHandlerRootView`가 위에 있어야 합니다. 4 Host 중 쓰지 않는 영역이 있으면 그것만 빼도 됩니다.

---

## toast

화면 하단에 잠깐 떴다 사라지는 알림. 3종(`success` / `error` / `info`)이고 자동으로 큐잉됩니다.

### API

```ts
toast.success(title: string, description?: string): string  // id 반환
toast.error(title: string, description?: string): string
toast.info(title: string, description?: string): string
```

Hook도 함께 제공됩니다:

```ts
import { useToastStore } from '@junkwon91/rn-design-system';

const { displayed, queue, show, dismiss, clearAll } = useToastStore();
```

- `displayed`: 현재 표시 중인 1개(또는 null)
- `queue`: 대기 중인 토스트 배열(최대 3개)
- `show(config)`: 직접 ToastConfig를 push할 때
- `dismiss(id)`: 특정 토스트를 닫기
- `clearAll()`: 전체 비우기

### Config

```ts
type ToastType = 'success' | 'error' | 'info';

interface ToastConfig {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;  // ms, 기본 3000. 0이면 자동 해제 없이 수동 닫기 전용
}
```

### 동작

- 한 번에 1개만 표시. 추가 호출은 큐(최대 3개)에 쌓이고 표시 중인 항목이 닫히면 다음이 올라옵니다.
- 큐가 가득 찬 상태에서 또 호출되면 가장 오래된 큐 항목이 제거됩니다.
- `duration` 기본 3000ms. `0`을 주면 자동 해제 없이 사용자가 닫거나 `dismiss(id)`로 닫을 때까지 유지됩니다.

### 예

```ts
import { toast } from '@junkwon91/rn-design-system';

toast.success('저장 완료', '항목이 즐겨찾기에 추가되었습니다.');
toast.error('네트워크 오류', '연결을 확인해주세요.');
toast.info('새 데이터 도착');

// 직접 Config로 (수동 해제)
import { useToastStore } from '@junkwon91/rn-design-system';

const id = useToastStore.getState().show({
  id: 'upload-1',
  type: 'info',
  title: '업로드 중...',
  duration: 0,
});
// ... 업로드 완료 후
useToastStore.getState().dismiss(id);
```

---

## dialog

화면 가운데 떠서 사용자 응답을 기다리는 모달. 3 variant(`info` / `confirm` / `prompt`)이고 모두 `Promise`로 결과를 반환합니다.

### API

```ts
dialog.info(config):    Promise<void>
dialog.confirm(config): Promise<boolean>          // true=확인, false=취소
dialog.prompt(config):  Promise<string | null>    // 입력 문자열, 취소 시 null
```

Hook:

```ts
import { useDialogStore } from '@junkwon91/rn-design-system';

const { displayed, queue, dismiss, clearAll } = useDialogStore();
```

각 `config`는 `id`/`variant`/`resolve`를 제외한 사용자 입력 부분만 받습니다(나머지는 라이브러리가 자동 채움).

### Config

```ts
type DialogVariant = 'info' | 'confirm' | 'prompt';

interface InfoDialogConfig {
  title: string;
  description?: string;
  confirmLabel?: string;   // 기본 '확인'
}

interface ConfirmDialogConfig {
  title: string;
  description?: string;
  cancelLabel?: string;    // 기본 '취소'
  confirmLabel?: string;   // 기본 '확인'
  destructive?: boolean;   // true면 confirm 버튼이 state.error 배경
}

interface PromptDialogConfig {
  title: string;
  description?: string;
  defaultValue?: string;
  placeholder?: string;
  cancelLabel?: string;
  confirmLabel?: string;
}
```

### 동작

- 한 번에 1개만 표시(toast와 동일한 큐 패턴, 최대 3개 대기).
- `confirm`은 사용자가 확인을 누르면 `true`, 취소(또는 backdrop 탭/back 키)는 `false`로 resolve.
- `prompt`는 확인 시 입력 문자열, 취소 시 `null`로 resolve.

### 예

```ts
import { dialog } from '@junkwon91/rn-design-system';

// info — 단순 확인
await dialog.info({
  title: '네트워크 오류',
  description: '서버에 연결할 수 없습니다.',
});

// confirm — 삭제 등 destructive 액션
const ok = await dialog.confirm({
  title: '항목 삭제',
  description: '되돌릴 수 없습니다.',
  destructive: true,
  confirmLabel: '삭제',
});
if (ok) await deleteItem();

// prompt — 사용자 입력
const value = await dialog.prompt({
  title: '회차 입력',
  placeholder: '예: 1234',
  defaultValue: String(currentRound),
});
if (value !== null) saveRound(value);
```

---

## bottomSheet

화면 아래에서 올라오는 시트. 단일 snap, 다중 snap, scrollable, 키보드 양립까지 한 컴포넌트로 처리합니다.

### API

```ts
bottomSheet.open(config: BottomSheetConfig): void
bottomSheet.close(): void
bottomSheet.snapTo(index: number): void
```

Hook:

```ts
import { useBottomSheetStore } from '@junkwon91/rn-design-system';

const { isVisible, snapPoints, currentSnapIndex, open, close, snapTo } = useBottomSheetStore();
```

### Config

```ts
type BottomSheetSnap = 'auto' | `${number}%` | number;

interface BottomSheetConfig {
  children: ReactNode;
  height?: BottomSheetSnap;          // 기본 'auto' (화면 50%)
  snapPoints?: BottomSheetSnap[];    // 다중 snap (지정 시 height 무시)
  initialSnap?: number;              // 기본 0
  onDismiss?: () => void;
  onSnapChange?: (index: number) => void;
}
```

- `height`: 단일 snap 높이. `'auto'`(50%), 백분율 문자열(`'50%'`), 픽셀 숫자(`400`) 자유 선택
- `snapPoints`: 다중 snap. 같은 형식의 배열. 지정 시 `height`는 무시되고 개발 모드에서 경고가 표시됩니다
- `initialSnap`: `snapPoints` 인덱스 기준 초기 위치

### 동작

- 핸들바 drag로 닫기 — 거리 30% 또는 velocity 500px/s 이상
- 다중 snap에서는 가장 가까운 snap으로 자동 흡착. velocity가 충분히 빠르면 0.15초 projection으로 방향 우선 snap
- 가장 낮은 snap에서 추가 drag 시 dismiss
- 백드롭 탭 / Android BackHandler 자동 dismiss
- `useAnimatedKeyboard`로 키보드 출현 시 시트가 위로 이동, dismiss 시 자연 복귀
- 스크롤이 필요하면 자식으로 `ScrollView`를 직접 두면 됩니다 — 핸들바 영역만 drag, 콘텐츠 영역은 native scroll로 충돌 없이 동작

### 예

```ts
import { bottomSheet } from '@junkwon91/rn-design-system';

// 단일 snap
bottomSheet.open({
  height: '50%',
  children: <SettingsMenu />,
  onDismiss: () => saveDraft(),
});

// 다중 snap
bottomSheet.open({
  snapPoints: ['25%', '50%', '90%'],
  initialSnap: 1,
  onSnapChange: (index) => console.log('snap', index),
  children: <DetailPanel />,
});

bottomSheet.snapTo(2);    // 90%로 이동
bottomSheet.close();
```

---

## popup

화면 중앙에 카드 형태로 떠 form을 표시합니다. `dialog.prompt`(단일 문자열 입력)와 달리 children을 완전 자유로 받아 RadioGroup·Checkbox·다중 Input 등을 자유 배치할 수 있습니다.

### API

```ts
popup.open(config: PopupConfig): void
popup.close(): void
```

Hook:

```ts
import { usePopupStore } from '@junkwon91/rn-design-system';

const { isVisible, children, open, close } = usePopupStore();
```

### Config

```ts
interface PopupConfig {
  children: ReactNode;
  onDismiss?: () => void;
}
```

### 동작

- 백드롭 탭 / Android BackHandler 자동 dismiss
- TextInput focus 시 카드가 키보드 위로 자동 이동(`useAnimatedKeyboard`). dismiss 시 자연 복귀

### 예

```tsx
import { popup, Radio, RadioGroup, Spacer, Button, Text } from '@junkwon91/rn-design-system';

function SortPopupContent() {
  const [sort, setSort] = useState<'recent' | 'popular'>('recent');
  return (
    <View>
      <Text variant="headlineSm">정렬 기준</Text>
      <RadioGroup value={sort} onValueChange={setSort}>
        <Radio value="recent" label="최신순" />
        <Spacer size="md" />
        <Radio value="popular" label="인기순" />
      </RadioGroup>
      <Button
        label="적용"
        onPress={() => {
          applySort(sort);
          popup.close();
        }}
      />
    </View>
  );
}

popup.open({ children: <SortPopupContent /> });
```
