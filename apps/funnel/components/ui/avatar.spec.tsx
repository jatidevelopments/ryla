import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Avatar, AvatarImage, AvatarFallback } from './avatar';

describe('Avatar', () => {
  it('should render avatar element', () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Avatar className="custom-class" />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveClass('custom-class');
  });

  it('should apply size variant', () => {
    const { container } = render(<Avatar size="lg" />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveClass('size-[42px]');
  });

  it('should render AvatarImage', () => {
    const { container } = render(
      <Avatar>
        <AvatarImage src="/test.jpg" alt="Test" />
      </Avatar>
    );
    const image = container.querySelector('[data-slot="avatar-image"]');
    expect(image).toBeInTheDocument();
  });

  it('should render AvatarFallback', () => {
    render(
      <Avatar>
        <AvatarFallback>AB</AvatarFallback>
      </Avatar>
    );
    expect(screen.getByText('AB')).toBeInTheDocument();
  });

  it('should have data-slot attribute', () => {
    const { container } = render(<Avatar />);
    const avatar = container.querySelector('[data-slot="avatar"]');
    expect(avatar).toHaveAttribute('data-slot', 'avatar');
  });
});
