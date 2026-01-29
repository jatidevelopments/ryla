import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import MainContentWrapper from './MainContentWrapper';

describe('MainContentWrapper', () => {
  it('should render children', () => {
    render(
      <MainContentWrapper>
        <div>Test Content</div>
      </MainContentWrapper>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should render as main element', () => {
    const { container } = render(
      <MainContentWrapper>
        <div>Content</div>
      </MainContentWrapper>
    );
    
    const main = container.querySelector('main');
    expect(main).toBeInTheDocument();
    expect(main).toHaveClass('w-full', 'flex-1', 'flex', 'flex-col');
  });
});
