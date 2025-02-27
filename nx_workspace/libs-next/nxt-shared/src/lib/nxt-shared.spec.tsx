import { render } from '@testing-library/react';

import NxtShared from './nxt-shared';

describe('NxtShared', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtShared />);
    expect(baseElement).toBeTruthy();
  });
});
