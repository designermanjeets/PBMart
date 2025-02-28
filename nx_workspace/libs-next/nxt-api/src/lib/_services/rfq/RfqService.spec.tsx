import { render } from '@testing-library/react';

import RfqService from './RfqService';

describe('RfqService', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RfqService />);
    expect(baseElement).toBeTruthy();
  });
});
