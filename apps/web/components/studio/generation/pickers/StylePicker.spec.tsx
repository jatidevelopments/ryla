import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { StylePicker } from './StylePicker';
// Mock dependencies
vi.mock('./PickerDrawer', () => ({
  PickerDrawer: ({ children, isOpen, title }: any) =>
    isOpen ? (
      <div data-testid="picker-drawer" title={title}>
        {children}
      </div>
    ) : null,
}));

vi.mock('../components/style-picker', () => ({
  StylePickerTabs: ({ activeTab, onTabChange }: any) => (
    <div data-testid="tabs">
      <button onClick={() => onTabChange('styles')}>Styles Tab</button>
      <button onClick={() => onTabChange('scenes')}>Scenes Tab</button>
      <button onClick={() => onTabChange('lighting')}>Lighting Tab</button>
      <span data-testid="active-tab">{activeTab}</span>
    </div>
  ),
  StylePickerHeader: ({ search, onSearchChange }: any) => (
    <input
      data-testid="search-input"
      value={search}
      onChange={(e) => onSearchChange(e.target.value)}
    />
  ),
  StyleCategoryFilters: ({ activeCategory, onCategoryChange }: any) => (
    <div data-testid="style-filters" data-active={activeCategory}>
      <button onClick={() => onCategoryChange('cinematic')}>
        Cinematic Filter
      </button>
    </div>
  ),
  StylePickerFooter: () => <div data-testid="footer">Footer</div>,
}));

vi.mock('../components/style-picker/StyleCategoryFilters', () => ({
  SceneCategoryFilters: ({ activeCategory, onCategoryChange }: any) => (
    <div data-testid="scene-filters" data-active={activeCategory}>
      <button onClick={() => onCategoryChange('indoor')}>Indoor Filter</button>
    </div>
  ),
}));

vi.mock('../components/style-picker/StylePickerGrids', () => ({
  StylesGrid: () => <div data-testid="styles-grid">Styles Grid</div>,
  ScenesGrid: () => <div data-testid="scenes-grid">Scenes Grid</div>,
  LightingGrid: () => <div data-testid="lighting-grid">Lighting Grid</div>,
}));

// Mock hook
const mockUseStylePicker = {
  stylesFavorites: { isFavorited: vi.fn(), toggleFavorite: vi.fn() },
  scenesFavorites: { isFavorited: vi.fn(), toggleFavorite: vi.fn() },
  lightingFavorites: { isFavorited: vi.fn(), toggleFavorite: vi.fn() },
  currentFavorites: [],
  filteredStyles: [],
  filteredScenes: [],
  filteredLighting: [],
};

vi.mock('../hooks/use-style-picker', () => ({
  useStylePicker: () => mockUseStylePicker,
}));

describe('StylePicker', () => {
  const defaultProps = {
    selectedStyleId: null,
    selectedSceneId: null,
    selectedLightingId: null,
    onStyleSelect: vi.fn(),
    onSceneSelect: vi.fn(),
    onLightingSelect: vi.fn(),
    onClose: vi.fn(),
  };

  it('should render drawer and default tab (styles)', () => {
    render(<StylePicker {...defaultProps} />);
    expect(screen.getByTestId('picker-drawer')).toBeInTheDocument();
    expect(screen.getByTestId('active-tab')).toHaveTextContent('styles');
    expect(screen.getByTestId('styles-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('scenes-grid')).not.toBeInTheDocument();
  });

  it('should switch tabs', () => {
    render(<StylePicker {...defaultProps} />);

    // Switch to Scenes
    fireEvent.click(screen.getByText('Scenes Tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('scenes');
    expect(screen.getByTestId('scenes-grid')).toBeInTheDocument();
    expect(screen.queryByTestId('styles-grid')).not.toBeInTheDocument();

    // Switch to Lighting
    fireEvent.click(screen.getByText('Lighting Tab'));
    expect(screen.getByTestId('active-tab')).toHaveTextContent('lighting');
    expect(screen.getByTestId('lighting-grid')).toBeInTheDocument();
  });

  it('should update search', () => {
    render(<StylePicker {...defaultProps} />);
    const input = screen.getByTestId('search-input');
    fireEvent.change(input, { target: { value: 'test search' } });
    expect(input).toHaveValue('test search');
  });

  it('should render correct filters for tabs', () => {
    render(<StylePicker {...defaultProps} />);

    // Styles tab
    expect(screen.getByTestId('style-filters')).toBeInTheDocument();
    expect(screen.queryByTestId('scene-filters')).not.toBeInTheDocument();

    // Switch to Scenes
    fireEvent.click(screen.getByText('Scenes Tab'));
    expect(screen.getByTestId('scene-filters')).toBeInTheDocument();
    expect(screen.queryByTestId('style-filters')).not.toBeInTheDocument();
  });

  it('should handle category changes', () => {
    render(<StylePicker {...defaultProps} />);

    // Check default style filter
    expect(screen.getByTestId('style-filters')).toHaveAttribute(
      'data-active',
      'all'
    );

    // Change filter
    fireEvent.click(screen.getByText('Cinematic Filter'));
    expect(screen.getByTestId('style-filters')).toHaveAttribute(
      'data-active',
      'cinematic'
    );
  });
});
