import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import TermsPage from './page';

describe('TermsPage', () => {
  it('should render terms page', () => {
    const { container } = render(<TermsPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
