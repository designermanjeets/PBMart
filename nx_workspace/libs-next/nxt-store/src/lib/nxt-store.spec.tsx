import { render } from '@testing-library/react';

import NxtStore from './nxt-store';

describe('NxtStore', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtStore />);
    expect(baseElement).toBeTruthy();
  });
});
