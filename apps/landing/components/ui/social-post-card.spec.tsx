import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SocialPostCard } from './social-post-card';

// Mock framer-motion
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children }: any) => <div>{children}</div>,
  },
}));

vi.mock('next/image', () => ({
  default: ({ src, alt }: any) => <img src={src} alt={alt} />,
}));

describe('SocialPostCard', () => {
  it('should render social post card', () => {
    render(
      <SocialPostCard
        platform="instagram"
        likes="1.2K"
        image="/test.jpg"
      />
    );
    expect(screen.getByText(/1\.2K/)).toBeInTheDocument();
  });

  it('should render with different platforms', () => {
    render(
      <SocialPostCard
        platform="tiktok"
        likes="500"
        image="/test.jpg"
      />
    );
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });
});
