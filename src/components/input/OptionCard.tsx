// ============================================================================
// OptionCard — 선택형 옵션 카드
// ============================================================================
//
// 아이콘 + 제목/설명 + 선택 표시로 구성된 "하나를 고르는" 카드.
// 카드 전체가 탭 영역이며, 그룹 내 단일 선택(radio 시맨틱)은 소비 측이 관리한다.
// 폼 컨트롤(Radio/Checkbox)과 다른 층위 — 카드 자체가 선택 대상이다.
//
// 사용 예:
//   <OptionCard
//     selected={mode === 'hot'}
//     title="Hot 번호 추천"
//     description="최근 출현 빈도가 높은 번호 중심"
//     icon={<AlgorithmIcon kind="hot" />}
//     onPress={() => setMode('hot')}
//   />
//
// [디자인 토큰]
// 컨테이너: surface.container, radius.lg(16), padding 14/16, gap 14
//   selected   — 1px border primary.action
//   unselected — 보더 없음
// 제목: headlineSm (Manrope 17/600) text.primary
// 설명: bodySm (Inter 14/400) text.secondary
// 선택 마크(24 원):
//   selected   — fill primary.action + Check(onAction)
//   unselected — 1.5px border border.default, 투명
// ============================================================================

import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import styled from 'styled-components/native';

import type { AppTheme } from '../../theme';
import { useAppTheme } from '../../theme';
import { Check } from '../../icons';
import Text from '../primitives/Text';

export interface OptionCardProps {
  /** 선택 상태. 그룹 내 단일 선택은 소비 측이 관리한다. */
  selected: boolean;
  /** 옵션 제목. */
  title: string;
  /** 옵션 설명(보조 텍스트). */
  description?: string;
  /** 좌측 아이콘 슬롯 (예: AlgorithmIcon 등 ReactNode). */
  icon?: ReactNode;
  /** 탭 콜백. */
  onPress?: () => void;
  /** 비활성 — 탭 무시 + opacity 저하. */
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  testID?: string;
  accessibilityLabel?: string;
}

const Container = styled.Pressable<{ $selected: boolean; $disabled: boolean }>`
  flex-direction: row;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  border-radius: ${({ theme }: { theme: AppTheme }) => theme.radius.lg}px;
  background-color: ${({ theme }: { theme: AppTheme }) =>
    theme.colors.surface.container};
  border-width: ${({ $selected }: { $selected: boolean }) =>
    $selected ? 1 : 0}px;
  border-color: ${({ theme }: { theme: AppTheme }) => theme.colors.primary.action};
  opacity: ${({ theme, $disabled }: { theme: AppTheme; $disabled: boolean }) =>
    $disabled ? theme.interaction.disabledOpacity : 1};
`;

const TextCol = styled.View`
  flex: 1;
  gap: 2px;
`;

const Mark = styled.View<{ $selected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme, $selected }: { theme: AppTheme; $selected: boolean }) =>
    $selected ? theme.colors.primary.action : 'transparent'};
  border-width: ${({ $selected }: { $selected: boolean }) =>
    $selected ? 0 : 1.5}px;
  border-color: ${({ theme }: { theme: AppTheme }) => theme.colors.border.default};
`;

/**
 * 선택형 옵션 카드.
 *
 * 아이콘 + 제목/설명 + 선택 마크. 카드 전체가 탭 영역이며 단일 선택은
 * 소비 측이 관리한다(accessibilityRole="radio").
 *
 * @example
 * <OptionCard selected title="Hot 번호 추천"
 *   description="최근 출현 빈도가 높은 번호 중심"
 *   icon={<AlgorithmIcon kind="hot" />} onPress={onSelect} />
 */
export default function OptionCard({
  selected,
  title,
  description,
  icon,
  onPress,
  disabled = false,
  style,
  testID,
  accessibilityLabel,
}: OptionCardProps) {
  const theme = useAppTheme();

  return (
    <Container
      $selected={selected}
      $disabled={disabled}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="radio"
      accessibilityState={{ selected, disabled }}
      accessibilityLabel={accessibilityLabel ?? title}
      testID={testID}
      style={style}
    >
      {icon}
      <TextCol>
        <Text variant="headlineSm">{title}</Text>
        {description !== undefined && (
          <Text variant="bodySm" color="secondary">
            {description}
          </Text>
        )}
      </TextCol>
      <Mark $selected={selected}>
        {selected && (
          <Check size={14} color={theme.colors.primary.onAction} strokeWidth={2} />
        )}
      </Mark>
    </Container>
  );
}
