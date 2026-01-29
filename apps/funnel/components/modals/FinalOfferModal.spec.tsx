import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import FinalOfferModal from './FinalOfferModal';
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

// Create a shared mock state that both useStore and Modal can access
const mockStoreState = {
  modal: {
    trigger: ModalTriggers.FINAL_OFFER_MODAL,
    setClose: vi.fn(),
    setOpen: vi.fn(),
  },
};

vi.mock('@/components/modals/Modal', () => ({
  default: ({ children, triggers, ...props }: any) => {
    // Check if the trigger matches
    if (triggers.includes(mockStoreState.modal.trigger)) {
      return <div data-testid="modal">{children}</div>;
    }
    return null;
  },
}));

describe('FinalOfferModal', () => {
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
    // Update the shared mock state
    mockStoreState.modal.trigger = ModalTriggers.FINAL_OFFER_MODAL;
    mockStoreState.modal.setClose = mockSetClose;
    mockStoreState.modal.setOpen = mockSetOpen;
    
    // Mock useStore to return a selector function result
    // The component calls: useStore((state) => state.modal.setClose)
    (useStore as any).mockImplementation((selector: any) => {
      return selector ? selector(mockStoreState) : mockStoreState.modal;
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
    render(<FinalOfferModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should set productId when modal opens', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<FinalOfferModal />);
    // Wait for useEffect to run and set productId
    // productId is a number (from subscriptions array)
    await waitFor(() => {
      expect(mockForm.setValue).toHaveBeenCalledWith('productId', expect.any(Number));
    }, { timeout: 2000 });
  });

  it('should call posthog and close on claim now', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<FinalOfferModal />);
    
    const claimButton = screen.getByText(/claim now/i);
    fireEvent.click(claimButton);
    
    await waitFor(() => {
      expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_3_accepted');
      expect(mockSetClose).toHaveBeenCalled();
    });
  });

  it('should call posthog and open next modal on lose chance', async () => {
    const { waitFor } = await import('@testing-library/react');
    render(<FinalOfferModal />);
    
    // The button text is "Lose the chance forever"
    const loseButton = screen.getByText(/lose the chance forever/i);
    fireEvent.click(loseButton);
    
    await waitFor(() => {
      expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_3_declined');
      expect(mockSetOpen).toHaveBeenCalledWith({
        title: '',
        trigger: ModalTriggers.SHOW_VIDEO_MODAL,
      });
    }, { timeout: 2000 });
  });
});
