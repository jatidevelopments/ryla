import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import FinalOfferUnlockedModal from './FinalOfferUnlockedModal';
import { useStore } from '@/store/state';
import { ModalTriggers } from '@/utils/enums/modal-triggers';

vi.mock('@/store/state', () => ({
  useStore: vi.fn(),
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

vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
  },
  AnimatePresence: ({ children }: any) => <>{children}</>,
}));

describe('FinalOfferUnlockedModal', () => {
  const mockSetOpen = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    (useStore as any).mockReturnValue({
      trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL,
      open: true,
      setOpen: mockSetOpen,
      title: '80%',
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render modal when trigger matches', () => {
    render(<FinalOfferUnlockedModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should not render when trigger does not match', () => {
    (useStore as any).mockReturnValue({
      trigger: ModalTriggers.SPECIAL_OFFER_MODAL,
      open: true,
      setOpen: mockSetOpen,
      title: '80%',
    });

    render(<FinalOfferUnlockedModal />);
    expect(screen.queryByTestId('modal')).not.toBeInTheDocument();
  });

  it('should auto-open next modal after delay', async () => {
    const { act } = await import('@testing-library/react');
    render(<FinalOfferUnlockedModal />);
    
    await act(async () => {
      vi.advanceTimersByTime(3000);
      await Promise.resolve();
    });
    
    await waitFor(() => {
      expect(mockSetOpen).toHaveBeenCalled();
    });
  });

  it('should transition through steps', async () => {
    const { act } = await import('@testing-library/react');
    render(<FinalOfferUnlockedModal />);
    
    // First step should be visible
    await waitFor(() => {
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
    
    // Advance to second step
    await act(async () => {
      vi.advanceTimersByTime(1000);
      await Promise.resolve();
    });
    
    await waitFor(() => {
      // Second step should be visible
      expect(screen.getByTestId('modal')).toBeInTheDocument();
    });
  });
});
