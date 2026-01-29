import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import ImageCard from './ImageCard';
import { ImageCardContext } from './ImageCard';

// Mock ResizeObserver as a proper constructor class
let resizeCallback: ResizeObserverCallback | null = null;
let observedElement: Element | null = null;

const mockObserve = vi.fn((target: Element) => {
  observedElement = target;
  // Trigger callback synchronously to set size immediately
  if (resizeCallback) {
    resizeCallback([
      {
        contentRect: { width: 100, height: 100 },
        target,
      } as ResizeObserverEntry,
    ], mockResizeObserverInstance as any);
  }
});

const mockUnobserve = vi.fn();
const mockDisconnect = vi.fn();

class MockResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    resizeCallback = callback;
  }
  observe = mockObserve;
  unobserve = mockUnobserve;
  disconnect = mockDisconnect;
}

const mockResizeObserverInstance = new MockResizeObserver(() => {});
global.ResizeObserver = MockResizeObserver as any;

vi.mock('@/components/SpriteIcon/SpriteIcon', () => ({
  default: ({ fallbackAlt }: any) => <div data-testid="sprite-icon">{fallbackAlt}</div>,
}));

vi.mock('@/components/ui/OptionImagePlaceholder', () => ({
  OptionImagePlaceholder: ({ description }: any) => (
    <div data-testid="placeholder">{description}</div>
  ),
}));

describe('ImageCard', () => {
  it('should render ImageCard component', async () => {
    render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test image' }}>
        <ImageCard.Image />
      </ImageCard>
    );

    // Wait for ResizeObserver callback to fire and set size
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(screen.getByTestId('sprite-icon')).toBeInTheDocument();
    });
  });

  it('should show active state when isActive is true', async () => {
    const { container } = render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test' }} isActive={true}>
        <ImageCard.Image />
      </ImageCard>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-primary-gradient');
    });
  });

  it('should show inactive state when isActive is false', async () => {
    const { container } = render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test' }} isActive={false}>
        <ImageCard.Image />
      </ImageCard>
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-black-2');
    });
  });

  it('should render ImageCard.Name', () => {
    render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test', name: 'Test Name' }}>
        <ImageCard.Name />
      </ImageCard>
    );

    expect(screen.getByText('Test Name')).toBeInTheDocument();
  });

  it('should render ImageCard.Badge', () => {
    render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test', name: 'Badge Name' }}>
        <ImageCard.Badge />
      </ImageCard>
    );

    expect(screen.getByText('Badge Name')).toBeInTheDocument();
  });

  it('should render ImageCard.Overlay', () => {
    const { container } = render(
      <ImageCard image={{ src: '/test.jpg', alt: 'Test' }}>
        <ImageCard.Overlay />
      </ImageCard>
    );

    const overlay = container.querySelector('.bg-gradient-to-b');
    expect(overlay).toBeInTheDocument();
  });

  it('should show placeholder when image src is empty', async () => {
    render(
      <ImageCard image={{ src: '', alt: 'Test', name: 'Test Name' }}>
        <ImageCard.Image />
      </ImageCard>
    );

    // Wait for ResizeObserver callback - placeholder shows when src is empty
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    await waitFor(() => {
      expect(screen.getByTestId('placeholder')).toBeInTheDocument();
    });
  });
});
