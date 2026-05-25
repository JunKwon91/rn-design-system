// ============================================================================
// BottomSheet — Material 3 Modal Bottom Sheet (controlled mode)
// ============================================================================
//
// 전역 호스트(BottomSheetHost) 기반 — App 루트에 BottomSheetHost를 1회 마운트
// 후 사용. 본 컴포넌트는 visible prop으로 store를 제어하는 controlled wrapper.
// imperative API는 `bottomSheet.open / close` 사용 (DialogHost 패턴 일관).
//
// 사용 예 (controlled):
//   const [visible, setVisible] = useState(false);
//   <Button label="시트 열기" onPress={() => setVisible(true)} />
//   <BottomSheet visible={visible} onDismiss={() => setVisible(false)} height="50%">
//     <Text variant="headlineSm">메뉴</Text>
//     <Button label="저장" onPress={...} />
//   </BottomSheet>
//
// 사용 예 (imperative):
//   import { bottomSheet } from '@/stores/bottomSheetStore';
//   bottomSheet.open({
//     children: <Text>내용</Text>,
//     height: '50%',
//     onDismiss: () => console.log('닫힘'),
//   });
//
// [사이클 5.1 사양]
// - 단일 snap (height prop: 'auto'(default 50%) / '50%' / 400)
// - drag dismiss (30% 또는 velocity > 500px/s) + 백드롭 탭 + BackHandler
// - safe-area 자동 / 키보드 정밀 보정은 사이클 5.3
// - 다중 snap / scrollable content는 사이클 5.2
// ============================================================================

import { useEffect } from 'react';
import type { ReactNode } from 'react';

import {
  useBottomSheetStore,
  type BottomSheetHeight,
} from '@/stores/bottomSheetStore';

export interface BottomSheetProps {
  /** 시트 표시 상태 — 외부에서 제어. */
  visible: boolean;
  /** 시트 dismiss 시 호출 (swipe / 백드롭 / API close / BackHandler). */
  onDismiss: () => void;
  /**
   * 시트 높이.
   * @default 'auto' (화면의 50%)
   */
  height?: BottomSheetHeight;
  /** 시트 안 콘텐츠. */
  children: ReactNode;
}

/**
 * BottomSheet — controlled 모드 wrapper.
 *
 * 실제 렌더링은 App 루트의 `<BottomSheetHost />`가 담당. 본 컴포넌트는
 * visible prop을 store에 동기화하는 역할.
 *
 * @example
 * <BottomSheet visible={open} onDismiss={() => setOpen(false)} height="50%">
 *   <Text>시트 콘텐츠</Text>
 * </BottomSheet>
 */
function BottomSheet({
  visible,
  onDismiss,
  height = 'auto',
  children,
}: BottomSheetProps) {
  useEffect(() => {
    if (visible) {
      useBottomSheetStore.getState().open({ children, height, onDismiss });
    } else {
      // 외부 visible이 false로 바뀌면 시트도 닫기 — onDismiss 중복 호출 방지 위해 store 직접 갱신
      const store = useBottomSheetStore.getState();
      if (store.isVisible) {
        useBottomSheetStore.setState({
          isVisible: false,
          children: null,
          onDismiss: undefined,
        });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  // children 또는 height 변경 시 store 갱신 (open 상태일 때)
  useEffect(() => {
    if (!visible) return;
    useBottomSheetStore.setState({ children, height });
  }, [visible, children, height]);

  return null;
}

export default BottomSheet;
