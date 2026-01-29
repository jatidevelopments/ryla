import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ShowVideoModal from './ShowVideoModal';
import { useStore } from '@/store/state';
import { useStepperContext } from '@/components/stepper/Stepper.context';
import { ModalTriggers } from '@/utils/enums/modal-triggers';

vi.mock('@/store/state', () => ({
  useStore: vi.fn(),
}));

vi.mock('@/components/stepper/Stepper.context', () => ({
  useStepperContext: vi.fn(),
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

describe('ShowVideoModal', () => {
  const mockSetOpen = vi.fn();
  const mockSetClose = vi.fn();
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockReturnValue({
      title: '',
      setOpen: mockSetOpen,
      setClose: mockSetClose,
    });
    (useStepperContext as any).mockReturnValue({
      onChange: mockOnChange,
    });
  });

  it('should render modal when trigger matches', () => {
    (useStore as any).mockReturnValue({
      title: '',
      setOpen: mockSetOpen,
      setClose: mockSetClose,
      trigger: ModalTriggers.SHOW_VIDEO_MODAL,
    });

    render(<ShowVideoModal />);
    expect(screen.getByTestId('modal')).toBeInTheDocument();
  });

  it('should open final offer unlocked modal when title is goToDiscount', () => {
    (useStore as any).mockReturnValue({
      title: 'goToDiscount',
      setOpen: mockSetOpen,
      setClose: mockSetClose,
      trigger: ModalTriggers.SHOW_VIDEO_MODAL,
    });

    render(<ShowVideoModal />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetOpen).toHaveBeenCalledWith({
      title: '95%',
      trigger: ModalTriggers.FINAL_OFFER_UNLOCKED_MODAL,
    });
  });

  it('should open final offer modal when title is withLoseBtn', () => {
    (useStore as any).mockReturnValue({
      title: 'withLoseBtn',
      setOpen: mockSetOpen,
      setClose: mockSetClose,
      trigger: ModalTriggers.SHOW_VIDEO_MODAL,
    });

    render(<ShowVideoModal />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetOpen).toHaveBeenCalledWith({
      trigger: ModalTriggers.FINAL_OFFER_MODAL,
    });
  });

  it('should close and change step when title is empty', () => {
    (useStore as any).mockReturnValue({
      title: '',
      setOpen: mockSetOpen,
      setClose: mockSetClose,
      trigger: ModalTriggers.SHOW_VIDEO_MODAL,
    });

    render(<ShowVideoModal />);
    
    const button = screen.getByRole('button');
    fireEvent.click(button);
    
    expect(mockSetClose).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith(44);
  });
});
