import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

// Mock @radix-ui/react-avatar
vi.mock('@radix-ui/react-avatar', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="avatar-root" {...props}>{children}</div>,
  Image: ({ ...props }: any) => <img data-testid="avatar-image" {...props} />,
  Fallback: ({ children, ...props }: any) => <div data-testid="avatar-fallback" {...props}>{children}</div>,
}));

describe('Avatar', () => {
  it('should render avatar', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" />
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar-root')).toBeInTheDocument();
  });

  it('should render avatar image', () => {
    render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" />
      </Avatar>
    );
    expect(screen.getByTestId('avatar-image')).toBeInTheDocument();
    expect(screen.getByAltText('Test')).toHaveAttribute('src', '/test.jpg');
  });

  it('should render avatar fallback', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByTestId('avatar-fallback')).toBeInTheDocument();
    expect(screen.getByText('AB')).toBeInTheDocument();
  });
});
