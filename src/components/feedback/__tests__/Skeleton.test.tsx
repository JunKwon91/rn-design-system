// ============================================================================
// Skeleton UI 테스트 — 로딩 placeholder 렌더 (접근성 라벨 기반)
// ============================================================================
//
// Skeleton은 각 shape에 accessibilityLabel="Loading"을 부여한다. testID 없이
// 이 라벨로 렌더 개수를 검증한다. (Reanimated shimmer는 jest에서 mock)

import { renderWithTheme } from '../../../test-utils';
import Skeleton from '../Skeleton';

describe('Skeleton — shape별 렌더', () => {
  it('type=rect는 Loading 라벨 요소 1개를 렌더한다', () => {
    const { getAllByLabelText } = renderWithTheme(
      <Skeleton type="rect" width={200} height={16} />,
    );
    expect(getAllByLabelText('Loading')).toHaveLength(1);
  });

  it('type=circle도 Loading 라벨 요소 1개를 렌더한다', () => {
    const { getAllByLabelText } = renderWithTheme(
      <Skeleton type="circle" size={40} />,
    );
    expect(getAllByLabelText('Loading')).toHaveLength(1);
  });

  it('type=text는 lines 수만큼 Loading 라벨 요소를 렌더한다', () => {
    const { getAllByLabelText } = renderWithTheme(
      <Skeleton type="text" lines={3} />,
    );
    expect(getAllByLabelText('Loading')).toHaveLength(3);
  });

  it('type=text의 기본 lines는 3이다', () => {
    const { getAllByLabelText } = renderWithTheme(<Skeleton type="text" />);
    expect(getAllByLabelText('Loading')).toHaveLength(3);
  });
});
