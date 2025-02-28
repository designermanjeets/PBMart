import { render } from '@testing-library/react';

import NxtAuth from './nxt-auth';

describe('NxtAuth', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtAuth />);
    expect(baseElement).toBeTruthy();
  });
});
