import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { RegisterForm } from './register-form';

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
    <button onClick={onClick}>Google Signup</button>
  ),
}));

vi.mock('../../../components/auth/PasswordStrength', () => ({
  PasswordStrength: () => (
    <div data-testid="password-strength">Strength Meter</div>
  ),
}));

describe('RegisterForm', () => {
  const defaultProps = {
    registerData: {
      name: '',
      publicName: '',
      password: '',
      confirmPassword: '',
      acceptedTerms: false,
    },
    onRegisterChange: vi.fn(),
    onSubmit: vi.fn(),
    isLoading: false,
    onGoogleAuth: vi.fn(),
    onSwitchToLogin: vi.fn(),
  };

  it('should render all form fields', () => {
    render(<RegisterForm {...defaultProps} />);
    expect(screen.getByLabelText('Full Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Username')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
    expect(screen.getByText(/agree to the/i)).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('should handle input changes', () => {
    render(<RegisterForm {...defaultProps} />);

    fireEvent.change(screen.getByLabelText('Full Name'), {
      target: { value: 'John Doe' },
    });
    expect(defaultProps.onRegisterChange).toHaveBeenCalledWith(
      'name',
      'John Doe'
    );

    fireEvent.change(screen.getByLabelText('Username'), {
      target: { value: 'johndoe' },
    });
    expect(defaultProps.onRegisterChange).toHaveBeenCalledWith(
      'publicName',
      'johndoe'
    );
  });

  it('should show password mismatch error', () => {
    const propsWithMismatch = {
      ...defaultProps,
      registerData: {
        ...defaultProps.registerData,
        password: 'Password123!',
        confirmPassword: 'Password124!',
      },
    };

    render(<RegisterForm {...propsWithMismatch} />);
    expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
  });

  it('should show password match success', () => {
    const propsWithMatch = {
      ...defaultProps,
      registerData: {
        ...defaultProps.registerData,
        password: 'Password123!',
        confirmPassword: 'Password123!',
      },
    };

    render(<RegisterForm {...propsWithMatch} />);
    expect(screen.getByText('Passwords match')).toBeInTheDocument();
  });

  it('should handle terms acceptance', () => {
    render(<RegisterForm {...defaultProps} />);
    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);
    expect(defaultProps.onRegisterChange).toHaveBeenCalledWith(
      'acceptedTerms',
      true
    );
  });

  it('should call onSubmit when form is submitted', () => {
    render(<RegisterForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Create Account'));
    expect(defaultProps.onSubmit).toHaveBeenCalled();
  });

  it('should disable inputs when loading', () => {
    render(<RegisterForm {...defaultProps} isLoading={true} />);
    expect(screen.getByLabelText('Full Name')).toBeDisabled();
    expect(screen.getByText('Create Account')).toBeDisabled();
  });

  it('should call onSwitchToLogin when clicking sign in', () => {
    render(<RegisterForm {...defaultProps} />);
    fireEvent.click(screen.getByText('Sign in'));
    expect(defaultProps.onSwitchToLogin).toHaveBeenCalled();
  });
});
