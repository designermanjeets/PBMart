import { render } from '@testing-library/react';

import NxtLayouts from './nxt-layouts';

describe('NxtLayouts', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtLayouts />);
    expect(baseElement).toBeTruthy();
  });
});
