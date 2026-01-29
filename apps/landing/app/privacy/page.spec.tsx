import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import PrivacyPage from './page';

describe('PrivacyPage', () => {
  it('should render privacy page', () => {
    const { container } = render(<PrivacyPage />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
