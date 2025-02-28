import { render } from '@testing-library/react';

import SellerLayout from './SellerLayout';

describe('SellerLayout', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<SellerLayout />);
    expect(baseElement).toBeTruthy();
  });
});
