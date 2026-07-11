// ============================================================================
// Light/Dark mode swap 테스트 — ADR-04가 주장이 아니라 사실인지 검증
// ============================================================================
//
// ADR-04: lightColors/darkColors 두 객체가 ColorsShape를 100% 만족하며, 모드
//         전환 = ThemeProvider theme 교체만으로 색이 실제로 바뀐다.
//
// 검증 방법: 동일 컴포넌트를 light/dark로 각각 렌더해 실제 적용 색이 다른지
// (그리고 각 모드에 맞는 토큰 값인지) flatten된 style로 비교한다. mock이나
// 주장이 아니라 렌더 결과의 실측이다.

import { StyleSheet } from 'react-native';
import { renderWithTheme } from '../../test-utils';
import { lightTheme, darkTheme } from '../../theme';
import Text from '../primitives/Text';

const colorOf = (node: { props: { style?: unknown } }) =>
  (StyleSheet.flatten(node.props.style) as { color?: string }).color;

describe('ADR-04 — Text 색상이 모드별로 실제로 달라진다', () => {
  it('primary 텍스트 색이 light ≠ dark 이며 각 모드 토큰과 일치한다', () => {
    const light = renderWithTheme(<Text>텍스트</Text>, { mode: 'light' });
    const lightColor = colorOf(light.getByText('텍스트'));

    const dark = renderWithTheme(<Text>텍스트</Text>, { mode: 'dark' });
    const darkColor = colorOf(dark.getByText('텍스트'));

    // 두 모드의 실제 렌더 색이 다르다
    expect(lightColor).not.toBe(darkColor);
    // 그리고 각각 해당 모드의 text.primary 토큰과 정확히 일치한다
    expect(lightColor).toBe(lightTheme.colors.text.primary);
    expect(darkColor).toBe(darkTheme.colors.text.primary);
  });

  it('accent 색(primary.action)도 모드별로 달라진다', () => {
    const light = renderWithTheme(<Text color="accent">강조</Text>, {
      mode: 'light',
    });
    const dark = renderWithTheme(<Text color="accent">강조</Text>, {
      mode: 'dark',
    });

    expect(colorOf(light.getByText('강조'))).toBe(
      lightTheme.colors.primary.action,
    );
    expect(colorOf(dark.getByText('강조'))).toBe(
      darkTheme.colors.primary.action,
    );
    expect(colorOf(light.getByText('강조'))).not.toBe(
      colorOf(dark.getByText('강조')),
    );
  });
});

describe('ADR-04 — 토큰 객체 키 동일성 (부분 override 아님)', () => {
  it('lightColors와 darkColors의 구조(키 트리)가 완전히 동일하다', () => {
    const keyTree = (obj: unknown): unknown => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        return Object.fromEntries(
          Object.keys(obj)
            .sort()
            .map((k) => [k, keyTree((obj as Record<string, unknown>)[k])]),
        );
      }
      return null; // leaf(값)은 무시하고 키 구조만 비교
    };

    expect(keyTree(lightTheme.colors)).toEqual(keyTree(darkTheme.colors));
  });
});
