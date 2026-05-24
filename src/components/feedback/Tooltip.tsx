// ============================================================================
// Tooltip — Material 3 Plain 도구 설명
// ============================================================================
//
// children에 onLongPress 자동 주입 (cloneElement) → 롱프레스 표시,
// 1500ms 자동 dismiss.
//
// 사용 예:
//   <Tooltip text="설정 메뉴">
//     <IconButton icon={<Settings />} onPress={openSettings}
//       accessibilityLabel="설정" />
//   </Tooltip>
//
//   <Tooltip text="삭제합니다" position="bottom">
//     <IconButton icon={<Trash />} onPress={handleDelete}
//       accessibilityLabel="삭제" />
//   </Tooltip>
//
//   // controlled mode — onboarding 시나리오
//   const [hint, setHint] = useState(true);
//   <Tooltip text="여기를 눌러보세요!" visible={hint}>
//     <Button label="시작" onPress={onStart} />
//   </Tooltip>
//
// [children 요구사항]
// onLongPress prop 수용 가능 element 필수.
// - 라이브러리 5 인터랙티브 컴포넌트 (IconButton/Button/FAB/Chip/Switch):
//   사이클 4에서 InteractivePressableProps Pick 상속 적용 → 자동 호환.
// - 외부 라이브러리 컴포넌트: onLongPress prop 수용 여부 확인 필수.
// - 일반 View 등 비-Pressable element: 사용자가 Pressable로 직접 wrap 후 사용.
//
// [디자인 토큰]
// 배경: surface.inverse (사이클 4 신규 — M3 inverse-surface)
// 텍스트: text.primaryInverse (기존 재사용)
// padding: 8h × 4v (M3 Plain 표준)
// cornerRadius: 4 (M3 small)
// max-width: 200 (M3 Plain 표준)
// target ↔ Tooltip gap: 4 (spacing.xs)
//
// [위치 계산]
// Container + Bubble 둘 다 onLayout 측정 → 4 position 픽셀 단위 절대 위치.
// 첫 render에서 size 0이지만 fade in 150ms 안에 measure 완료 → 시각 매끄러움.
//
// [애니메이션]
// Reanimated v4 fade in/out 150ms (사이클 2.5 표준)
// cancelAnimation cleanup (unmount memory leak 방지)
//
// [트리거 동작 — discriminated visible prop]
// visible undefined → 자동 모드: 롱프레스 표시 + 1500ms 자동 dismiss
// visible boolean   → controlled: 부모가 직접 timer 처리
//
// [a11y]
// children에 accessibilityHint 자동 주입 (기존 hint 보존)
// Bubble에 accessibilityRole 'text' + accessibilityLiveRegion 'polite'
//
// [cloneElement 패턴 — 사이클 4 학습]
// Pressable wrap 패턴 시도 후 발견: RN nested Pressable은 inner가 이벤트
// capture → 외부 Pressable의 onLongPress 발동 X. cloneElement 패턴이 본질적
// 해결. 라이브러리 5 인터랙티브 컴포넌트는 InteractivePressableProps Pick 상속
// (사이클 4)으로 onLongPress 자동 수용 → cloneElement 도달 보장.
// ============================================================================

