// ============================================================================
// bottomSheetStore 유닛 테스트 — 열림/닫힘/snap 전이 (공개 API)
// ============================================================================
//
// 한 번에 1개 표시. imperative open/close/snapTo + onDismiss/onSnapChange 콜백.

import { useBottomSheetStore, bottomSheet } from '../bottomSheetStore';
import type { BottomSheetSnap } from '../bottomSheetStore';

const state = () => useBottomSheetStore.getState();

const INITIAL = {
  isVisible: false,
  snapPoints: ['auto'] as BottomSheetSnap[],
  currentSnapIndex: 0,
  children: null,
  onDismiss: undefined as (() => void) | undefined,
  onSnapChange: undefined as ((index: number) => void) | undefined,
};

beforeEach(() => useBottomSheetStore.setState({ ...INITIAL }));

describe('bottomSheetStore — open', () => {
  it('open은 isVisible을 true로 하고 snapPoints/children을 세팅한다', () => {
    bottomSheet.open({ children: 'C', snapPoints: ['25%', '50%', '90%'] });

    expect(state().isVisible).toBe(true);
    expect(state().snapPoints).toEqual(['25%', '50%', '90%']);
    expect(state().children).toBe('C');
  });

  it('snapPoints 미지정 시 height를 단일 snap으로 사용한다', () => {
    bottomSheet.open({ children: 'C', height: '60%' });
    expect(state().snapPoints).toEqual(['60%']);
  });

  it('height/snapPoints 모두 없으면 기본 auto', () => {
    bottomSheet.open({ children: 'C' });
    expect(state().snapPoints).toEqual(['auto']);
  });

  it('initialSnap은 [0, len-1] 범위로 클램프된다', () => {
    bottomSheet.open({
      children: 'C',
      snapPoints: ['25%', '50%', '90%'],
      initialSnap: 99, // 범위 초과
    });
    expect(state().currentSnapIndex).toBe(2); // len-1로 클램프

    useBottomSheetStore.setState({ ...INITIAL });
    bottomSheet.open({
      children: 'C',
      snapPoints: ['25%', '50%'],
      initialSnap: -5, // 음수
    });
    expect(state().currentSnapIndex).toBe(0); // 0으로 클램프
  });
});

describe('bottomSheetStore — close + onDismiss', () => {
  it('close는 isVisible을 false로 하고 onDismiss를 호출한다', () => {
    const onDismiss = jest.fn();
    bottomSheet.open({ children: 'C', onDismiss });

    bottomSheet.close();

    expect(state().isVisible).toBe(false);
    expect(state().children).toBeNull();
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('onDismiss 없이 열고 닫아도 예외가 없다', () => {
    bottomSheet.open({ children: 'C' });
    expect(() => bottomSheet.close()).not.toThrow();
    expect(state().isVisible).toBe(false);
  });
});

describe('bottomSheetStore — snapTo 전이 + onSnapChange', () => {
  it('유효한 인덱스로 snapTo 시 인덱스 변경 + onSnapChange 호출', () => {
    const onSnapChange = jest.fn();
    bottomSheet.open({
      children: 'C',
      snapPoints: ['25%', '50%', '90%'],
      onSnapChange,
    });

    bottomSheet.snapTo(2);

    expect(state().currentSnapIndex).toBe(2);
    expect(onSnapChange).toHaveBeenCalledWith(2);
  });

  it('범위 밖 snapTo는 무시된다 (인덱스 불변 + 콜백 미호출)', () => {
    const onSnapChange = jest.fn();
    bottomSheet.open({
      children: 'C',
      snapPoints: ['25%', '50%'],
      initialSnap: 0,
      onSnapChange,
    });

    bottomSheet.snapTo(5);

    expect(state().currentSnapIndex).toBe(0);
    expect(onSnapChange).not.toHaveBeenCalled();
  });

  it('현재와 같은 인덱스로 snapTo는 콜백을 호출하지 않는다', () => {
    const onSnapChange = jest.fn();
    bottomSheet.open({
      children: 'C',
      snapPoints: ['25%', '50%'],
      initialSnap: 1,
      onSnapChange,
    });

    bottomSheet.snapTo(1);

    expect(onSnapChange).not.toHaveBeenCalled();
  });
});
