import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Modal from './Modal';
import { useStore } from '@/store/state';
import { ModalTriggers } from '@/utils/enums/modal-triggers';

vi.mock('@/store/state', () => ({
  useStore: vi.fn(),
}));

vi.mock('@/components/ui/dialog', () => ({
  Dialog: ({ children, open, onOpenChange }: any) => (
    <div data-testid="dialog" data-open={open}>
      {open && children}
      <button onClick={() => onOpenChange(false)}>Close</button>
    </div>
  ),
  DialogContent: ({ children, className, ...props }: any) => (
    <div data-testid="dialog-content" className={className} {...props}>
      {children}
    </div>
  ),
}));

describe('Modal', () => {
  const mockSetOpenChange = vi.fn();
  const mockReset = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useStore as any).mockImplementation((selector: any) => {
      const state = {
        modal: {
          open: true,
          trigger: ModalTriggers.FINAL_OFFER_MODAL,
          setOpenChange: mockSetOpenChange,
          reset: mockReset,
        },
      };
      return selector(state);
    });
  });

  it('should render when trigger matches', () => {
    render(
      <Modal triggers={[ModalTriggers.FINAL_OFFER_MODAL]}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('should not render when trigger does not match', () => {
    (useStore as any).mockImplementation((selector: any) => {
      const state = {
        modal: {
          open: true,
          trigger: ModalTriggers.SPECIAL_OFFER_MODAL,
          setOpenChange: mockSetOpenChange,
          reset: mockReset,
        },
      };
      return selector(state);
    });

    render(
      <Modal triggers={[ModalTriggers.FINAL_OFFER_MODAL]}>
        <div>Modal Content</div>
      </Modal>
    );

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('should call onClose when modal closes', () => {
    const onClose = vi.fn();
    render(
      <Modal triggers={[ModalTriggers.FINAL_OFFER_MODAL]} onClose={onClose}>
        <div>Content</div>
      </Modal>
    );

    const closeButton = screen.getByText('Close');
    closeButton.click();

    expect(mockSetOpenChange).toHaveBeenCalledWith(false);
    expect(onClose).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Modal triggers={[ModalTriggers.FINAL_OFFER_MODAL]} className="custom-class">
        <div>Content</div>
      </Modal>
    );

    const content = container.querySelector('[data-testid="dialog-content"]');
    expect(content).toHaveClass('custom-class');
  });

  it('should reset state when modal closes', () => {
    (useStore as any).mockImplementation((selector: any) => {
      const state = {
        modal: {
          open: false,
          trigger: ModalTriggers.FINAL_OFFER_MODAL,
          setOpenChange: mockSetOpenChange,
          reset: mockReset,
        },
      };
      return selector(state);
    });

    render(
      <Modal triggers={[ModalTriggers.FINAL_OFFER_MODAL]}>
        <div>Content</div>
      </Modal>
    );

    expect(mockReset).toHaveBeenCalled();
  });
});
