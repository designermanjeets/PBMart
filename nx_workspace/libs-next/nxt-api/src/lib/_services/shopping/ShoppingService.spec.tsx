import { render } from '@testing-library/react';

import ShoppingService from './ShoppingService';

describe('ShoppingService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ShoppingService />);
    expect(baseElement).toBeTruthy();
  });
});
