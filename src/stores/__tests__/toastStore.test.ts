// ============================================================================
// toastStore 유닛 테스트 — ADR-11 큐잉 명세를 테스트로 고정
// ============================================================================
//
// ADR-11: 한 번에 1개만 화면 표시(displayed), 나머지는 큐(최대 3개) 대기.
//         큐 초과 시 가장 오래된 항목 제거(FIFO overflow).
//
// Zustand 스토어는 모듈 싱글턴이라 테스트 간 상태가 누수된다. 각 테스트 전에
// clearAll로 초기화한다.

import { useToastStore, toast } from '../toastStore';

const reset = () => useToastStore.getState().clearAll();
const state = () => useToastStore.getState();

beforeEach(reset);

describe('toastStore — 표시/큐 승격 (ADR-11)', () => {
  it('첫 show는 곧바로 displayed가 된다 (큐 비어 있음)', () => {
    state().show({ type: 'info', title: 'A' });

    expect(state().displayed?.title).toBe('A');
    expect(state().queue).toHaveLength(0);
  });

  it('displayed가 있을 때 이후 show는 큐에 쌓인다', () => {
    state().show({ type: 'info', title: 'A' }); // displayed
    state().show({ type: 'info', title: 'B' }); // queue[0]
    state().show({ type: 'info', title: 'C' }); // queue[1]

    expect(state().displayed?.title).toBe('A');
    expect(state().queue.map((t) => t.title)).toEqual(['B', 'C']);
  });

  it('show는 각 토스트의 고유 id를 반환한다', () => {
    const id1 = state().show({ type: 'info', title: 'A' });
    const id2 = state().show({ type: 'info', title: 'B' });

    expect(id1).toEqual(expect.any(String));
    expect(id2).not.toBe(id1);
  });
});

describe('toastStore — 큐 상한 3 + FIFO overflow (ADR-11)', () => {
  it('displayed 1 + 큐 3까지는 아무것도 버려지지 않는다', () => {
    ['A', 'B', 'C', 'D'].forEach((title) =>
      state().show({ type: 'info', title }),
    );

    // A=displayed, [B,C,D]=queue(정확히 상한 3)
    expect(state().displayed?.title).toBe('A');
    expect(state().queue.map((t) => t.title)).toEqual(['B', 'C', 'D']);
  });

  it('큐가 3으로 찬 뒤 추가 show는 가장 오래된 큐 항목을 밀어낸다 (FIFO)', () => {
    ['A', 'B', 'C', 'D', 'E'].forEach((title) =>
      state().show({ type: 'info', title }),
    );

    // A=displayed 유지, 큐는 [B,C,D]에서 B가 밀려 [C,D,E]
    expect(state().displayed?.title).toBe('A');
    expect(state().queue.map((t) => t.title)).toEqual(['C', 'D', 'E']);
    expect(state().queue).toHaveLength(3);
  });
});

describe('toastStore — dismiss 승격 (ADR-11)', () => {
  it('displayed dismiss 시 큐의 다음 항목이 승격된다', () => {
    state().show({ type: 'info', title: 'A' });
    state().show({ type: 'info', title: 'B' });
    state().show({ type: 'info', title: 'C' });

    state().dismiss();

    expect(state().displayed?.title).toBe('B');
    expect(state().queue.map((t) => t.title)).toEqual(['C']);
  });

  it('큐가 비었을 때 dismiss하면 displayed는 null이 된다', () => {
    state().show({ type: 'info', title: 'A' });

    state().dismiss();

    expect(state().displayed).toBeNull();
    expect(state().queue).toHaveLength(0);
  });

  it('clearAll은 displayed와 큐를 모두 비운다', () => {
    ['A', 'B', 'C'].forEach((title) =>
      state().show({ type: 'info', title }),
    );

    state().clearAll();

    expect(state().displayed).toBeNull();
    expect(state().queue).toHaveLength(0);
  });
});

describe('toast 편의 API — React 외부 호출', () => {
  it('success/error/info가 각 type으로 show를 위임한다', () => {
    toast.success('저장 완료', '설명');
    expect(state().displayed).toMatchObject({
      type: 'success',
      title: '저장 완료',
      description: '설명',
    });

    toast.error('실패');
    toast.info('안내');
    // success=displayed, [error, info]=queue
    expect(state().queue.map((t) => t.type)).toEqual(['error', 'info']);
  });
});
