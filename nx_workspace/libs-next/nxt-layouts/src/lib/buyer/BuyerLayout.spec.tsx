import { render } from '@testing-library/react';

import BuyerLayout from './BuyerLayout';

describe('BuyerLayout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<BuyerLayout />);
    expect(baseElement).toBeTruthy();
  });
});
