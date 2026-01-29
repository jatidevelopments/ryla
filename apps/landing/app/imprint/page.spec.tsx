import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ImprintPage from './page';

describe('ImprintPage', () => {
  it('should render imprint page', () => {
    const { container } = render(<ImprintPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
