import { render } from '@testing-library/react';

import CustomerService from './CustomerService';

describe('CustomerService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<CustomerService />);
    expect(baseElement).toBeTruthy();
  });
});
