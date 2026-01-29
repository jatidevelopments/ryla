import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Spotlight } from './spotlight';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

describe('Spotlight', () => {
  it('should render component', () => {
    const { container } = render(
      <Spotlight>
        <div>Content</div>
      </Spotlight>
    );
    expect(container.firstChild).toBeInTheDocument();
  });
});
