'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { cn, Badge } from '@ryla/ui';
import {
  OutfitComposition,
  OutfitPiece,
  OutfitPieceCategory,
  OUTFIT_PIECE_CATEGORIES,
  getCategoryPieces,
  getPieceById,
} from '@ryla/shared';
import { X, Search, Save, Star, Trash2, Edit2 } from 'lucide-react';
import { createOutfitPreset, getOutfitPresets, deleteOutfitPreset, updateOutfitPreset, type OutfitPreset } from '../../../lib/api/outfit-presets';
import { useGalleryFavorites } from '../../../lib/hooks/use-gallery-favorites';

interface OutfitCompositionPickerProps {
  selectedComposition: OutfitComposition | null;
  onCompositionSelect: (composition: OutfitComposition | null) => void;
  onClose: () => void;
  nsfwEnabled?: boolean;
  influencerId?: string; // Required for saving presets
}

const CATEGORY_LABELS: Record<OutfitPieceCategory, string> = {
  top: 'Top',
  bottom: 'Bottom',
  shoes: 'Shoes',
  headwear: 'Headwear',
  outerwear: 'Outerwear',
  accessory: 'Accessories',
};

export function OutfitCompositionPicker({
  selectedComposition,
  onCompositionSelect,
  onClose,
  nsfwEnabled = false,
  influencerId,
}: OutfitCompositionPickerProps) {
  const [activeCategory, setActiveCategory] = React.useState<OutfitPieceCategory | 'all' | 'presets'>('all');
  const [search, setSearch] = React.useState('');
  const [composition, setComposition] = React.useState<OutfitComposition | null>(selectedComposition);
  const [mounted, setMounted] = React.useState(false);
  const [presets, setPresets] = React.useState<OutfitPreset[]>([]);
  const [isLoadingPresets, setIsLoadingPresets] = React.useState(false);
  const [showSaveDialog, setShowSaveDialog] = React.useState(false);
  const [editingPreset, setEditingPreset] = React.useState<OutfitPreset | null>(null);
  const [presetName, setPresetName] = React.useState('');
  const [presetDescription, setPresetDescription] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);
  const [showFavoritesOnly, setShowFavoritesOnly] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  // Favorites hook
  const { isFavorited, toggleFavorite } = useGalleryFavorites({
    itemType: 'outfit-piece',
  });

  React.useEffect(() => {
    setMounted(true);
  }, []);

  // Load presets when influencerId is available
  React.useEffect(() => {
    if (influencerId && mounted) {
      loadPresets();
    }
  }, [influencerId, mounted]);

  const loadPresets = async () => {
    if (!influencerId) return;
    setIsLoadingPresets(true);
    try {
      const loadedPresets = await getOutfitPresets(influencerId);
      setPresets(loadedPresets);
    } catch (error) {
      console.error('Failed to load outfit presets:', error);
    } finally {
      setIsLoadingPresets(false);
    }
  };

  const handleSavePreset = async () => {
    if (!influencerId || !composition || !presetName.trim()) return;
    
    setIsSaving(true);
    try {
      if (editingPreset) {
        // Update existing preset
        await updateOutfitPreset(editingPreset.id, {
          name: presetName.trim(),
          description: presetDescription.trim() || undefined,
          composition,
        });
      } else {
        // Create new preset
        await createOutfitPreset({
          influencerId,
          name: presetName.trim(),
          description: presetDescription.trim() || undefined,
          composition,
        });
      }
      setShowSaveDialog(false);
      setEditingPreset(null);
      setPresetName('');
      setPresetDescription('');
      await loadPresets();
    } catch (error) {
      console.error('Failed to save outfit preset:', error);
      alert('Failed to save outfit preset. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditPreset = (preset: OutfitPreset, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingPreset(preset);
    setPresetName(preset.name);
    setPresetDescription(preset.description || '');
    setComposition(preset.composition);
    setShowSaveDialog(true);
  };

  const handleLoadPreset = (preset: OutfitPreset) => {
    setComposition(preset.composition);
    setActiveCategory('all'); // Switch back to pieces view
  };

  const handleDeletePreset = async (presetId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this outfit preset?')) return;
    
    try {
      await deleteOutfitPreset(presetId);
      await loadPresets();
    } catch (error) {
      console.error('Failed to delete outfit preset:', error);
      alert('Failed to delete outfit preset. Please try again.');
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  };

  // Get available pieces for current category
  const availablePieces = React.useMemo(() => {
    let pieces: OutfitPiece[] = [];
    
    if (activeCategory === 'all') {
      // Show all pieces
      pieces = getCategoryPieces('top', nsfwEnabled)
        .concat(getCategoryPieces('bottom', nsfwEnabled))
        .concat(getCategoryPieces('shoes', nsfwEnabled))
        .concat(getCategoryPieces('headwear', nsfwEnabled))
        .concat(getCategoryPieces('outerwear', nsfwEnabled))
        .concat(getCategoryPieces('accessory', nsfwEnabled));
    } else {
      pieces = getCategoryPieces(activeCategory, nsfwEnabled);
    }
    
    // Filter by search
    if (search.trim()) {
      const searchLower = search.toLowerCase();
      pieces = pieces.filter((piece) =>
        piece.label.toLowerCase().includes(searchLower)
      );
    }
    
    // Filter by favorites
    if (showFavoritesOnly) {
      pieces = pieces.filter((piece) => isFavorited(piece.id));
    }
    
    return pieces;
  }, [activeCategory, search, nsfwEnabled, showFavoritesOnly, isFavorited]);

  const handlePieceSelect = (piece: OutfitPiece) => {
    setComposition((prev) => {
      const newComp: OutfitComposition = { ...prev };
      
      if (piece.category === 'accessory') {
        // Accessories: toggle (multiple allowed)
        const current = newComp.accessories || [];
        const index = current.indexOf(piece.id);
        if (index >= 0) {
          // Remove
          newComp.accessories = current.filter((id) => id !== piece.id);
        } else {
          // Add
          newComp.accessories = [...current, piece.id];
        }
      } else {
        // Single selection categories: replace
        if (piece.category === 'top') newComp.top = piece.id;
        else if (piece.category === 'bottom') newComp.bottom = piece.id;
        else if (piece.category === 'shoes') newComp.shoes = piece.id;
        else if (piece.category === 'headwear') newComp.headwear = piece.id;
        else if (piece.category === 'outerwear') newComp.outerwear = piece.id;
      }
      
      return newComp;
    });
  };

  const handleClearPiece = (category: OutfitPieceCategory) => {
    setComposition((prev) => {
      if (!prev) return null;
      
      const newComp: OutfitComposition = { ...prev };
      
      if (category === 'top') delete newComp.top;
      else if (category === 'bottom') delete newComp.bottom;
      else if (category === 'shoes') delete newComp.shoes;
      else if (category === 'headwear') delete newComp.headwear;
      else if (category === 'outerwear') delete newComp.outerwear;
      else if (category === 'accessory') newComp.accessories = [];
      
      // Return null if composition is empty
      const hasAny = newComp.top || newComp.bottom || newComp.shoes || 
                     newComp.headwear || newComp.outerwear || 
                     (newComp.accessories && newComp.accessories.length > 0);
      
      return hasAny ? newComp : null;
    });
  };

  const handleClearAll = () => {
    setComposition(null);
  };

  const handleApply = () => {
    onCompositionSelect(composition);
    onClose();
  };

  const isPieceSelected = (piece: OutfitPiece): boolean => {
    if (!composition) return false;
    
    if (piece.category === 'accessory') {
      return composition.accessories?.includes(piece.id) || false;
    }
    
    if (piece.category === 'top') return composition.top === piece.id;
    if (piece.category === 'bottom') return composition.bottom === piece.id;
    if (piece.category === 'shoes') return composition.shoes === piece.id;
    if (piece.category === 'headwear') return composition.headwear === piece.id;
    if (piece.category === 'outerwear') return composition.outerwear === piece.id;
    
    return false;
  };

  const getSelectedPieces = (): Array<{ piece: OutfitPiece; category: OutfitPieceCategory }> => {
    if (!composition) return [];
    
    const selected: Array<{ piece: OutfitPiece; category: OutfitPieceCategory }> = [];
    
    if (composition.top) {
      const piece = getPieceById(composition.top);
      if (piece) selected.push({ piece, category: 'top' });
    }
    if (composition.bottom) {
      const piece = getPieceById(composition.bottom);
      if (piece) selected.push({ piece, category: 'bottom' });
    }
    if (composition.shoes) {
      const piece = getPieceById(composition.shoes);
      if (piece) selected.push({ piece, category: 'shoes' });
    }
    if (composition.headwear && composition.headwear !== 'none' && composition.headwear !== 'none-headwear') {
      const piece = getPieceById(composition.headwear);
      if (piece) selected.push({ piece, category: 'headwear' });
    }
    if (composition.outerwear && composition.outerwear !== 'none' && composition.outerwear !== 'none-outerwear') {
      const piece = getPieceById(composition.outerwear);
      if (piece) selected.push({ piece, category: 'outerwear' });
    }
    if (composition.accessories) {
      composition.accessories.forEach((id) => {
        const piece = getPieceById(id);
        if (piece) selected.push({ piece, category: 'accessory' });
      });
    }
    
    return selected;
  };

  const selectedPieces = getSelectedPieces();

  if (!mounted) return null;

  return createPortal(
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-7xl max-h-[90vh] flex flex-col bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-white mb-1">Compose Outfit</h2>
            <p className="text-sm text-white/60">
              Select pieces from different categories to create your outfit
            </p>
          </div>
          
          {/* Quick Access to Saved Presets */}
          {influencerId && presets.length > 0 && (
            <div className="flex items-center gap-2 mr-4">
              <div className="h-8 w-px bg-white/10" />
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-400" />
                <select
                  value=""
                  onChange={(e) => {
                    const presetId = e.target.value;
                    if (presetId) {
                      const preset = presets.find(p => p.id === presetId);
                      if (preset) {
                        handleLoadPreset(preset);
                        setActiveCategory('all');
                      }
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-white/80 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <option value="">Load preset...</option>
                  {presets.map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name} {preset.isDefault && '⭐'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          <button
            onClick={onClose}
            className="flex items-center justify-center h-10 w-10 rounded-xl text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar & Favorites Filter */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
              <input
                type="text"
                placeholder="Search pieces..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-10 pl-9 pr-4 bg-[#0d0d0f] border border-white/10 rounded-xl text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white"
              />
            </div>
            <button
              onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap',
                showFavoritesOnly
                  ? 'bg-[var(--purple-500)] text-white shadow-lg shadow-[var(--purple-500)]/25'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className={cn('h-4 w-4', showFavoritesOnly && 'fill-current')}
              >
                <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
              </svg>
              <span className="hidden sm:inline">Favorites</span>
            </button>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex-shrink-0 flex items-center gap-3 px-6 py-4 border-b border-white/10 overflow-x-auto scroll-hidden">
          <button
            onClick={() => setActiveCategory('all')}
            className={cn(
              'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
              activeCategory === 'all'
                ? 'bg-white text-black'
                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
            )}
          >
            All
          </button>
          {OUTFIT_PIECE_CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all',
                activeCategory === cat
                  ? 'bg-white text-black'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
              )}
            >
              {CATEGORY_LABELS[cat]}
            </button>
          ))}
          {influencerId && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <button
                onClick={() => setActiveCategory('presets')}
                className={cn(
                  'px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2',
                  activeCategory === 'presets'
                    ? 'bg-white text-black'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                )}
              >
                <Star className="h-3.5 w-3.5" />
                Saved ({presets.length})
              </button>
            </>
          )}
          
          {/* Adult Content Badge */}
          {nsfwEnabled && (
            <>
              <div className="h-6 w-px bg-white/10" />
              <div className="px-3 py-1.5 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5 text-orange-400">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                <span className="text-xs font-medium text-orange-400">Adult Content Enabled</span>
              </div>
            </>
          )}
        </div>

        {/* Content Area */}
        <div className="flex-1 flex overflow-hidden">
          {/* Selected Pieces Preview */}
          <div className="w-64 border-r border-white/10 bg-[#0a0a0b] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">Selected</h3>
              {composition && (
                <button
                  onClick={handleClearAll}
                  className="text-xs text-white/40 hover:text-white transition-colors"
                >
                  Clear All
                </button>
              )}
            </div>
            
            {selectedPieces.length === 0 ? (
              <div className="text-center py-8">
                <div className="text-3xl mb-2">👕</div>
                <p className="text-xs text-white/40">
                  {nsfwEnabled ? 'No pieces selected (recommended for Adult Content)' : 'No pieces selected'}
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {OUTFIT_PIECE_CATEGORIES.map((cat) => {
                  const categoryPieces = selectedPieces.filter((sp) => sp.category === cat);
                  if (categoryPieces.length === 0) return null;
                  
                  return (
                    <div key={cat} className="space-y-1.5">
                      <div className="text-xs font-medium text-white/60 uppercase tracking-wide">
                        {CATEGORY_LABELS[cat]}
                      </div>
                      {categoryPieces.map(({ piece }) => (
                        <div
                          key={piece.id}
                          className="flex items-center justify-between p-2 rounded-lg bg-white/5 border border-white/10"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{piece.emoji}</span>
                            <span className="text-xs text-white font-medium">{piece.label}</span>
                          </div>
                          <button
                            onClick={() => handleClearPiece(cat)}
                            className="text-white/40 hover:text-white transition-colors"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pieces Grid or Presets */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeCategory === 'presets' ? (
              // Presets View
              isLoadingPresets ? (
                <div className="text-center py-12">
                  <p className="text-white/40 text-sm">Loading presets...</p>
                </div>
              ) : presets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-4xl mb-4">⭐</div>
                  <p className="text-white/60 text-sm mb-2">No saved presets yet</p>
                  <p className="text-white/40 text-xs">Compose an outfit and save it as a preset</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {presets.map((preset) => {
                    const presetPieces = [
                      preset.composition.top,
                      preset.composition.bottom,
                      preset.composition.shoes,
                    ].filter(Boolean).length;
                    
                    return (
                      <button
                        key={preset.id}
                        onClick={() => handleLoadPreset(preset)}
                        className={cn(
                          'group relative rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02] text-left p-4',
                          'hover:border-white/30'
                        )}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-sm font-semibold text-white">{preset.name}</h3>
                              {preset.isDefault && (
                                <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                              )}
                            </div>
                            {preset.description && (
                              <p className="text-xs text-white/50 mb-2">{preset.description}</p>
                            )}
                            <p className="text-xs text-white/40">
                              {presetPieces} piece{presetPieces !== 1 ? 's' : ''}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => handleEditPreset(preset, e)}
                              className="p-1.5 rounded-lg hover:bg-blue-500/20 text-blue-400"
                              title="Edit preset"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={(e) => handleDeletePreset(preset.id, e)}
                              className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400"
                              title="Delete preset"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )
            ) : availablePieces.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-white/40 text-sm">No pieces found</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                {availablePieces.map((piece) => {
                  const isSelected = isPieceSelected(piece);
                  
                  return (
                    <button
                      key={piece.id}
                      onClick={() => handlePieceSelect(piece)}
                      className={cn(
                        'group relative rounded-xl overflow-hidden border-2 transition-all bg-gradient-to-br from-white/5 to-white/[0.02]',
                        isSelected
                          ? 'border-[var(--purple-500)] ring-2 ring-[var(--purple-500)]/30'
                          : 'border-transparent hover:border-white/30'
                      )}
                    >
                      {/* Piece Display */}
                      <div className="relative aspect-[4/5] bg-white/5 overflow-hidden">
                        {piece.thumbnail ? (
                          <>
                            <Image
                              src={piece.thumbnail}
                              alt={piece.label}
                              fill
                              className="object-cover"
                              unoptimized
                              sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                            />
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            {/* Name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3 z-10">
                              <div className="text-sm font-semibold text-white mb-1">{piece.label}</div>
                              <div className="text-xs text-white/60 capitalize">{piece.category}</div>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center p-4 h-full">
                            {/* Emoji/Icon */}
                            <div className="text-5xl mb-3">{piece.emoji}</div>
                            
                            {/* Gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                            
                            {/* Name overlay */}
                            <div className="absolute bottom-0 left-0 right-0 p-3">
                              <div className="text-sm font-semibold text-white mb-1">{piece.label}</div>
                              <div className="text-xs text-white/60 capitalize">{piece.category}</div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Adult badge */}
                      {piece.isAdult && (
                        <div className="absolute top-2.5 right-2.5 z-10">
                          <Badge
                            variant="error"
                            size="default"
                            className="uppercase font-bold text-xs px-3 py-1.5 bg-red-600/90 text-white border-red-500 shadow-lg shadow-red-500/50"
                          >
                            18+
                          </Badge>
                        </div>
                      )}

                      {/* Like button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(piece.id);
                        }}
                        className={cn(
                          'absolute top-2 z-10 flex h-7 w-7 items-center justify-center rounded-full transition-all opacity-0 group-hover:opacity-100',
                          piece.isAdult ? 'right-12' : 'right-2',
                          isFavorited(piece.id)
                            ? 'bg-[var(--pink-500)] text-white opacity-100'
                            : 'bg-black/50 text-white/60 hover:bg-black/70 hover:text-white'
                        )}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className={cn('h-4 w-4', isFavorited(piece.id) && 'fill-current')}
                        >
                          <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                        </svg>
                      </button>

                      {/* Selection indicator */}
                      {isSelected && (
                        <div className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-[var(--purple-500)]">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-white">
                            <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/10 bg-[#0d0d0f]">
          <div className="flex items-center gap-3">
            {selectedPieces.length > 0 ? (
              <div className="flex items-center gap-2">
                <span className="text-white/50 text-sm">
                  {selectedPieces.length} piece{selectedPieces.length !== 1 ? 's' : ''} selected
                </span>
              </div>
            ) : (
              <span className="text-white/40 text-sm">
                {nsfwEnabled ? 'No pieces (recommended for Adult Content)' : 'No pieces selected'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            {influencerId && composition && (
              <button
                onClick={() => {
                  setEditingPreset(null);
                  setPresetName('');
                  setPresetDescription('');
                  setShowSaveDialog(true);
                }}
                className="px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-8 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors shadow-lg shadow-[var(--purple-500)]/25"
            >
              Apply
            </button>
          </div>
        </div>

        {/* Save Preset Dialog */}
        {showSaveDialog && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 backdrop-blur-sm">
            <div
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md bg-[#0d0d0f] border border-white/10 rounded-2xl shadow-2xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">
                  {editingPreset ? 'Edit Outfit Preset' : 'Save Outfit Preset'}
                </h3>
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setEditingPreset(null);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="e.g., Casual Streetwear"
                    className="w-full h-10 px-3 bg-[#0d0d0f] border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/80 mb-2">
                    Description (optional)
                  </label>
                  <textarea
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Add a description for this outfit preset..."
                    rows={3}
                    className="w-full px-3 py-2 bg-[#0d0d0f] border border-white/10 rounded-lg text-sm placeholder:text-white/40 focus:border-white/20 focus:ring-0 text-white resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowSaveDialog(false);
                    setEditingPreset(null);
                    setPresetName('');
                    setPresetDescription('');
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-white/5 text-white font-medium hover:bg-white/10 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePreset}
                  disabled={!presetName.trim() || isSaving}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-[var(--purple-500)] text-white font-semibold hover:bg-[var(--purple-600)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (editingPreset ? 'Updating...' : 'Saving...') : (editingPreset ? 'Update Preset' : 'Save Preset')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

