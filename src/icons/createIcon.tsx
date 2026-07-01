// ============================================================================
// createIcon — 커스텀 SVG 아이콘 팩토리
// ============================================================================
//
// lucide-react-native와 동일한 렌더 엔진(react-native-svg) 위에서, 같은
// 시그니처(size/color/strokeWidth)를 갖는 아이콘 컴포넌트를 생성한다.
// API가 lucide와 동일하므로 기존 lucide 사용처를 import만 교체해 drop-in
// 대체할 수 있다. (lucide로 커버되지 않는 커스텀 글리프를 DS가 직접 소유)
//
// 규약:
//   - viewBox 24×24 (lucide 관례)
//   - stroke 기반 (fill=none), strokeWidth 기본 2, round cap/join
//   - color는 소비 측에서 주입 (기본 'currentColor')
//
// 사용:
//   export const Check = createIcon('M5.1 12.5 L9.9 17.1 L18.9 7.2');
//   <Check size={16} color={theme.colors.primary.onAction} strokeWidth={2} />
// ============================================================================

import Svg, { Path } from 'react-native-svg';
import type { SvgProps } from 'react-native-svg';

export interface IconProps extends SvgProps {
  /** 정사각 크기(px). @default 24 */
  size?: number;
  /** stroke 색상. @default 'currentColor' */
  color?: string;
  /** 선 두께. @default 2 */
  strokeWidth?: number;
}

/**
 * SVG path(들)로부터 표준 아이콘 컴포넌트를 만든다.
 *
 * @param paths   단일 path 문자열 또는 path 배열(다중 path 아이콘)
 * @param viewBox 기본 '0 0 24 24'
 */
export function createIcon(paths: string | string[], viewBox = '0 0 24 24') {
  const d = Array.isArray(paths) ? paths : [paths];

  return function Icon({
    size = 24,
    color = 'currentColor',
    strokeWidth = 2,
    ...rest
  }: IconProps) {
    return (
      <Svg width={size} height={size} viewBox={viewBox} fill="none" {...rest}>
        {d.map((path, i) => (
          <Path
            key={i}
            d={path}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </Svg>
    );
  };
}
