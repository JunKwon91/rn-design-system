// ============================================================================
// Skeleton — 콘텐츠 로딩 중 placeholder
// ============================================================================
//
// 3 variants(rect/circle/text) discriminated union. backgroundColor pulse
// 애니메이션으로 shimmer 시각 효과(1.5초 사이클 무한 반복). LoadingView가 단순
// "로딩 중" 표시라면 Skeleton은 콘텐츠 shape를 미리 시각화하여 사용자 인지
// 부담 감소.
//
// 사용 예:
//   <Skeleton type="rect" width={200} height={16} />
//   <Skeleton type="circle" size={40} />
//   <Skeleton type="text" />                                  // 3 lines 기본
//   <Skeleton type="text" lines={2} lineWidths={['100%', '70%']} />
//
// [디자인 토큰]
// 배경 (정적 base): border.default (mid-gray, ADR-19 scope 확장 활용)
// Shimmer highlight: surface.containerHigh (한 톤 밝은 peak)
//   surface.container ↔ containerHigh 대비 1.06~1.13으로 명도 차이 미세 →
//   border.default ↔ containerHigh로 확대 (대비 ~1.5)
//   동작: backgroundColor interpolation 0~1, 1.5s 무한 반복
// cornerRadius:
//   rect: 4
//   circle: size/2 (정원)
//   text 각 line: 4
// 라인 gap: spacing.sm
//
// [애니메이션]
// Reanimated v4 useSharedValue + withRepeat(withSequence(...)) 750ms × 2
// useAnimatedStyle + interpolateColor — UI 스레드 worklet 실행
// 컴포넌트 unmount 시 cancelAnimation으로 cleanup
// ============================================================================

import { useEffect } from 'react';
import Animated, {
  cancelAnimation,
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import styled, { useTheme } from 'styled-components/native';

export type SkeletonProps =
  | { type: 'rect'; width: number; height: number }
  | { type: 'circle'; size: number }
  | {
      type: 'text';
      lines?: number;
      lineWidths?: (number | string)[];
      lineHeight?: number;
    };

const Container = styled.View``;

const LineGap = styled.View`
  height: 8px;
`;

const RectBox = styled(Animated.View)<{ $w: number; $h: number }>`
  width: ${({ $w }) => $w}px;
  height: ${({ $h }) => $h}px;
  border-radius: 4px;
`;

const CircleBox = styled(Animated.View)<{ $size: number }>`
  width: ${({ $size }) => $size}px;
  height: ${({ $size }) => $size}px;
  border-radius: ${({ $size }) => $size / 2}px;
`;

const TextLine = styled(Animated.View)<{ $w: number | string; $h: number }>`
  width: ${({ $w }) => (typeof $w === 'number' ? `${$w}px` : $w)};
  height: ${({ $h }) => $h}px;
  border-radius: 4px;
`;

function useShimmerStyle() {
  const theme = useTheme();
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 750 }),
        withTiming(0, { duration: 750 }),
      ),
      -1,
      false,
    );
    return () => {
      cancelAnimation(progress);
    };
  }, [progress]);

  return useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(
      progress.value,
      [0, 1],
      [theme.colors.border.default, theme.colors.surface.containerHigh],
    ),
  }), [theme]);
}

/**
 * 콘텐츠 로딩 중 placeholder.
 *
 * 3 type discriminated union — 각 type에 맞는 props만 허용.
 *
 * @example
 * <Skeleton type="rect" width={200} height={16} />
 * <Skeleton type="circle" size={40} />
 * <Skeleton type="text" lines={3} lineWidths={['100%', '80%', '60%']} />
 */
function Skeleton(props: SkeletonProps) {
  const animatedStyle = useShimmerStyle();

  if (props.type === 'rect') {
    return (
      <RectBox
        $w={props.width}
        $h={props.height}
        accessibilityRole="none"
        accessibilityLabel="Loading"
        style={animatedStyle}
      />
    );
  }

  if (props.type === 'circle') {
    return (
      <CircleBox
        $size={props.size}
        accessibilityRole="none"
        accessibilityLabel="Loading"
        style={animatedStyle}
      />
    );
  }

  // type === 'text'
  const lines = props.lines ?? 3;
  const lineHeight = props.lineHeight ?? 12;
  const lineWidths = props.lineWidths ?? ['100%', '80%', '60%'];

  const items: React.ReactNode[] = [];
  for (let i = 0; i < lines; i++) {
    const w = lineWidths[i] ?? lineWidths[lineWidths.length - 1] ?? '100%';
    if (i > 0) items.push(<LineGap key={`gap-${i}`} />);
    items.push(
      <TextLine
        key={`line-${i}`}
        $w={w}
        $h={lineHeight}
        accessibilityRole="none"
        accessibilityLabel="Loading"
        style={animatedStyle}
      />,
    );
  }

  return <Container>{items}</Container>;
}

export default Skeleton;
