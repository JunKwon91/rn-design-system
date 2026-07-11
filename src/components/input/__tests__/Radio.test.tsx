// ============================================================================
// Radio + RadioGroup UI 테스트 — ADR-14 그룹 Context + 접근성 role/state
// ============================================================================
//
// ADR-14: Radio는 RadioGroup 없이는 useRadioGroup() 훅이 에러(안티패턴 차단).
//         그룹은 value/onValueChange를 Context로 주입, radiogroup role 자동 부여.

import { fireEvent } from '@testing-library/react-native';
import { renderWithTheme } from '../../../test-utils';
import RadioGroup from '../RadioGroup';
import Radio from '../Radio';

describe('RadioGroup — 접근성 컨테이너', () => {
  // 주의: RadioGroup 컨테이너 View는 accessibilityRole="radiogroup"을 갖지만
  // accessible={true}는 "의도적으로" 주지 않는다. 컨테이너를 단일 접근성
  // 요소로 만들면 자식 Radio들이 개별 포커스를 잃기 때문(잘못된 그룹 A11y).
  // 그래서 getByRole('radiogroup')로는 매칭되지 않는 게 정상이고, 대신
  // "자식 Radio들이 각각 개별 접근 가능한지"가 그룹핑의 핵심 보장이다.
  it('그룹 내 각 Radio가 개별 radio 접근성 요소로 노출된다', () => {
    const { getByRole } = renderWithTheme(
      <RadioGroup value="a" onValueChange={() => {}}>
        <Radio value="a" accessibilityLabel="A" />
        <Radio value="b" accessibilityLabel="B" />
      </RadioGroup>,
    );
    expect(getByRole('radio', { name: 'A' })).toBeOnTheScreen();
    expect(getByRole('radio', { name: 'B' })).toBeOnTheScreen();
  });
});

describe('Radio — 선택 상태 + Context 전달 (ADR-14)', () => {
  it('그룹 value와 일치하는 Radio만 selected=true', () => {
    const { getByRole } = renderWithTheme(
      <RadioGroup value="b" onValueChange={() => {}}>
        <Radio value="a" accessibilityLabel="A" />
        <Radio value="b" accessibilityLabel="B" />
      </RadioGroup>,
    );

    expect(getByRole('radio', { name: 'A', selected: false })).toBeOnTheScreen();
    expect(getByRole('radio', { name: 'B', selected: true })).toBeOnTheScreen();
  });

  it('Radio press 시 그룹의 onValueChange가 그 value로 호출된다', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <RadioGroup value="a" onValueChange={onValueChange}>
        <Radio value="a" accessibilityLabel="A" />
        <Radio value="b" accessibilityLabel="B" />
      </RadioGroup>,
    );

    fireEvent.press(getByRole('radio', { name: 'B' }));

    expect(onValueChange).toHaveBeenCalledWith('b');
  });
});

describe('Radio — disabled 결합 (개별 OR 그룹)', () => {
  it('개별 disabled Radio는 press해도 onValueChange 미호출', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <RadioGroup value="a" onValueChange={onValueChange}>
        <Radio value="a" accessibilityLabel="A" />
        <Radio value="b" accessibilityLabel="B" disabled />
      </RadioGroup>,
    );

    const b = getByRole('radio', { name: 'B' });
    expect(b).toBeDisabled();
    fireEvent.press(b);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it('그룹 disabled면 모든 Radio가 disabled', () => {
    const onValueChange = jest.fn();
    const { getByRole } = renderWithTheme(
      <RadioGroup value="a" onValueChange={onValueChange} disabled>
        <Radio value="a" accessibilityLabel="A" />
        <Radio value="b" accessibilityLabel="B" />
      </RadioGroup>,
    );

    expect(getByRole('radio', { name: 'A' })).toBeDisabled();
    fireEvent.press(getByRole('radio', { name: 'B' }));
    expect(onValueChange).not.toHaveBeenCalled();
  });
});

describe('Radio — RadioGroup 외부 단독 사용 차단 (ADR-14)', () => {
  it('RadioGroup 밖에서 Radio를 렌더하면 에러를 던진다', () => {
    // useRadioGroup() 훅이 Context 부재 시 throw → 렌더가 예외.
    // (React가 콘솔에 에러 로그를 남기므로 잠시 silence)
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() =>
      renderWithTheme(<Radio value="a" accessibilityLabel="외톨이" />),
    ).toThrow('Radio must be rendered inside a <RadioGroup>.');
    spy.mockRestore();
  });
});
