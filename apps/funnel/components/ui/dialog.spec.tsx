import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from './dialog';

vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dialog-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="dialog-trigger" {...props}>{children}</button>,
  Portal: ({ children, ...props }: any) => <div data-testid="dialog-portal" {...props}>{children}</div>,
  Overlay: ({ ...props }: any) => <div data-testid="dialog-overlay" {...props} />,
  Content: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 data-testid="dialog-title" {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p data-testid="dialog-description" {...props}>{children}</p>,
  Close: ({ children, ...props }: any) => <button data-testid="dialog-close" {...props}>{children}</button>,
}));

vi.mock('@radix-ui/react-visually-hidden', () => ({
  VisuallyHidden: ({ children }: any) => <div data-testid="visually-hidden">{children}</div>,
}));

describe('Dialog', () => {
  it('should render Dialog root', () => {
    render(<Dialog open={true} />);
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
  });

  it('should render DialogTrigger', () => {
    render(<DialogTrigger>Open</DialogTrigger>);
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render DialogContent with title', () => {
    render(
      <Dialog open={true}>
        <DialogContent title="Test Dialog">
          <div>Content</div>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Content')).toBeInTheDocument();
  });

  it('should hide title visually when hideTitleVisually is true', () => {
    render(
      <Dialog open={true}>
        <DialogContent title="Test Dialog" hideTitleVisually={true}>
          Content
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('visually-hidden')).toBeInTheDocument();
  });

  it('should show title when hideTitleVisually is false', () => {
    render(
      <Dialog open={true}>
        <DialogContent title="Test Dialog" hideTitleVisually={false}>
          Content
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Test Dialog')).toBeInTheDocument();
  });

  it('should show close button by default', () => {
    render(
      <Dialog open={true}>
        <DialogContent title="Test">
          Content
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
  });

  it('should hide close button when showCloseButton is false', () => {
    render(
      <Dialog open={true}>
        <DialogContent title="Test" showCloseButton={false}>
          Content
        </DialogContent>
      </Dialog>
    );
    expect(screen.queryByTestId('dialog-close')).not.toBeInTheDocument();
  });

  it('should render DialogHeader', () => {
    const { container } = render(
      <DialogHeader>
        <DialogTitle>Title</DialogTitle>
      </DialogHeader>
    );
    const header = container.querySelector('[data-slot="dialog-header"]');
    expect(header).toBeInTheDocument();
  });

  it('should render DialogFooter', () => {
    const { container } = render(
      <DialogFooter>
        <button>Cancel</button>
      </DialogFooter>
    );
    const footer = container.querySelector('[data-slot="dialog-footer"]');
    expect(footer).toBeInTheDocument();
  });

  it('should render DialogTitle', () => {
    render(<DialogTitle>Dialog Title</DialogTitle>);
    expect(screen.getByTestId('dialog-title')).toBeInTheDocument();
    expect(screen.getByText('Dialog Title')).toBeInTheDocument();
  });

  it('should render DialogDescription', () => {
    render(<DialogDescription>Dialog description</DialogDescription>);
    expect(screen.getByTestId('dialog-description')).toBeInTheDocument();
    expect(screen.getByText('Dialog description')).toBeInTheDocument();
  });

  it('should render DialogClose', () => {
    render(<DialogClose>Close</DialogClose>);
    expect(screen.getByTestId('dialog-close')).toBeInTheDocument();
  });
});
