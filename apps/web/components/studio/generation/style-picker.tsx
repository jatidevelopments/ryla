'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn, Input } from '@ryla/ui';
import {
  VISUAL_STYLES,
  STYLE_CATEGORIES,
  SCENES,
  SCENE_CATEGORIES,
  LIGHTING_SETTINGS,
  type StyleCategory,
  type SceneCategory,
  type LightingType,
} from './types';
import { useGalleryFavorites } from '../../../lib/hooks/use-gallery-favorites';

type TabType = 'styles' | 'scenes' | 'lighting' | 'effects';

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
  
  // Favorites hooks for different item types
  const stylesFavorites = useGalleryFavorites({ itemType: 'style' });
  const scenesFavorites = useGalleryFavorites({ itemType: 'scene' });
  const lightingFavorites = useGalleryFavorites({ itemType: 'lighting' });
  
  // Get the appropriate favorites hook based on active tab
  const currentFavorites = React.useMemo(() => {
    if (activeTab === 'styles') return stylesFavorites;
    if (activeTab === 'scenes') return scenesFavorites;
    if (activeTab === 'lighting') return lightingFavorites;
    return null;
  }, [activeTab, stylesFavorites, scenesFavorites, lightingFavorites]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Filter styles
  const filteredStyles = VISUAL_STYLES.filter(style => {
    const matchesSearch = style.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = styleCategory === 'all' || style.category === styleCategory;
    const matchesFavorites = !showFavoritesOnly || stylesFavorites.isFavorited(style.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Filter scenes
  const filteredScenes = SCENES.filter(scene => {
    const matchesSearch = scene.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = sceneCategory === 'all' || scene.category === sceneCategory;
    const matchesFavorites = !showFavoritesOnly || scenesFavorites.isFavorited(scene.id);
    return matchesSearch && matchesCategory && matchesFavorites;
  });

  // Filter lighting
  const filteredLighting = LIGHTING_SETTINGS.filter(light => {
    const matchesSearch = light.name.toLowerCase().includes(search.toLowerCase());
    const matchesFavorites = !showFavoritesOnly || lightingFavorites.isFavorited(light.id);
    return matchesSearch && matchesFavorites;
  });

  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    {
      id: 'styles',
      label: 'Visual Styles',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M1 5.25A2.25 2.25 0 013.25 3h13.5A2.25 2.25 0 0119 5.25v9.5A2.25 2.25 0 0116.75 17H3.25A2.25 2.25 0 011 14.75v-9.5zm1.5 5.81v3.69c0 .414.336.75.75.75h13.5a.75.75 0 00.75-.75v-2.69l-2.22-2.219a.75.75 0 00-1.06 0l-1.91 1.909.47.47a.75.75 0 11-1.06 1.06L6.53 8.091a.75.75 0 00-1.06 0l-2.97 2.97zM12 7a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: 'scenes',
      label: 'Scenes & Backgrounds',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path fillRule="evenodd" d="M5.5 17a4.5 4.5 0 01-1.44-8.765 4.5 4.5 0 018.302-3.046 3.5 3.5 0 014.504 4.272A4 4 0 0115 17H5.5zm3.75-2.75a.75.75 0 001.5 0V9.66l1.95 2.1a.75.75 0 101.1-1.02l-3.25-3.5a.75.75 0 00-1.1 0l-3.25 3.5a.75.75 0 101.1 1.02l1.95-2.1v4.59z" clipRule="evenodd" />
        </svg>
      ),
    },
    {
      id: 'lighting',
      label: 'Lighting',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M10 1a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 1zM5.05 3.05a.75.75 0 011.06 0l1.062 1.06A.75.75 0 116.11 5.173L5.05 4.11a.75.75 0 010-1.06zm9.9 0a.75.75 0 010 1.06l-1.06 1.062a.75.75 0 01-1.062-1.061l1.061-1.06a.75.75 0 011.06 0zM3 10a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 013 10zm11 0a.75.75 0 01.75-.75h1.5a.75.75 0 010 1.5h-1.5A.75.75 0 0114 10zm-6.828 5.829a.75.75 0 010 1.06l-1.06 1.061a.75.75 0 11-1.061-1.06l1.06-1.061a.75.75 0 011.06 0zm5.657 0a.75.75 0 011.06 0l1.061 1.06a.75.75 0 01-1.06 1.061l-1.061-1.06a.75.75 0 010-1.061zM10 14a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 14zM10 5a5 5 0 100 10 5 5 0 000-10z" />
        </svg>
      ),
    },
    {
      id: 'effects',
      label: 'Effects & Filters',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
          <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a1 1 0 01-.784.785l-1.192.238a1 1 0 000 1.962l1.192.238a1 1 0 01.785.785l.238 1.192a1 1 0 001.962 0l.238-1.192a1 1 0 01.785-.785l1.192-.238a1 1 0 000-1.962l-1.192-.238a1 1 0 01-.785-.785l-.238-1.192zM6.949 5.684a1 1 0 00-1.898 0l-.683 2.051a1 1 0 01-.633.633l-2.051.683a1 1 0 000 1.898l2.051.684a1 1 0 01.633.632l.683 2.051a1 1 0 001.898 0l.683-2.051a1 1 0 01.633-.633l2.051-.683a1 1 0 000-1.898l-2.051-.683a1 1 0 01-.633-.633L6.95 5.684z" />
        </svg>
      ),
    },
  ];

  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => {
    setMounted(true);
  }, []);

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
          {/* Tabs */}
          <nav className="flex items-center gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSearch('');
                }}
                className={cn(
                  'flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                  activeTab === tab.id
                    ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
                    : 'text-white/50 hover:text-white hover:bg-white/5'
                )}
              >
                <span className="flex-shrink-0">{tab.icon}</span>
                <span className="whitespace-nowrap">{tab.label}</span>
              </button>
            ))}
          </nav>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Search, Favorites Filter & Close */}
          <div className="flex items-center gap-3">
            {currentFavorites && (
              <button
                onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
                className={cn(
                  'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                  showFavoritesOnly
                    ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')}>
                  <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                </svg>
                <span className="hidden sm:inline">Favorites</span>
              </button>
            )}
            <div className="relative">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40">
                <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
              </svg>
              <Input
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-44 h-10 pl-9 pr-4 bg-[#0d0d0f] border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0"
              />
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          </div>
        </div>

        {/* Category Filters */}
        {activeTab === 'styles' && (
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 overflow-x-auto scroll-hidden">
            {STYLE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setStyleCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  styleCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {activeTab === 'scenes' && (
          <div className="flex items-center gap-3 px-6 py-5 border-b border-white/5 overflow-x-auto scroll-hidden">
            <button
              onClick={() => setSceneCategory('all')}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                sceneCategory === 'all'
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              All
            </button>
            {SCENE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSceneCategory(cat.id)}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                  sceneCategory === cat.id
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        )}

        {/* Content - Scrollable area */}
        <div className="flex-1 overflow-y-auto p-4 min-h-0">
          {/* Visual Styles Tab */}
          {activeTab === 'styles' && (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
              {/* None option */}
              <div className="break-inside-avoid mb-3">
                <button
                  onClick={() => onStyleSelect(null)}
                  className={cn(
                    'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
                    !selectedStyleId
                      ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                      : 'border-transparent hover:border-white/30'
                  )}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✕</div>
                    <span className="text-sm font-medium text-white/60">None</span>
                  </div>
                </button>
              </div>
              {filteredStyles.map((style) => (
                <StyleCard
                  key={style.id}
                  id={style.id}
                  name={style.name}
                  thumbnail={style.thumbnail}
                  isSelected={selectedStyleId === style.id}
                  onSelect={() => onStyleSelect(style.id)}
                  isFavorited={stylesFavorites.isFavorited(style.id)}
                  onToggleFavorite={(e) => {
                    e.stopPropagation();
                    stylesFavorites.toggleFavorite(style.id);
                  }}
                />
              ))}
            </div>
          )}

          {/* Scenes Tab */}
          {activeTab === 'scenes' && (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
              {/* None option */}
              <div className="break-inside-avoid mb-3">
                <button
                  onClick={() => onSceneSelect(null)}
                  className={cn(
                    'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
                    !selectedSceneId
                      ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                      : 'border-transparent hover:border-white/30'
                  )}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✕</div>
                    <span className="text-sm font-medium text-white/60">None</span>
                  </div>
                </button>
              </div>
              {filteredScenes.map((scene) => (
                <StyleCard
                  key={scene.id}
                  id={scene.id}
                  name={scene.name}
                  thumbnail={scene.thumbnail}
                  isSelected={selectedSceneId === scene.id}
                  onSelect={() => onSceneSelect(scene.id)}
                  isFavorited={scenesFavorites.isFavorited(scene.id)}
                  onToggleFavorite={(e) => {
                    e.stopPropagation();
                    scenesFavorites.toggleFavorite(scene.id);
                  }}
                />
              ))}
            </div>
          )}

          {/* Lighting Tab */}
          {activeTab === 'lighting' && (
            <div className="columns-2 sm:columns-3 md:columns-4 gap-3">
              {/* None option */}
              <div className="break-inside-avoid mb-3">
                <button
                  onClick={() => onLightingSelect(null)}
                  className={cn(
                    'w-full aspect-[4/5] rounded-xl overflow-hidden border-2 transition-all flex items-center justify-center bg-white/5',
                    !selectedLightingId
                      ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                      : 'border-transparent hover:border-white/30'
                  )}
                >
                  <div className="text-center">
                    <div className="text-2xl mb-2">✕</div>
                    <span className="text-sm font-medium text-white/60">None</span>
                  </div>
                </button>
              </div>
              {filteredLighting.map((light) => (
                <StyleCard
                  key={light.id}
                  id={light.id}
                  name={light.name}
                  thumbnail={light.thumbnail}
                  isSelected={selectedLightingId === light.id}
                  onSelect={() => onLightingSelect(light.id)}
                  isFavorited={lightingFavorites.isFavorited(light.id)}
                  onToggleFavorite={(e) => {
                    e.stopPropagation();
                    lightingFavorites.toggleFavorite(light.id);
                  }}
                />
              ))}
            </div>
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

        {/* Footer - Always visible sticky summary */}
        <div className="flex-shrink-0 flex items-center justify-between px-5 py-4 border-t border-white/10 bg-[#0d0d0f]">
          {/* Selected items as chips */}
          <div className="flex items-center gap-3">
            {selectedStyleId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white/50 text-sm">Style:</span>
                <span className="text-white font-medium text-sm">
                  {VISUAL_STYLES.find(s => s.id === selectedStyleId)?.name}
                </span>
                <button 
                  onClick={() => onStyleSelect(null)} 
                  className="ml-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}
            {selectedSceneId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white/50 text-sm">Scene:</span>
                <span className="text-white font-medium text-sm">
                  {SCENES.find(s => s.id === selectedSceneId)?.name}
                </span>
                <button 
                  onClick={() => onSceneSelect(null)} 
                  className="ml-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}
            {selectedLightingId && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <span className="text-white/50 text-sm">Lighting:</span>
                <span className="text-white font-medium text-sm">
                  {LIGHTING_SETTINGS.find(l => l.id === selectedLightingId)?.name}
                </span>
                <button 
                  onClick={() => onLightingSelect(null)} 
                  className="ml-1 text-white/40 hover:text-white transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                  </svg>
                </button>
              </div>
            )}
            {!selectedStyleId && !selectedSceneId && !selectedLightingId && (
              <span className="text-white/40 text-sm">No options selected</span>
            )}
          </div>

          {/* Apply button */}
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
          >
            Apply
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// Style Card Component
function StyleCard({
  id,
  name,
  thumbnail,
  isSelected,
  onSelect,
  isFavorited,
  onToggleFavorite,
}: {
  id: string;
  name: string;
  thumbnail: string;
  isSelected: boolean;
  onSelect: () => void;
  isFavorited?: boolean;
  onToggleFavorite?: (e: React.MouseEvent) => void;
}) {
  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="break-inside-avoid mb-3">
      <button
        onClick={onSelect}
        className={cn(
          'group relative w-full rounded-xl overflow-hidden border-2 transition-all',
          isSelected
            ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
            : 'border-transparent hover:border-white/30'
        )}
      >
        {/* Image */}
        <div className="relative aspect-[4/5] bg-white/5">
          {!imgError ? (
            <Image
              src={thumbnail}
              alt={name}
              fill
              className="object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--purple-500)]/20 to-[var(--pink-500)]/20">
              <span className="text-3xl font-bold text-white/20">
                {name.charAt(0)}
              </span>
            </div>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        </div>

        {/* Name */}
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <span className="text-sm font-medium text-white uppercase">
            {name}
          </span>
        </div>

        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
              <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        {/* Like button */}
        {onToggleFavorite && (
          <button
            onClick={onToggleFavorite}
            className={cn(
              'absolute top-2 right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
              isFavorited
                ? 'bg-[var(--pink-500)] text-white opacity-100'
                : 'bg-black/50 text-white/60 hover:bg-black/70 hover:text-white'
            )}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cn('h-4 w-4', isFavorited && 'fill-current')}>
              <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
            </svg>
          </button>
        )}
      </button>
    </div>
  );
}