import {
  Children,
  cloneElement,
  isValidElement,
  useCallback,
  useEffect,
  useState,
} from 'react';
import type { LayoutChangeEvent, StyleProp, ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  /** 표시 텍스트 (M3 Plain — string only, max-width 200dp 권장) */
  text: string;
  /**
   * 위치 — target 기준 4방향.
   * @default 'top'
   */
  position?: TooltipPosition;
  /**
   * 외부 제어 모드 — undefined면 자동(롱프레스), boolean이면 controlled.
   * controlled mode에서 부모가 직접 timer 처리 책임.
   */
  visible?: boolean;
  /**
   * 자동 dismiss 대기 (ms). 자동 모드 한정 (visible undefined일 때만).
   * @default 1500 (M3 표준)
   */
  autoDismissDelay?: number;
  /**
   * wrap 대상 — onLongPress prop 수용 element 필수.
   * 라이브러리 5 인터랙티브 컴포넌트(IconButton/Button/FAB/Chip/Switch)는
   * InteractivePressableProps Pick 상속(사이클 4)으로 자동 호환.
   * 일반 View 등 비-Pressable element는 사용자가 Pressable로 직접 wrap 후 사용.
   */
  children: React.ReactElement;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const Container = styled.View`
  position: relative;
  align-self: flex-start;
`;

const Bubble = styled.View`
  max-width: 200px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 4px;
  padding-bottom: 4px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.surface.inverse};
`;

const BubbleText = styled.Text`
  color: ${({ theme }) => theme.colors.text.primaryInverse};
  font-size: 12px;
  line-height: 16px;
`;

const GAP = 4;

/**
 * Material 3 Plain Tooltip.
 *
 * children에 onLongPress cloneElement 주입 — 라이브러리 5 인터랙티브
 * 컴포넌트는 InteractivePressableProps Pick 상속으로 자동 호환.
 *
 * @example
 * <Tooltip text="설정 메뉴">
 *   <IconButton icon={<Settings />} onPress={openSettings}
 *     accessibilityLabel="설정" />
 * </Tooltip>
 */
function Tooltip({
  text,
  position = 'top',
  visible,
  autoDismissDelay = 1500,
  children,
  style,
  testID,
  accessibilityLabel,
}: TooltipProps) {
  useTheme();
  const [internalVisible, setInternalVisible] = useState(false);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [bubbleSize, setBubbleSize] = useState({ width: 0, height: 0 });

  const isControlled = visible !== undefined;
  const isVisible = isControlled ? visible : internalVisible;

  const opacity = useSharedValue(0);

  // visible 상태 변화 → fade in/out
  useEffect(() => {
    opacity.value = withTiming(isVisible ? 1 : 0, { duration: 150 });
    return () => {
      cancelAnimation(opacity);
    };
  }, [isVisible, opacity]);

  // 자동 dismiss timer (자동 모드 한정 — 1500ms M3 표준)
  useEffect(() => {
    if (isControlled || !internalVisible) return;
    const timer = setTimeout(
      () => setInternalVisible(false),
      autoDismissDelay,
    );
    return () => clearTimeout(timer);
  }, [isControlled, internalVisible, autoDismissDelay]);

  const handleContainerLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setContainerSize(prev =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, []);

  const handleBubbleLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setBubbleSize(prev =>
      prev.width === width && prev.height === height
        ? prev
        : { width, height },
    );
  }, []);

  const fadeStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  // 4 position 픽셀 절대 위치
  const positionStyle = (() => {
    switch (position) {
      case 'top':
        return {
          position: 'absolute' as const,
          top: -bubbleSize.height - GAP,
          left: (containerSize.width - bubbleSize.width) / 2,
        };
      case 'bottom':
        return {
          position: 'absolute' as const,
          top: containerSize.height + GAP,
          left: (containerSize.width - bubbleSize.width) / 2,
        };
      case 'left':
        return {
          position: 'absolute' as const,
          left: -bubbleSize.width - GAP,
          top: (containerSize.height - bubbleSize.height) / 2,
        };
      case 'right':
        return {
          position: 'absolute' as const,
          left: containerSize.width + GAP,
          top: (containerSize.height - bubbleSize.height) / 2,
        };
    }
  })();

  // children에 onLongPress + accessibilityHint cloneElement 주입 (기존 prop 보존)
  const child = Children.only(children);
  if (
    !isValidElement<{
      onLongPress?: () => void;
      accessibilityHint?: string;
    }>(child)
  ) {
    return <Container style={style}>{children}</Container>;
  }

  const childOnLongPress = child.props.onLongPress;
  const childAccessibilityHint = child.props.accessibilityHint;

  const enhancedChild = cloneElement(child, {
    onLongPress: () => {
      if (!isControlled) setInternalVisible(true);
      childOnLongPress?.();
    },
    accessibilityHint:
      childAccessibilityHint ?? '롱프레스로 도구 설명 표시',
  });

  return (
    <Container
      style={style}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      onLayout={handleContainerLayout}
    >
      {enhancedChild}
      {isVisible && (
        <Animated.View
          style={[positionStyle, fadeStyle]}
          onLayout={handleBubbleLayout}
          pointerEvents="none"
          accessibilityRole="text"
          accessibilityLiveRegion="polite"
        >
          <Bubble>
            <BubbleText>{text}</BubbleText>
          </Bubble>
        </Animated.View>
      )}
    </Container>
  );
}

export default Tooltip;
