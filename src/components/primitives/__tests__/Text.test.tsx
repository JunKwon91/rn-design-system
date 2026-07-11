// ============================================================================
// Text UI 테스트 — typography 토큰이 실제 style로 적용되는지 검증
// ============================================================================
//
// Text는 variant → theme.typography[variant]의 fontFamily/fontSize/fontWeight를
// styled-components로 바인딩한다. 렌더된 host Text의 flatten된 style을 토큰과
// 비교해 "variant가 실제 타이포 토큰을 적용한다"를 고정한다.

import { StyleSheet } from 'react-native';
import { renderWithTheme } from '../../../test-utils';
import { typography } from '../../../theme';
import Text from '../Text';

const flattenStyleOf = (node: { props: { style?: unknown } }) =>
  StyleSheet.flatten(node.props.style) as Record<string, unknown>;

describe('Text — 타이포 토큰 적용', () => {
  it('기본 variant(bodyBase)의 fontSize/fontFamily/fontWeight를 적용한다', () => {
    const { getByText } = renderWithTheme(<Text>본문</Text>);

    const style = flattenStyleOf(getByText('본문'));
    expect(style.fontSize).toBe(typography.bodyBase.fontSize); // 16
    expect(style.fontFamily).toBe(typography.bodyBase.fontFamily); // Inter
    expect(style.fontWeight).toBe(typography.bodyBase.fontWeight); // '400'
  });

  it('variant=displayLg는 Manrope 32 / 700을 적용한다', () => {
    const { getByText } = renderWithTheme(
      <Text variant="displayLg">제목</Text>,
    );

    const style = flattenStyleOf(getByText('제목'));
    expect(style.fontSize).toBe(32);
    expect(style.fontFamily).toBe('Manrope');
    expect(style.fontWeight).toBe('700');
  });

  it('align prop이 textAlign으로 반영된다', () => {
    const { getByText } = renderWithTheme(
      <Text align="center">가운데</Text>,
    );
    expect(flattenStyleOf(getByText('가운데')).textAlign).toBe('center');
  });
});
