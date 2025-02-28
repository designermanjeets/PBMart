import { render } from '@testing-library/react';

import RegisterForm from './RegisterForm';

describe('RegisterForm', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<RegisterForm />);
    expect(baseElement).toBeTruthy();
  });
});
