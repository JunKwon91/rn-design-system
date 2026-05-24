// ============================================================================
// InteractivePressableProps — 인터랙티브 컴포넌트 공통 prop 표준
// ============================================================================
//
// 라이브러리의 인터랙티브 컴포넌트(IconButton / Button / FAB / Chip / Switch)가
// 표준 RN `Pressable`처럼 사용 가능하도록 PressableProps에서 핵심 prop을 Pick.
//
// 사이클 4 학습: Tooltip이 children에 `onLongPress` 자동 주입(cloneElement)
// 패턴을 시도했으나, 라이브러리 컴포넌트가 해당 prop을 수용하지 못해 도달 X.
// → 컴포넌트 측에서 PressableProps Pick 상속으로 표준 RN 패턴을 노출.
//
// 사용 예 (Tooltip wrap 시나리오):
//   <Tooltip text="설정">
//     <IconButton icon={<Settings />} onPress={...} accessibilityLabel="설정" />
//   </Tooltip>
//   → Tooltip의 Pressable wrap 패턴 + IconButton의 자체 onPress 모두 정상 작동
//
// 사용 예 (사용자 직접 인터랙션 prop):
//   <IconButton
//     icon={<Settings />}
//     onPress={openSettings}
//     onLongPress={() => showContextMenu()}  // Pick 상속 prop
//     delayLongPress={300}                    // Pick 상속 prop
//     accessibilityLabel="설정"
//   />
//
// [Pick 범위 결정]
// 포함:
//   - onLongPress / onPressIn / onPressOut: 인터랙션 확장 (Tooltip / 사용자)
//   - delayLongPress: 롱프레스 발동 시간 조정 (RN default 500ms)
//   - hitSlop: 터치 영역 확장 (컴포넌트 자체 default + 사용자 override)
//   - accessibilityHint: 스크린리더 추가 설명 (Tooltip 자동 주입 시나리오 포함)
//   - testID: 테스트 식별자
//
// 제외:
//   - onPress: 각 컴포넌트가 자체 처리 (필수 / boolean 등 컴포넌트별 시그니처)
//   - accessibilityLabel: 컴포넌트별 필수 여부 다름 (IconButton 필수 등)
//   - accessibilityRole / accessibilityState: 컴포넌트별 자체 처리
//   - disabled: 컴포넌트별 자체 상태 처리
//   - style: 컴포넌트별 자체 처리 + StyleProp 명시
// ============================================================================

import type { PressableProps } from 'react-native';

export type InteractivePressableProps = Pick<
  PressableProps,
  | 'onLongPress'
  | 'onPressIn'
  | 'onPressOut'
  | 'delayLongPress'
  | 'hitSlop'
  | 'accessibilityHint'
  | 'testID'
>;
