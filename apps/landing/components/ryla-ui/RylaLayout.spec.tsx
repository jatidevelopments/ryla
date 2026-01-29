import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Container, Section, SectionHeader, GradientBackground, Divider, Badge } from './RylaLayout';

describe('RylaLayout', () => {
  it('should render children', () => {
    render(
      <Container>
        <div>Test Content</div>
      </Container>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <Container className="custom-class">
        <div>Test</div>
      </Container>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('should render Section component', () => {
    render(
      <Section>
        <div>Section Content</div>
      </Section>
    );
    expect(screen.getByText('Section Content')).toBeInTheDocument();
  });
});

describe('SectionHeader', () => {
  it('should render section header', () => {
    render(<SectionHeader title="Test Title" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should render with title highlight', () => {
    render(<SectionHeader title="Test Title" titleHighlight="Title" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
    expect(screen.getByText('Title')).toBeInTheDocument();
  });

  it('should render with subtitle', () => {
    render(<SectionHeader title="Title" subtitle="Subtitle" />);
    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('should render with badge', () => {
    render(<SectionHeader title="Title" badge="New" />);
    expect(screen.getByText('New')).toBeInTheDocument();
  });

  it('should handle title highlight not found', () => {
    render(<SectionHeader title="Test Title" titleHighlight="NotFound" />);
    expect(screen.getByText('Test Title')).toBeInTheDocument();
  });

  it('should handle centered prop', () => {
    const { container } = render(<SectionHeader title="Title" centered={false} />);
    expect(container.firstChild).not.toHaveClass('text-center');
  });
});

describe('GradientBackground', () => {
  it('should render gradient background', () => {
    const { container } = render(<GradientBackground />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should render with different positions', () => {
    const { container: top } = render(<GradientBackground position="top" />);
    expect(top.firstChild).toBeInTheDocument();
    
    const { container: center } = render(<GradientBackground position="center" />);
    expect(center.firstChild).toBeInTheDocument();
    
    const { container: bottom } = render(<GradientBackground position="bottom" />);
    expect(bottom.firstChild).toBeInTheDocument();
  });

  it('should render with different intensities', () => {
    const { container: light } = render(<GradientBackground intensity="light" />);
    expect(light.firstChild).toHaveClass('opacity-30');
    
    const { container: medium } = render(<GradientBackground intensity="medium" />);
    expect(medium.firstChild).toHaveClass('opacity-50');
    
    const { container: strong } = render(<GradientBackground intensity="strong" />);
    expect(strong.firstChild).toHaveClass('opacity-70');
  });
});

describe('Divider', () => {
  it('should render divider', () => {
    const { container } = render(<Divider />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(<Divider className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});

describe('Badge', () => {
  it('should render badge', () => {
    render(<Badge>Badge Text</Badge>);
    expect(screen.getByText('Badge Text')).toBeInTheDocument();
  });

  it('should render with different variants', () => {
    const { container: defaultBadge } = render(<Badge variant="default">Default</Badge>);
    expect(defaultBadge.firstChild).toBeInTheDocument();
    
    const { container: purpleBadge } = render(<Badge variant="purple">Purple</Badge>);
    expect(purpleBadge.firstChild).toBeInTheDocument();
    
    const { container: successBadge } = render(<Badge variant="success">Success</Badge>);
    expect(successBadge.firstChild).toBeInTheDocument();
  });
});
