import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AnnouncementBar } from './announcement-bar';

describe('AnnouncementBar', () => {
  it('should render with default variant', () => {
    render(<AnnouncementBar />);
    expect(screen.getAllByText(/🚀 New/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Auto-post to Instagram & TikTok/)[0]).toBeInTheDocument();
  });

  it('should render with overlay variant', () => {
    render(<AnnouncementBar variant="overlay" />);
    expect(screen.getAllByText(/🚀 New/)[0]).toBeInTheDocument();
  });

  it('should display all announcement items', () => {
    render(<AnnouncementBar />);
    expect(screen.getAllByText(/🚀 New/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/2\.3M\+ Posts Generated/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/Live Demo/)[0]).toBeInTheDocument();
  });

  it('should display announcement text', () => {
    render(<AnnouncementBar />);
    expect(screen.getAllByText(/Join thousands of creators earning with AI/)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/See AURA in action/)[0]).toBeInTheDocument();
  });
});
