import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from './carousel';
import useEmblaCarousel from 'embla-carousel-react';

vi.mock('embla-carousel-react', () => ({
  default: vi.fn(() => [
    { current: null },
    {
      scrollPrev: vi.fn(),
      scrollNext: vi.fn(),
      canScrollPrev: vi.fn(() => true),
      canScrollNext: vi.fn(() => true),
      on: vi.fn(),
    },
  ]),
}));

describe('Carousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render Carousel with children', () => {
    render(
      <Carousel>
        <CarouselContent>
          <CarouselItem>Item 1</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    expect(screen.getByText('Item 1')).toBeInTheDocument();
  });

  it('should render CarouselPrevious button', () => {
    render(
      <Carousel>
        <CarouselPrevious />
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    const prevButton = screen.getByRole('button');
    expect(prevButton).toBeInTheDocument();
  });

  it('should render CarouselNext button', () => {
    render(
      <Carousel>
        <CarouselNext />
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    const nextButton = screen.getByRole('button');
    expect(nextButton).toBeInTheDocument();
  });

  it('should call scrollPrev when previous button clicked', () => {
    const mockScrollPrev = vi.fn();
    (useEmblaCarousel as any).mockReturnValue([
      { current: null },
      {
        scrollPrev: mockScrollPrev,
        scrollNext: vi.fn(),
        canScrollPrev: vi.fn(() => true),
        canScrollNext: vi.fn(() => true),
        on: vi.fn(),
      },
    ]);

    render(
      <Carousel>
        <CarouselPrevious />
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    const prevButton = screen.getByRole('button');
    fireEvent.click(prevButton);
    
    expect(mockScrollPrev).toHaveBeenCalled();
  });

  it('should call scrollNext when next button clicked', () => {
    const mockScrollNext = vi.fn();
    (useEmblaCarousel as any).mockReturnValue([
      { current: null },
      {
        scrollPrev: vi.fn(),
        scrollNext: mockScrollNext,
        canScrollPrev: vi.fn(() => true),
        canScrollNext: vi.fn(() => true),
        on: vi.fn(),
      },
    ]);

    render(
      <Carousel>
        <CarouselNext />
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    const nextButton = screen.getByRole('button');
    fireEvent.click(nextButton);
    
    expect(mockScrollNext).toHaveBeenCalled();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Carousel className="custom-class">
        <CarouselContent>
          <CarouselItem>Item</CarouselItem>
        </CarouselContent>
      </Carousel>
    );
    
    const carousel = container.querySelector('[data-slot="carousel"]');
    expect(carousel).toHaveClass('custom-class');
  });
});
