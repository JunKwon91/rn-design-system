// ============================================================================
// Toast — 개별 Toast 시각 컴포넌트
// ============================================================================
//
// 큐잉·표시·애니메이션은 ToastHost가 담당. 본 컴포넌트는 단순히 ToastConfig를
// 받아 시각만 렌더한다 (presentational).
//
// [디자인 토큰]
// 컨테이너: width는 ToastHost가 결정 (screen width − 32, max 400)
//   padding 16 H / 12 V, gap 12, radius 12
//   bg surface.containerHigh, 1px border.subtle
//   Drop shadow: offset(0, 4), blur 12, rgba(0,0,0,0.18) — iOS shadow* + Android elevation
// 좌측 아이콘: type별 lucide (Check/X/Info), size 20, color state.success/error/info
// Body (vertical, gap 2):
//   Title: Inter Semi Bold 14/20, text.primary
//   Description: Inter Regular 13/18, text.secondary
// 우측 닫기: IconButton size='sm' + muted, lucide X 16
// ============================================================================

import { Platform } from 'react-native';
import { Check, Info, X } from 'lucide-react-native';
import styled from 'styled-components/native';

import type { AppTheme } from '../../theme';
import { useAppTheme } from '../../theme';

import IconButton from '../action/IconButton';
import Text from '../primitives/Text';
import type { ToastConfig, ToastType } from '../../stores/toastStore';

export interface ToastProps {
  config: ToastConfig;
  onDismiss: () => void;
}

const Container = styled.View`
  flex-direction: row;
  align-items: center;
  padding: 12px 16px;
  border-width: 1px;
  gap: 12px;
  background-color: ${({ theme }: { theme: AppTheme }) => theme.colors.surface.containerHigh};
  border-color: ${({ theme }: { theme: AppTheme }) => theme.colors.border.subtle};
  border-radius: ${({ theme }: { theme: AppTheme }) => theme.radius.md}px;
  shadow-color: #000;
  shadow-offset: 0px 4px;
  shadow-opacity: 0.18;
  shadow-radius: 12px;
  elevation: 8;
`;

const Body = styled.View`
  flex: 1;
  flex-direction: column;
  gap: 2px;
`;

function renderIcon(type: ToastType, color: string) {
  switch (type) {
    case 'success':
      return <Check size={20} color={color} />;
    case 'error':
      return <X size={20} color={color} />;
    case 'info':
      return <Info size={20} color={color} />;
  }
}

function iconColor(theme: AppTheme, type: ToastType): string {
  switch (type) {
    case 'success':
      return theme.colors.state.success;
    case 'error':
      return theme.colors.state.error;
    case 'info':
      return theme.colors.state.info;
  }
}

export default function Toast({ config, onDismiss }: ToastProps) {
  const theme = useAppTheme();
  const { type, title, description } = config;

  return (
    <Container
      accessibilityRole={Platform.OS === 'android' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      {renderIcon(type, iconColor(theme, type))}
      <Body>
        <Text variant="labelLg" color="primary">
          {title}
        </Text>
        {description !== undefined && (
          <Text variant="bodyXs" color="secondary">
            {description}
          </Text>
        )}
      </Body>
      <IconButton
        icon={<X />}
        size="sm"
        color="muted"
        accessibilityLabel="알림 닫기"
        onPress={onDismiss}
      />
    </Container>
  );
}
