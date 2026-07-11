// ============================================================================
// renderWithTheme — ThemeProvider로 감싼 RNTL render 헬퍼
// ============================================================================
//
// 이 라이브러리의 모든 컴포넌트는 styled-components ThemeProvider(AppTheme
// 주입)를 전제로 한다(useAppTheme() → useTheme()). 따라서 테스트에서 컴포넌트를
// 맨몸으로 render하면 theme이 undefined가 되어 토큰 접근이 전부 터진다.
//
// renderWithTheme은 RNTL render를 감싸 항상 ThemeProvider를 씌운다. mode
// 옵션으로 light/dark 두 테마를 모두 렌더할 수 있어 ADR-04(mode swap 100%)를
// 테스트에서 검증 가능하다.
//
// 사용:
//   const { getByRole } = renderWithTheme(<Switch value onValueChange={fn} />);
//   renderWithTheme(<Text variant="displayLg">제목</Text>, { mode: 'dark' });
// ============================================================================

import type { ReactElement, ReactNode } from 'react';
import { render } from '@testing-library/react-native';
import type { RenderOptions } from '@testing-library/react-native';
import { ThemeProvider } from 'styled-components/native';

import { lightTheme, darkTheme } from '../theme';
import type { ThemeMode } from '../theme';

export interface RenderWithThemeOptions extends RenderOptions {
  /** 렌더에 사용할 테마 모드. @default 'light' */
  mode?: ThemeMode;
}

/**
 * ThemeProvider로 감싸 컴포넌트를 렌더한다.
 *
 * @param ui   렌더할 엘리먼트
 * @param opts mode('light'|'dark') + RNTL RenderOptions
 */
export function renderWithTheme(
  ui: ReactElement,
  { mode = 'light', ...options }: RenderWithThemeOptions = {},
) {
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  function Wrapper({ children }: { children: ReactNode }) {
    return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
  }

  return {
    // 어떤 테마로 렌더됐는지 테스트에서 참조 가능하게 노출
    theme,
    ...render(ui, { wrapper: Wrapper, ...options }),
  };
}
