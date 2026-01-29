import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { TemplatesGallery } from './templates-gallery';

// Mock dependencies
vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: any) => <div>{children}</div>,
  CardContent: ({ children }: any) => <div>{children}</div>,
}));

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

describe('TemplatesGallery', () => {
  it('should render component', () => {
    const { container } = render(<TemplatesGallery />);
    expect(container.firstChild).toBeInTheDocument();
  });
});
