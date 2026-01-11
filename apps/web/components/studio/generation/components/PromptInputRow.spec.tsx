import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PromptInputRow } from './PromptInputRow';

// Mock child components
vi.mock('./SelectedImageDisplay', () => ({
  SelectedImageDisplay: () => (
    <div data-testid="selected-image-display">SelectedImageDisplay</div>
  ),
}));

vi.mock('./InfluencerThumbnails', () => ({
  InfluencerThumbnails: () => (
    <div data-testid="influencer-thumbnails">InfluencerThumbnails</div>
  ),
}));

vi.mock('./GenerateButton', () => ({
  GenerateButton: ({ onGenerate }: any) => (
    <button onClick={onGenerate} data-testid="generate-button">
      Generate
    </button>
  ),
}));

vi.mock('@ryla/ui', () => ({
  cn: (...args: any[]) => args.join(' '),
}));

vi.mock('../utils/get-prompt-placeholder', () => ({
  getPromptPlaceholder: () => 'Test Placeholder',
}));

describe('PromptInputRow', () => {
  const defaultProps = {
    prompt: '',
    onPromptChange: vi.fn(),
    onPromptSubmit: vi.fn(),
    mode: 'text-to-image' as const,
    selectedImage: null,
    selectedObjects: [],
    influencers: [],
    selectedInfluencerId: null,
    canGenerate: true,
    creditsCost: 1,
    onRemoveObject: vi.fn(),
    onAddObject: vi.fn(),
    onSelectInfluencer: vi.fn(),
    onShowInfluencerPicker: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render textarea with placeholder', () => {
    render(<PromptInputRow {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Test Placeholder');
    expect(textarea).toBeInTheDocument();
  });

  it('should handle prompt changes', () => {
    render(<PromptInputRow {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('Test Placeholder');
    fireEvent.change(textarea, { target: { value: 'New Prompt' } });
    expect(defaultProps.onPromptChange).toHaveBeenCalledWith('New Prompt');
  });

  it('should toggle submit on Enter key', () => {
    render(<PromptInputRow {...defaultProps} prompt="test" />);
    const textarea = screen.getByDisplayValue('test');

    // Press Enter
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(defaultProps.onPromptSubmit).toHaveBeenCalled();
  });

  it('should NOT submit on Enter if canGenerate is false', () => {
    render(
      <PromptInputRow {...defaultProps} canGenerate={false} prompt="test" />
    );
    const textarea = screen.getByDisplayValue('test');

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(defaultProps.onPromptSubmit).not.toHaveBeenCalled();
  });

  it('should validly handle Shift+Enter (new line)', () => {
    render(<PromptInputRow {...defaultProps} prompt="test" />);
    const textarea = screen.getByDisplayValue('test');

    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(defaultProps.onPromptSubmit).not.toHaveBeenCalled();
  });

  it('should disable input in upscaling mode', () => {
    render(<PromptInputRow {...defaultProps} mode="upscaling" />);
    const textarea = screen.getByPlaceholderText('Test Placeholder');
    expect(textarea).toBeDisabled();
  });

  it('should render child components on desktop', () => {
    render(<PromptInputRow {...defaultProps} />);
    // Note: The visibility logic (hidden md:flex) is managed by CSS classes which jsdom doesn't fully emulate for layout,
    // but the elements should be in the DOM.
    expect(screen.getByTestId('selected-image-display')).toBeInTheDocument();
    expect(screen.getByTestId('influencer-thumbnails')).toBeInTheDocument();
    expect(screen.getByTestId('generate-button')).toBeInTheDocument();
  });
});
