// ============================================================================
// Chip — 선택·필터·태그 표시 컴포넌트 (Material 3 4 variants)
// ============================================================================
//
// 4 variants(filter/assist/input/suggestion) × 2 sizes(sm/md) × 3 states
// (default/selected/disabled). 선택적 leading 아이콘 + Input variant의 close X.
//
// 사용 예:
//   const [selected, setSelected] = useState(false);
//   <Chip variant="filter" label="필터" selected={selected}
//     onPress={() => setSelected(s => !s)} />
//
//   import { Plus } from 'lucide-react-native';
//   <Chip variant="assist" label="추가" icon={<Plus />} onPress={...} />
//
//   import { Star } from 'lucide-react-native';
//   <Chip variant="input" label="태그" icon={<Star />} onPress={...}
//     onClose={() => removeTag()} />
//
//   <Chip variant="suggestion" label="제안" onPress={...} />
//
// [디자인 토큰 — variant별]
// Filter
//   default — outlined border/control, fill transparent, text text/primary
//   selected — fill primary/action, text + check icon primary/onAction
//   disabled — opacity 0.5
// Assist
//   default — outlined border/control, fill transparent, text text/primary,
//             leading icon text/secondary
// Input
//   default — filled surface/containerHigh + 1px border/subtle, text text/primary,
//             leading icon text/secondary, close X text/secondary
//             (테두리는 라이트에서 채움이 bg/canvas와 같은 값이라 필요하다 — ADR-51)
// Suggestion
//   default — outlined border/control, text text/muted (보조 톤), 아이콘 없음
//
// [공통 사양]
// sm — height 28, padding-h 10, 라벨 labelSm(11/600/14), icon 14 (close X 12)
// md — height 32, padding-h 12, 라벨 labelMd(13/600/16), icon 16 (close X 14)
// 라벨 글꼴은 typography 토큰만 쓴다 — 크기·굵기를 이 파일에서 정하지 않는다.
// cornerRadius = height/2 (pill)
// itemSpacing 8 (아이콘 ↔ 라벨, 라벨 ↔ close)
// accessibilityRole — filter 'switch' / 그 외 'button'
// ============================================================================

import { Check, X } from 'lucide-react-native';
import { cloneElement, isValidElement } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import { useAppTheme } from '../../theme';
import type { AppTheme } from '../../theme';

import Text from '../primitives/Text';
import type { InteractivePressableProps } from '../../types/interactive';

export type ChipVariant = 'filter' | 'assist' | 'input' | 'suggestion';
export type ChipSize = 'sm' | 'md';

export interface ChipProps extends InteractivePressableProps {
  variant: ChipVariant;
  size?: ChipSize;
  label: string;
  /** Assist/Input의 leading 아이콘 (lucide-react-native). Filter는 selected 시 ✓ 자동, Suggestion 무시. */
  icon?: React.ReactNode;
  /** Filter variant 전용. 다른 variant 무시. */
  selected?: boolean;
  onPress?: () => void;
  /** Input variant 전용. 다른 variant 무시. */
  onClose?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
}

interface SizeSpec {
  height: number;
  padH: number;
  /** 라벨에 쓸 typography 토큰 키 — 크기·굵기·폰트를 여기서 정하지 않는다. */
  textToken: 'labelSm' | 'labelMd';
  iconSize: number;
  closeIconSize: number;
}

const SIZE_SPEC: Record<ChipSize, SizeSpec> = {
  sm: { height: 28, padH: 10, textToken: 'labelSm', iconSize: 14, closeIconSize: 12 },
  md: { height: 32, padH: 12, textToken: 'labelMd', iconSize: 16, closeIconSize: 14 },
};

// hitSlop — 칩은 조밀하게 나열되는 표면이라 시각 높이를 키우지 않고 세로로만 넓혀
// 터치 44를 채운다(ADR-50). 가로는 넓히지 않는다 — 나란한 칩끼리 겹치기 때문.
const SIZE_HIT_SLOP: Record<ChipSize, { top: number; bottom: number }> = {
  sm: { top: 8, bottom: 8 },
  md: { top: 6, bottom: 6 },
};

// 닫기 X(input variant) — 시각 크기가 12~14라 세로는 44를 채우지만 가로는 32~34에
// 그친다. 더 넓히면 칩 자신의 press 영역을 삼켜 "칩 선택"이 불가능해지므로 여기서
// 멈춘다. 남은 제약은 ADR-50에 기록했다.
const CLOSE_HIT_SLOP: Record<
  ChipSize,
  { top: number; bottom: number; left: number; right: number }
> = {
  sm: { top: 16, bottom: 16, left: 8, right: 12 },
  md: { top: 15, bottom: 15, left: 8, right: 12 },
};

