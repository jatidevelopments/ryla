import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
  InputOTPSeparator,
} from './input-otp';

vi.mock('input-otp', () => ({
  OTPInput: ({ children, ...props }: any) => (
    <div data-testid="input-otp" {...props}>{children}</div>
  ),
  OTPInputContext: {
    Provider: ({ children }: any) => <>{children}</>,
  },
}));

describe('InputOTP', () => {
  it('should render InputOTP', () => {
    render(<InputOTP />);
    expect(screen.getByTestId('input-otp')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<InputOTP className="custom-class" />);
    const input = container.querySelector('[data-slot="input-otp"]');
    expect(input).toHaveClass('custom-class');
  });

  it('should apply containerClassName', () => {
    const { container } = render(
      <InputOTP containerClassName="container-class" />
    );
    const input = container.querySelector('[data-slot="input-otp"]');
    expect(input).toHaveClass('container-class');
  });

  it('should render InputOTPGroup', () => {
    const { container } = render(
      <InputOTPGroup>
        <InputOTPSlot index={0} />
      </InputOTPGroup>
    );
    const group = container.querySelector('[data-slot="input-otp-group"]');
    expect(group).toBeInTheDocument();
  });

  it('should render InputOTPSlot', () => {
    const { container } = render(<InputOTPSlot index={0} />);
    const slot = container.querySelector('[data-slot="input-otp-slot"]');
    expect(slot).toBeInTheDocument();
  });

  it('should render InputOTPSeparator', () => {
    const { container } = render(<InputOTPSeparator />);
    const separator = container.querySelector('[data-slot="input-otp-separator"]');
    expect(separator).toBeInTheDocument();
    expect(separator).toHaveAttribute('role', 'separator');
  });
});
