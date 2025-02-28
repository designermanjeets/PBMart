import { render } from '@testing-library/react';

import ProductsService from './ProductsService';

describe('ProductsService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductsService />);
    expect(baseElement).toBeTruthy();
  });
});
