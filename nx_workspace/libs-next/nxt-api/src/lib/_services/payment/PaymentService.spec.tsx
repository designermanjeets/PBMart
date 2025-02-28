import { render } from '@testing-library/react';

import PaymentService from './PaymentService';

describe('PaymentService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<PaymentService />);
    expect(baseElement).toBeTruthy();
  });
});
