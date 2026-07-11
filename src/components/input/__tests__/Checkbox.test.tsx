// ============================================================================
// Checkbox UI 테스트 — ADR-14 value/onValueChange 계약 + 접근성 role/state
// ============================================================================

import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../test-utils';
import Checkbox from '../Checkbox';

describe('Checkbox — 접근성 상태 (ADR-14)', () => {
  it('checkbox role + accessibilityState.checked가 value를 반영한다', () => {
    const { getByRole, rerender } = renderWithTheme(
      <Checkbox value={false} accessibilityLabel="동의" onValueChange={() => {}} />,
    );
    // value=false → checked=false
    expect(getByRole('checkbox', { checked: false })).toBeOnTheScreen();

    rerender(
      <Checkbox value accessibilityLabel="동의" onValueChange={() => {}} />,
    );
    // value=true → checked=true
    expect(getByRole('checkbox', { checked: true })).toBeOnTheScreen();
  });
});

describe('Checkbox — onValueChange 계약 (ADR-14: RN Switch 스타일)', () => {
  it('press 시 반전된 값(!value)으로 onValueChange를 호출한다', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <Checkbox value={false} onValueChange={onValueChange} accessibilityLabel="동의" />,
    );

    fireEvent.press(getByRole('checkbox'));

    expect(onValueChange).toHaveBeenCalledWith(true);
  });

  it('value=true에서 press 시 false로 토글한다', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <Checkbox value onValueChange={onValueChange} accessibilityLabel="동의" />,
    );

    fireEvent.press(getByRole('checkbox'));

    expect(onValueChange).toHaveBeenCalledWith(false);
  });

  it('disabled면 state.disabled=true이고 press해도 onValueChange 미호출', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <Checkbox
        value={false}
        disabled
        onValueChange={onValueChange}
        accessibilityLabel="동의"
      />,
    );

    const box = getByRole('checkbox');
    expect(box).toBeDisabled();

    fireEvent.press(box);
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
