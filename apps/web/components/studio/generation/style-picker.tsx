'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import type { StyleCategory, SceneCategory } from './types';
import { useStylePicker, type TabType } from './hooks/use-style-picker';
import { StylePickerTabs } from './components/style-picker-tabs';
import { StylePickerHeader } from './components/style-picker-header';
import { StyleCategoryFilters, SceneCategoryFilters } from './components/style-category-filters';
import { StylesGrid, ScenesGrid, LightingGrid } from './components/style-picker-grids';
import { StylePickerFooter } from './components/style-picker-footer';

interface StylePickerProps {
  selectedStyleId: string | null;
  selectedSceneId: string | null;
  selectedLightingId: string | null;
  onStyleSelect: (id: string | null) => void;
  onSceneSelect: (id: string | null) => void;
  onLightingSelect: (id: string | null) => void;
  onClose: () => void;
}

export function StylePicker({
  selectedStyleId,
  selectedSceneId,
  selectedLightingId,
  onStyleSelect,
  onSceneSelect,
  onLightingSelect,
  onClose,
}: StylePickerProps) {
  const [activeTab, setActiveTab] = React.useState<TabType>('styles');
  const [search, setSearch] = React.useState('');
  const [styleCategory, setStyleCategory] = React.useState<StyleCategory>('all');
  const [sceneCategory, setSceneCategory] = React.useState<SceneCategory | 'all'>('all');
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = React.useState(false);

  // Filtering and favorites logic
  const {
    stylesFavorites,
    scenesFavorites,
    lightingFavorites,
    currentFavorites,
    filteredStyles,
    filteredScenes,
    filteredLighting,
  } = useStylePicker({
    search,
    styleCategory,
    sceneCategory,
    showFavoritesOnly,
    activeTab,
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
    setSearch('');
  };

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 md:p-8"
    >
      <div 
        className="flex flex-col w-full max-w-7xl max-h-[85vh] bg-[#18181b] rounded-2xl border border-white/15 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
          <StylePickerTabs activeTab={activeTab} onTabChange={handleTabChange} />
          <div className="flex-1" />
          <StylePickerHeader
            activeTab={activeTab}
            search={search}
            onSearchChange={setSearch}
            showFavoritesOnly={showFavoritesOnly}
            onToggleFavorites={() => setShowFavoritesOnly(!showFavoritesOnly)}
            onClose={onClose}
            currentFavorites={currentFavorites}
          />
        </div>

        {/* Category Filters */}
        {activeTab === 'styles' && (
          <StyleCategoryFilters activeCategory={styleCategory} onCategoryChange={setStyleCategory} />
        )}

        {activeTab === 'scenes' && (
          <SceneCategoryFilters activeCategory={sceneCategory} onCategoryChange={setSceneCategory} />
        )}

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {activeTab === 'styles' && (
            <StylesGrid
              filteredStyles={filteredStyles}
              selectedStyleId={selectedStyleId}
              onStyleSelect={onStyleSelect}
              isFavorited={stylesFavorites.isFavorited}
              onToggleFavorite={stylesFavorites.toggleFavorite}
            />
          )}

          {activeTab === 'scenes' && (
            <ScenesGrid
              filteredScenes={filteredScenes}
              selectedSceneId={selectedSceneId}
              onSceneSelect={onSceneSelect}
              isFavorited={scenesFavorites.isFavorited}
              onToggleFavorite={scenesFavorites.toggleFavorite}
            />
          )}

          {activeTab === 'lighting' && (
            <LightingGrid
              filteredLighting={filteredLighting}
              selectedLightingId={selectedLightingId}
              onLightingSelect={onLightingSelect}
              isFavorited={lightingFavorites.isFavorited}
              onToggleFavorite={lightingFavorites.toggleFavorite}
            />
          )}

          {/* Effects Tab - Coming Soon */}
          {activeTab === 'effects' && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-10 w-10 text-[var(--purple-400)]">
                  <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Effects Coming Soon</h3>
              <p className="text-white/50 max-w-sm">
                Advanced filters, color grading, and special effects are being developed. Stay tuned!
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <StylePickerFooter
          selectedStyleId={selectedStyleId}
          selectedSceneId={selectedSceneId}
          selectedLightingId={selectedLightingId}
          onStyleSelect={onStyleSelect}
          onSceneSelect={onSceneSelect}
          onLightingSelect={onLightingSelect}
          onClose={onClose}
        />
      </div>
    </div>,
    document.body
  );
}

