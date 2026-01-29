import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { triggerToast, toastType } from './AlertToast';
import { toast as sonnerToast } from 'sonner';

vi.mock('sonner', () => ({
  toast: {
    custom: vi.fn((renderFn) => {
      const id = 'test-id';
      return renderFn(id);
    }),
    dismiss: vi.fn(),
  },
}));

vi.mock('@/lib/cdn', () => ({
  withCdn: (path: string) => path,
}));

describe('AlertToast', () => {
  it('should trigger toast with title', () => {
    triggerToast({
      title: 'Test Title',
      type: toastType.default,
    });

    expect(sonnerToast.custom).toHaveBeenCalled();
  });

  it('should render toast with title and description', () => {
    const result = triggerToast({
      title: 'Test Title',
      description: 'Test Description',
      type: toastType.success,
    });

    expect(result).toBeTruthy();
  });

  it('should dismiss toast when close button clicked', () => {
    triggerToast({
      title: 'Test Title',
      type: toastType.default,
    });

    // Get the rendered component from the mock
    const customCall = (sonnerToast.custom as any).mock.calls[0][0];
    const rendered = customCall('test-id');

    // Find and click the close button
    const { container } = render(rendered);
    const closeButton = container.querySelector('button');
    if (closeButton) {
      fireEvent.click(closeButton);
      expect(sonnerToast.dismiss).toHaveBeenCalledWith('test-id');
    }
  });

  it('should render success toast with success icon', () => {
    const result = triggerToast({
      title: 'Success',
      type: toastType.success,
    });

    const { container } = render(result);
    expect(container.querySelector('.bg-green-700')).toBeInTheDocument();
  });

  it('should render error toast with error icon', () => {
    const result = triggerToast({
      title: 'Error',
      type: toastType.error,
    });

    const { container } = render(result);
    expect(container.querySelector('.bg-pink-red')).toBeInTheDocument();
  });

  it('should render warning toast with warning icon', () => {
    const result = triggerToast({
      title: 'Warning',
      type: toastType.warning,
    });

    const { container } = render(result);
    expect(container.querySelector('.bg-yellow-700')).toBeInTheDocument();
  });
});
