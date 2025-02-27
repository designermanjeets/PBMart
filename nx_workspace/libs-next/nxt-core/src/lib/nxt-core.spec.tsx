import { render } from '@testing-library/react';

import NxtCore from './nxt-core';

describe('NxtCore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtCore />);
    expect(baseElement).toBeTruthy();
  });
});
