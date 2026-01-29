import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SpecialOfferModal from './SpecialOfferModal';
import { useStore } from '@/store/state';
import { ModalTriggers } from '@/utils/enums/modal-triggers';
import { useTimer } from '@/features/funnel/hooks/useTimerCount';
import { usePostHog } from 'posthog-js/react';

vi.mock('@/store/state', () => ({
  useStore: vi.fn(),
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

describe('SpecialOfferModal', () => {
  const mockSetClose = vi.fn();
  const mockSetOpen = vi.fn();
  const mockSetIsSpecialOfferOpened = vi.fn();
  const mockPostHog = {
    capture: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useStore as any).mockReturnValue({
      trigger: ModalTriggers.SPECIAL_OFFER_MODAL,
      setClose: mockSetClose,
      setOpen: mockSetOpen,
      offer: {
        setIsSpecialOfferOpened: mockSetIsSpecialOfferOpened,
      },
    });
    (useTimer as any).mockReturnValue({
      progress: 50,
      shouldShowTimer: true,
    });
    (usePostHog as any).mockReturnValue(mockPostHog);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render modal when trigger matches', () => {
    render(<SpecialOfferModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should call posthog and open next modal on open special offer', () => {
    render(<SpecialOfferModal />);
    
    const openButton = screen.getByText(/open special offer/i);
    fireEvent.click(openButton);
    
    expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_1_declined');
    expect(mockSetIsSpecialOfferOpened).toHaveBeenCalledWith(true);
    expect(mockSetOpen).toHaveBeenCalledWith({
      title: '80%',
      trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL,
    });
  });

  it('should call posthog and close on claim now', () => {
    render(<SpecialOfferModal />);
    
    const claimButton = screen.getByText(/claim now/i);
    fireEvent.click(claimButton);
    
    expect(mockPostHog.capture).toHaveBeenCalledWith('exit_offer_1_accepted');
    expect(mockSetClose).toHaveBeenCalled();
  });
});
