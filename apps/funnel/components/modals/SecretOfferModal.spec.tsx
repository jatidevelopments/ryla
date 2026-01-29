import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SecretOfferModal from './SecretOfferModal';
import { useStore } from '@/store/state';
import { ModalTriggers } from '@/utils/enums/modal-triggers';
import { useFormContext } from 'react-hook-form';
import { useTimer } from '@/features/funnel/hooks/useTimerCount';
import { usePostHog } from 'posthog-js/react';

vi.mock('@/store/state', () => ({
  useStore: vi.fn(),
}));

vi.mock('react-hook-form', () => ({
  useFormContext: vi.fn(),
}));

vi.mock('@/features/funnel/hooks/useTimerCount', () => ({
  useTimer: vi.fn(),
}));

vi.mock('posthog-js/react', () => ({
  usePostHog: vi.fn(),
}));

vi.mock('@/components/modals/Modal', () => ({
  default: ({ children, triggers, ...props }: any) => {
    const mockTrigger = (useStore as any).mock.results[0]?.value?.trigger;
    if (triggers.includes(mockTrigger)) {
      return <div data-testid="modal">{children}</div>;
    }
    return null;
  },
}));

describe('SecretOfferModal', () => {
  const mockSetClose = vi.fn();
  const mockSetOpen = vi.fn();
  const mockForm = {
    setValue: vi.fn(),
  };
  const mockPostHog = {
    capture: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      trigger: ModalTriggers.SECRET_OFFER,
      setClose: mockSetClose,
      setOpen: mockSetOpen,
    });
    (useFormContext as any).mockReturnValue(mockForm);
    (useTimer as any).mockReturnValue({
      progress: 50,
      formattedTime: '00:15',
      shouldShowTimer: true,
    });
    (usePostHog as any).mockReturnValue(mockPostHog);
  });

  it('should render modal when trigger matches', () => {
    render(<SecretOfferModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should set productId when modal opens', () => {
    render(<SecretOfferModal />);
    expect(mockForm.setValue).toHaveBeenCalled();
  });

  it('should call posthog and close on claim now', () => {
    render(<SecretOfferModal />);
    
    const claimButton = screen.getByText(/claim now/i);
    fireEvent.click(claimButton);
    
    expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_2_accepted');
    expect(mockSetClose).toHaveBeenCalled();
  });

  it('should call posthog and open next modal on lose chance', () => {
    render(<SecretOfferModal />);
    
    const loseButton = screen.getByText(/lose chance/i);
    fireEvent.click(loseButton);
    
    expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_2_declined');
    expect(mockSetOpen).toHaveBeenCalledWith({
      title: 'goToDiscount',
      trigger: ModalTriggers.SHOW_VIDEO_MODAL,
    });
  });
});
