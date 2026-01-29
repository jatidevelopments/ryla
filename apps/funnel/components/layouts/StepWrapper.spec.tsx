import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StepWrapper from './StepWrapper';

describe('StepWrapper', () => {
  it('should render children', () => {
    render(
      <StepWrapper>
        <div>Test Content</div>
      </StepWrapper>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply correct className', () => {
    const { container } = render(
      <StepWrapper>
        <div>Content</div>
      </StepWrapper>
    );
    
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper).toHaveClass('w-full', 'flex', 'flex-col');
  });
});
