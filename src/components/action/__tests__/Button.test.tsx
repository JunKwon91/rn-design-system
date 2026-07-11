// ============================================================================
// Button UI 테스트 — 접근성 role/state 쿼리 기반
// ============================================================================
//
// 쿼리는 testID가 아니라 accessibilityRole="button" + accessibilityLabel(=label)
// + accessibilityState(disabled/busy)로 작성한다.

import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../test-utils';
import Button from '../Button';

describe('Button — 렌더 & 접근성', () => {
  it('label을 접근성 이름으로 가진 button role로 렌더된다', () => {
    const { getByRole } = renderWithTheme(
      <Button label="저장" onPress={() => {}} />,
    );
    expect(getByRole('button', { name: '저장' })).toBeOnTheScreen();
  });

  it.each(['primary', 'secondary', 'destructive'] as const)(
    'variant=%s 로 렌더된다',
    (variant) => {
      const { getByRole } = renderWithTheme(
        <Button label="액션" variant={variant} onPress={() => {}} />,
      );
      expect(getByRole('button', { name: '액션' })).toBeOnTheScreen();
    },
  );
});

describe('Button — onPress 계약', () => {
  it('press 시 onPress가 호출된다', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button label="저장" onPress={onPress} />,
    );

    fireEvent.press(getByRole('button'));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('disabled면 accessibilityState.disabled=true이고 press해도 onPress 미호출', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button label="저장" disabled onPress={onPress} />,
    );

    const button = getByRole('button');
    expect(button).toBeDisabled();

    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('loading이면 busy 상태로 표시되고 press해도 onPress 미호출', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithTheme(
      <Button label="제출" loading onPress={onPress} />,
    );

    const button = getByRole('button', { busy: true });
    fireEvent.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });
});
