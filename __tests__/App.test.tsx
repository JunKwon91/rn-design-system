/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../example/App';

test('renders correctly', async () => {
  let renderer!: ReactTestRenderer.ReactTestRenderer;
  await ReactTestRenderer.act(() => {
    renderer = ReactTestRenderer.create(<App />);
  });

  // 렌더 후 언마운트해 마운트된 앱(Reanimated 애니메이션 등)이 남긴 타이머를
  // 정리한다. 언마운트가 없으면 jest 멀티워커 종료 시 "worker failed to exit
  // gracefully"(active timers) 경고가 남는다.
  await ReactTestRenderer.act(() => {
    renderer.unmount();
  });
});
