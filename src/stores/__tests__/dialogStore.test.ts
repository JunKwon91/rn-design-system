// ============================================================================
// dialogStore 유닛 테스트 — ADR-12 Promise 결과 반환 명세를 고정
// ============================================================================
//
// ADR-12: dialog.confirm() → Promise<boolean>, dialog.prompt() →
//         Promise<string | null>, dialog.info() → Promise<void>.
//         resolver Map에 id별 resolve를 보관하다 dismiss(id, value)로 호출.
//
// 표시 중 dialog의 id는 store의 displayed.id로 읽어 dismiss에 넘긴다.

import { useDialogStore, dialog } from '../dialogStore';

const state = () => useDialogStore.getState();
const currentId = () => {
  const id = state().displayed?.id;
  if (!id) throw new Error('표시 중인 dialog가 없습니다');
  return id;
};

beforeEach(() => state().clearAll());

describe('dialogStore — Promise 결과 반환 (ADR-12)', () => {
  it('confirm은 dismiss(id, true) 시 true로 resolve된다', async () => {
    const p = dialog.confirm({ title: '삭제하시겠습니까?' });
    state().dismiss(currentId(), true);
    await expect(p).resolves.toBe(true);
  });

  it('confirm은 dismiss(id, false)(취소) 시 false로 resolve된다', async () => {
    const p = dialog.confirm({ title: '삭제하시겠습니까?' });
    state().dismiss(currentId(), false);
    await expect(p).resolves.toBe(false);
  });

  it('prompt는 입력값 문자열로 resolve된다', async () => {
    const p = dialog.prompt({ title: '회차 입력' });
    state().dismiss(currentId(), '1100');
    await expect(p).resolves.toBe('1100');
  });

  it('prompt는 취소 시 null로 resolve된다', async () => {
    const p = dialog.prompt({ title: '회차 입력' });
    state().dismiss(currentId(), null);
    await expect(p).resolves.toBeNull();
  });

  it('info는 확인 시 undefined(void)로 resolve된다', async () => {
    const p = dialog.info({ title: '네트워크 오류' });
    state().dismiss(currentId(), undefined);
    await expect(p).resolves.toBeUndefined();
  });
});

describe('dialogStore — 큐잉 + 승격 (중첩 호출)', () => {
  it('표시 중일 때 두 번째 confirm은 큐에서 대기하다 승격된다', async () => {
    const first = dialog.confirm({ title: '첫 번째' });
    dialog.confirm({ title: '두 번째' });

    // 첫 번째가 displayed, 두 번째는 큐
    expect(state().displayed?.title).toBe('첫 번째');
    expect(state().queue.map((d) => d.title)).toEqual(['두 번째']);

    // 첫 번째 dismiss → 두 번째가 displayed로 승격
    state().dismiss(currentId(), true);
    await expect(first).resolves.toBe(true);
    expect(state().displayed?.title).toBe('두 번째');
    expect(state().queue).toHaveLength(0);
  });
});

describe('dialogStore — 미해결 Promise가 매달리지 않음', () => {
  it('clearAll은 대기 중 confirm을 fallback(false)으로 resolve한다', async () => {
    const p = dialog.confirm({ title: '삭제' });
    state().clearAll();
    await expect(p).resolves.toBe(false); // confirm fallback
  });

  it('clearAll은 대기 중 prompt를 fallback(null)으로 resolve한다', async () => {
    const p = dialog.prompt({ title: '입력' });
    state().clearAll();
    await expect(p).resolves.toBeNull(); // prompt fallback
  });

  it('큐 상한(3) 초과로 밀려난 dialog는 fallback으로 즉시 resolve된다', async () => {
    // displayed 1 + 큐 3까지 채운 뒤(총 4), 5번째 push 시 가장 오래된 큐(2번째)
    // 항목이 밀려나며 fallback resolve 되어야 한다.
    dialog.confirm({ title: 'displayed' });
    const willBeEvicted = dialog.confirm({ title: '밀려날 항목' }); // queue[0]
    dialog.confirm({ title: 'q2' });
    dialog.confirm({ title: 'q3' });
    dialog.confirm({ title: 'q4' }); // 큐 초과 → queue[0] eviction

    await expect(willBeEvicted).resolves.toBe(false);
    expect(state().queue.map((d) => d.title)).toEqual(['q2', 'q3', 'q4']);
  });
});
