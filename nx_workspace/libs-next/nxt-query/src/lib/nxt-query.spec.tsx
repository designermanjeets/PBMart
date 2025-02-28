import { render } from '@testing-library/react';

import NxtQuery from './nxt-query';

describe('NxtQuery', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtQuery />);
    expect(baseElement).toBeTruthy();
  });
});