const Row = styled.View<{
  $h: number;
  $padH: number;
  $bg: string;
  $border: string;
  $disabled: boolean;
  $pressed: boolean;
}>`
  height: ${({ $h }) => $h}px;
  border-radius: ${({ $h }) => $h / 2}px;
  padding-left: ${({ $padH }) => $padH}px;
  padding-right: ${({ $padH }) => $padH}px;
  background-color: ${({ $bg }) => $bg};
  ${({ $border }) =>
    $border === 'none'
      ? 'border-width: 0;'
      : `border-width: 1px; border-color: ${$border};`}
  flex-direction: row;
  align-items: center;
  align-self: flex-start;
  opacity: ${({ theme, $disabled, $pressed }: { theme: AppTheme; $disabled: boolean; $pressed: boolean }) =>
    $disabled ? theme.interaction.disabledOpacity : $pressed ? theme.interaction.pressedOpacity : 1};
`;

const LabelText = styled(Text)<{ $color: string }>`
  color: ${({ $color }) => $color};
  margin-left: 8px;
  margin-right: 8px;
`;

const FirstLabelText = styled(LabelText)`
  margin-left: 0;
`;

const LastLabelText = styled(LabelText)`
  margin-right: 0;
`;

const SoloLabelText = styled(LabelText)`
  margin-left: 0;
  margin-right: 0;
`;

const CloseButton = styled(Pressable)`
  align-items: center;
  justify-content: center;
`;

function iconWithProps(
  icon: React.ReactNode,
  size: number,
  color: string,
): React.ReactNode {
  if (!isValidElement(icon)) return icon;
  return cloneElement(
    icon as React.ReactElement<{ size?: number; color?: string }>,
    { size, color },
  );
}

/**
 * Material 3 Chip — 4 variants × 2 sizes × 3 states.
 *
 * @example
 * const [active, setActive] = useState(false);
 * <Chip variant="filter" label="필터" selected={active}
 *   onPress={() => setActive(s => !s)} />
 */
function Chip({
  variant,
  size = 'md',
  label,
  icon,
  selected = false,
  onPress,
  onClose,
  disabled = false,
  style,
  accessibilityLabel,
  ...pressableProps
}: ChipProps) {
  const theme = useAppTheme();
  const spec = SIZE_SPEC[size];

  // variant별 시각 토큰
  const isFilterSelected = variant === 'filter' && selected;
  const bgColor = (() => {
    if (isFilterSelected) return theme.colors.primary.action;
    if (variant === 'input') return theme.colors.surface.containerHigh;
    return 'transparent';
  })();
  const borderColor = (() => {
    // filter-selected는 primary.action 채움이라 캔버스와 명백히 구분된다 — 테두리 불필요.
    // input은 surface.containerHigh 채움인데 라이트에서 그 값이 bg.canvas와 같은 칸이라
    // (둘 다 slate-200) 캔버스 위에서 면이 사라진다. Toast가 같은 토큰에 border.subtle
    // 1px을 두어 해결한 관례를 따른다(ADR-51).
    if (isFilterSelected) return 'none';
    if (variant === 'input') return theme.colors.border.subtle;
    return theme.colors.border.control;
  })();
  const textColor = (() => {
    if (isFilterSelected) return theme.colors.primary.onAction;
    if (variant === 'suggestion') return theme.colors.text.muted;
    return theme.colors.text.primary;
  })();
  const iconColor = isFilterSelected
    ? theme.colors.primary.onAction
    : theme.colors.text.secondary;

  // 렌더할 leading 아이콘 결정
  const renderLeading = (() => {
    if (variant === 'filter') {
      if (selected) return <Check size={spec.iconSize} color={iconColor} strokeWidth={2} />;
      return null;
    }
    if (variant === 'suggestion') return null;
    if (icon) return iconWithProps(icon, spec.iconSize, iconColor);
    return null;
  })();

  // close X (input variant만)
  const renderClose =
    variant === 'input' && onClose !== undefined ? (
      <CloseButton
        onPress={disabled ? undefined : onClose}
        disabled={disabled}
        hitSlop={CLOSE_HIT_SLOP[size]}
        accessibilityRole="button"
        accessibilityLabel="닫기"
      >
        <X size={spec.closeIconSize} color={iconColor} strokeWidth={2} />
      </CloseButton>
    ) : null;

  // label 컴포넌트 선택 — leading/close 유무에 따라 margin 조정
  const LabelComponent = (() => {
    if (renderLeading && renderClose) return LabelText;
    if (renderLeading && !renderClose) return LastLabelText;
    if (!renderLeading && renderClose) return FirstLabelText;
    return SoloLabelText;
  })();

  const role: 'switch' | 'button' = variant === 'filter' ? 'switch' : 'button';

  return (
    <Pressable
      onPress={disabled ? undefined : onPress}
      disabled={disabled}
      accessibilityRole={role}
      accessibilityState={{
        disabled,
        ...(variant === 'filter' ? { checked: selected } : {}),
      }}
      accessibilityLabel={accessibilityLabel ?? label}
      style={style}
      hitSlop={SIZE_HIT_SLOP[size]}
      {...pressableProps}
    >
      {({ pressed }) => (
        <Row
          $h={spec.height}
          $padH={spec.padH}
          $bg={bgColor}
          $border={borderColor}
          $disabled={disabled}
          $pressed={pressed}
        >
          {renderLeading}
          <LabelComponent variant={spec.textToken} $color={textColor}>
            {label}
          </LabelComponent>
          {renderClose}
        </Row>
      )}
    </Pressable>
  );
}

export default Chip;
