// ============================================================================
// FAB (Floating Action Button) — Material 3 시그니처 액션 버튼
// ============================================================================
//
// 4 variants(small/default/large/extended) — primary 단일 color. 화면 우하단·
// 상단 등 자유 위치 사용. M3 Elevation 3 그림자.
//
// 사용 예:
//   import { Plus } from 'lucide-react-native';
//   <FAB icon={<Plus />} accessibilityLabel="추가" onPress={openSheet} />
//   <FAB variant="small" icon={<Plus />} accessibilityLabel="추가" onPress={...} />
//   <FAB variant="large" icon={<Plus />} accessibilityLabel="새 항목" onPress={...} />
//   <FAB variant="extended" icon={<Plus />} label="글쓰기" onPress={...} />
//
// [디자인 토큰]
// Sizes:
//   small    — 40×40, cornerRadius 20 (정원)
//   default  — 56×56, cornerRadius 28 (정원)
//   large    — 96×96, cornerRadius 48 (정원)
//   extended — height 56, width auto, cornerRadius 28 (pill),
//              padding-horizontal 16/20, icon + gap 8 + label
// 색상: primary 단일
//   bg primary.action, icon·label text.onPrimaryAction
// 아이콘 size (cloneElement 자동 주입):
//   small/default/extended 24, large 36
// 그림자 (M3 Elevation 3):
//   iOS: shadowColor #000 + offset (0,3) + opacity 0.15 + radius 6
//   Android: elevation 6
// 라벨: Inter Semi Bold 14 (extended 한정)
// Pressed 피드백: opacity 0.85 (Button 패턴 일관)
// Disabled: opacity 0.5
// ============================================================================

import { cloneElement, isValidElement } from 'react';
import { Pressable } from 'react-native';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import type { AppTheme } from '../../theme';
import { useAppTheme } from '../../theme';
import Text from '../primitives/Text';
import type { InteractivePressableProps } from '../../types/interactive';

export type FABVariant = 'small' | 'default' | 'large' | 'extended';

export interface FABProps extends InteractivePressableProps {
  variant?: FABVariant;
  icon: React.ReactNode;
  /** extended variant일 때 필수 — 다른 variant에선 무시됨. */
  label?: string;
  onPress: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  /** 접근성 라벨 — extended는 label로 자동, 다른 variant는 필수. */
  accessibilityLabel?: string;
}

interface SizeSpec {
  dim: number;
  radius: number;
  iconSize: number;
}

const SIZE_SPEC: Record<Exclude<FABVariant, 'extended'>, SizeSpec> = {
  small:   { dim: 40, radius: 20, iconSize: 24 },
  default: { dim: 56, radius: 28, iconSize: 24 },
  large:   { dim: 96, radius: 48, iconSize: 36 },
};

// hitSlop — small(40)만 최소 터치 44에 미달한다. FAB는 화면 위에 떠 있어 인접
// 요소와 겹칠 일이 없으므로 사방으로 2씩 넓혀 44를 채운다(ADR-50).
// default(56)·large(96)·extended(56)는 시각 크기만으로 충족한다.
const VARIANT_HIT_SLOP: Record<Exclude<FABVariant, 'extended'>, number | undefined> = {
  small: 2,
  default: undefined,
  large: undefined,
};

const EXTENDED_HEIGHT = 56;
const EXTENDED_RADIUS = 28;
const EXTENDED_ICON_SIZE = 24;

const SHADOW = {
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.15,
  shadowRadius: 6,
  elevation: 6,
};

const SquareFab = styled(Pressable).attrs({ style: SHADOW })<{
  $dim: number;
  $radius: number;
}>`
  width: ${({ $dim }) => $dim}px;
  height: ${({ $dim }) => $dim}px;
  border-radius: ${({ $radius }) => $radius}px;
  background-color: ${({ theme }: { theme: AppTheme }) => theme.colors.primary.action};
  align-items: center;
  justify-content: center;
`;

const ExtendedFab = styled(Pressable).attrs({ style: SHADOW })`
  height: ${EXTENDED_HEIGHT}px;
  border-radius: ${EXTENDED_RADIUS}px;
  background-color: ${({ theme }: { theme: AppTheme }) => theme.colors.primary.action};
  flex-direction: row;
  align-items: center;
  padding-left: 16px;
  padding-right: 20px;
`;

// 글꼴은 사용처에서 variant="labelLg"로 지정한다(typography 토큰 경유).
// 여기서 font-family/font-weight를 덮어쓰면 앱이 테마로 폰트를 바꿔도 따라가지 않는다.
const ExtendedLabel = styled(Text)`
  margin-left: 8px;
  color: ${({ theme }: { theme: AppTheme }) => theme.colors.primary.onAction};
`;

function iconWithProps(icon: React.ReactNode, size: number, color: string): React.ReactNode {
  if (!isValidElement(icon)) return icon;
  return cloneElement(icon as React.ReactElement<{ size?: number; color?: string }>, {
    size,
    color,
  });
}

/**
 * Material 3 Floating Action Button — 4 variants, primary 단일 color.
 *
 * extended variant는 label 필수, 다른 variant는 accessibilityLabel 필수.
 *
 * @example
 * import { Plus } from 'lucide-react-native';
 * <FAB icon={<Plus />} accessibilityLabel="추가" onPress={open} />
 * <FAB variant="extended" icon={<Plus />} label="글쓰기" onPress={open} />
 */
function FAB({
  variant = 'default',
  icon,
  label,
  onPress,
  disabled = false,
  style,
  accessibilityLabel,
  ...pressableProps
}: FABProps) {
  const theme = useAppTheme();
  const iconColor = theme.colors.primary.onAction;

  if (variant === 'extended') {
    return (
      <ExtendedFab
        onPress={onPress}
        disabled={disabled}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
        accessibilityLabel={accessibilityLabel ?? label}
        style={({ pressed }) => [
          SHADOW,
          { opacity: disabled ? theme.interaction.disabledOpacity : pressed ? theme.interaction.pressedOpacity : 1 },
          style,
        ]}
        {...pressableProps}
      >
        {iconWithProps(icon, EXTENDED_ICON_SIZE, iconColor)}
        {label !== undefined && (
          <ExtendedLabel variant="labelLg">{label}</ExtendedLabel>
        )}
      </ExtendedFab>
    );
  }

  const spec = SIZE_SPEC[variant];
  return (
    <SquareFab
      $dim={spec.dim}
      $radius={spec.radius}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      accessibilityLabel={accessibilityLabel}
      hitSlop={VARIANT_HIT_SLOP[variant]}
      style={({ pressed }) => [
        SHADOW,
        { opacity: disabled ? 0.5 : pressed ? 0.85 : 1 },
        style,
      ]}
      {...pressableProps}
    >
      {iconWithProps(icon, spec.iconSize, iconColor)}
    </SquareFab>
  );
}

export default FAB;
