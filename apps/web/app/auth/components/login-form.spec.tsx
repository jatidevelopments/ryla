import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LoginForm } from './login-form';

// Mock UI components
vi.mock('@ryla/ui', () => ({
  RylaInput: (props: any) => <input {...props} />,
  RylaCheckbox: ({ children, checked, onChange, disabled }: any) => (
    <label>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        disabled={disabled}
      />
      {children}
    </label>
  ),
}));

// Mock child components
vi.mock('./primary-button', () => ({
  PrimaryButton: ({ children, ...props }: any) => (
    <button {...props}>{children}</button>
  ),
}));

vi.mock('./google-button', () => ({
  GoogleButton: ({ onClick }: any) => (
    <button onClick={onClick}>Google Login</button>
  ),
}));

describe('LoginForm', () => {
  const defaultProps = {
    loginData: { password: '', rememberMe: false },
    onLoginChange: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
    onGoogleAuth: vi.fn(),
    onSwitchToRegister: vi.fn(),
  };

  it('should render form fields', () => {
    render(<LoginForm {...defaultProps} />);
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByText('Remember me')).toBeInTheDocument();
    expect(screen.getByText('Sign In')).toBeInTheDocument();
  });

  it('should handle password input', () => {
    render(<LoginForm {...defaultProps} />);
    const passwordInput = screen.getByLabelText('Password');
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    expect(defaultProps.onLoginChange).toHaveBeenCalledWith(
      'password',
      'password123'
    );
  });

  it('should handle remember me toggle', () => {
    render(<LoginForm {...defaultProps} />);
    const checkbox = screen.getByLabelText('Remember me');
    fireEvent.click(checkbox);
    expect(defaultProps.onLoginChange).toHaveBeenCalledWith('rememberMe', true);
  });

  it('should call onSubmit when form is submitted', () => {
    render(<LoginForm {...defaultProps} />);
    const form = screen
      .getByRole('button', { name: 'Sign In' })
      .closest('form');
    // fireEvent.submit(form!); // Prefer button click for realism but form submit is standard
    // Since PrimaryButton is a button type="submit", clicking it submits the form
    fireEvent.click(screen.getByText('Sign In'));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('should disable inputs when loading', () => {
    render(<LoginForm {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText('Password')).toBeDisabled();
    expect(screen.getByText('Sign In')).toBeDisabled();
  });

  it('should call onSwitchToRegister when clicking sign up', () => {
    render(<LoginForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Sign up'));
    expect(defaultProps.onSwitchToRegister).toHaveBeenCalled();
  });
});
