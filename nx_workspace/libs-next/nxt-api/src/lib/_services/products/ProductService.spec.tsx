import { render } from '@testing-library/react';

import ProductService from './ProductService';

describe('ProductService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<ProductService />);
    expect(baseElement).toBeTruthy();
  });
});
