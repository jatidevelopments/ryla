import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Meteors } from './meteors';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

describe('Meteors', () => {
  it('should render component', () => {
    const { container } = render(<Meteors />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
