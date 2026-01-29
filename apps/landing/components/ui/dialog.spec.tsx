import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Dialog, DialogTrigger, DialogContent, DialogTitle, DialogDescription } from './dialog';

// Mock @radix-ui/react-dialog
vi.mock('@radix-ui/react-dialog', () => ({
  Root: ({ children, ...props }: any) => <div data-testid="dialog-root" {...props}>{children}</div>,
  Trigger: ({ children, ...props }: any) => <button data-testid="dialog-trigger" {...props}>{children}</button>,
  Portal: ({ children }: any) => <div data-testid="dialog-portal">{children}</div>,
  Overlay: ({ children, ...props }: any) => <div data-testid="dialog-overlay" {...props}>{children}</div>,
  Close: ({ children, ...props }: any) => <button data-testid="dialog-close" {...props}>{children}</button>,
  Content: ({ children, ...props }: any) => <div data-testid="dialog-content" {...props}>{children}</div>,
  Title: ({ children, ...props }: any) => <h2 data-testid="dialog-title" {...props}>{children}</h2>,
  Description: ({ children, ...props }: any) => <p data-testid="dialog-description" {...props}>{children}</p>,
}));

vi.mock('lucide-react', () => ({
  XIcon: () => <div data-testid="x-icon" />,
}));

describe('Dialog', () => {
  it('should render dialog', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-root')).toBeInTheDocument();
  });

  it('should render trigger', () => {
    render(
      <Dialog>
        <DialogTrigger>Open</DialogTrigger>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-trigger')).toBeInTheDocument();
    expect(screen.getByText('Open')).toBeInTheDocument();
  });

  it('should render content', () => {
    render(
      <Dialog open>
        <DialogContent>
          <DialogTitle>Title</DialogTitle>
          <DialogDescription>Description</DialogDescription>
        </DialogContent>
      </Dialog>
    );
    expect(screen.getByTestId('dialog-content')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
    expect(screen.getByText('Description')).toBeInTheDocument();
  });
});
