// ============================================================================
// Switch UI 테스트 — ADR-14 value/onValueChange 계약 + 접근성 role/state
// ============================================================================
//
// Switch는 Reanimated v4 애니메이션을 쓰지만(jest에서 mock), 계약 검증은
// role="switch" + accessibilityState.checked + onValueChange로 충분하다.

import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../test-utils';
import Switch from '../Switch';

describe('Switch — 접근성 상태 (ADR-14)', () => {
  it('switch role + accessibilityState.checked가 value를 반영한다', () => {
    const { getByRole, rerender } = renderWithTheme(
      <Switch value={false} accessibilityLabel="알림" onValueChange={() => {}} />,
    );
    expect(getByRole('switch', { checked: false })).toBeOnTheScreen();

    rerender(
      <Switch value accessibilityLabel="알림" onValueChange={() => {}} />,
    );
    expect(getByRole('switch', { checked: true })).toBeOnTheScreen();
  });
});

describe('Switch — onValueChange 계약', () => {
  it('press 시 반전된 값으로 onValueChange를 호출한다', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <Switch value={false} onValueChange={onValueChange} accessibilityLabel="알림" />,
    );

    fireEvent.press(getByRole('switch'));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('disabled면 state.disabled=true이고 press해도 onValueChange 미호출', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <Switch value disabled onValueChange={onValueChange} accessibilityLabel="알림" />,
    );

    const sw = getByRole('switch');
    expect(sw).toBeDisabled();
    fireEvent.press(sw);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
