import { render } from '@testing-library/react';

import NxtApi from './nxt-api';

describe('NxtApi', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<NxtApi />);
    expect(baseElement).toBeTruthy();
  });
});
