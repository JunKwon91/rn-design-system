// ============================================================================
// popupStore 유닛 테스트 — 열림/닫힘/onDismiss (공개 API)
// ============================================================================
//
// bottomSheetStore의 단순화 버전 — snap/queue 없이 단일 표시 + onDismiss.

import { usePopupStore, popup } from '../popupStore';

const state = () => usePopupStore.getState();

beforeEach(() =>
  usePopupStore.setState({
    isVisible: false,
    children: null,
    onDismiss: undefined,
  }),
);

describe('popupStore — open/close', () => {
  it('open은 isVisible을 true로 하고 children을 세팅한다', () => {
    popup.open({ children: 'C' });

    expect(state().isVisible).toBe(true);
    expect(state().children).toBe('C');
  });

  it('close는 isVisible을 false로 하고 children을 비우며 onDismiss를 호출한다', () => {
    const onDismiss = jest.fn();
    popup.open({ children: 'C', onDismiss });

    popup.close();

    expect(state().isVisible).toBe(false);
    expect(state().children).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('onDismiss 없이 닫아도 예외가 없다', () => {
    popup.open({ children: 'C' });
    expect(() => popup.close()).not.toThrow();
    expect(state().isVisible).toBe(false);
  });
});
