'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  FolderOpen,
  Search,
  Plus,
  Sparkles,
  Eye,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Star,
  Image as ImageIcon,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { routes } from '@/lib/routes';
import NextImage from 'next/image';

type LibraryCategory = 'prompts' | 'templates' | 'poses' | 'outfits';

const CATEGORY_INFO: Record<
  LibraryCategory,
  { label: string; icon: React.ReactNode; color: string }
> = {
  prompts: {
    label: 'Prompts',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'text-purple-400',
  },
  templates: {
    label: 'Templates',
    icon: <ImageIcon className="w-5 h-5" />,
    color: 'text-pink-400',
  },
  poses: {
    label: 'Poses',
    icon: <FolderOpen className="w-5 h-5" />,
    color: 'text-blue-400',
  },
  outfits: {
    label: 'Outfits',
    icon: <FolderOpen className="w-5 h-5" />,
    color: 'text-green-400',
  },
};

function formatDate(date: Date | string | null) {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(d);
}

export default function LibraryPage() {
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<LibraryCategory | 'all'>('prompts');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const limit = 50;

  // Fetch prompts
  const {
    data: promptsData,
    isLoading: isLoadingPrompts,
    refetch: refetchPrompts,
  } = adminTrpc.library.listPrompts.useQuery(
    {
      limit,
      offset: page * limit,
      search: search || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'published',
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: activeCategory === 'prompts' || activeCategory === 'all' }
  );

  // Fetch templates
  const {
    data: templatesData,
    isLoading: isLoadingTemplates,
    refetch: refetchTemplates,
  } = adminTrpc.library.listTemplates.useQuery(
    {
      limit,
      offset: page * limit,
      search: search || undefined,
      category: statusFilter === 'curated' ? 'curated' : statusFilter === 'popular' ? 'popular' : undefined,
      isCurated: statusFilter === 'curated' ? true : undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: activeCategory === 'templates' || activeCategory === 'all' }
  );

  // Fetch outfit presets
  const {
    data: outfitsData,
    isLoading: isLoadingOutfits,
    refetch: refetchOutfits,
  } = adminTrpc.library.listOutfitPresets.useQuery(
    {
      limit,
      offset: page * limit,
      search: search || undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: activeCategory === 'outfits' || activeCategory === 'all' }
  );

  // Fetch prompt sets (profile picture sets)
  const {
    data: promptSetsData,
    isLoading: isLoadingPromptSets,
    refetch: refetchPromptSets,
  } = adminTrpc.library.listPromptSets.useQuery(
    {
      limit,
      offset: page * limit,
      search: search || undefined,
      isSystemSet: statusFilter === 'system' ? true : undefined,
      isPublic: statusFilter === 'public' ? true : undefined,
      sortBy: 'createdAt',
      sortOrder: 'desc',
    },
    { enabled: activeCategory === 'poses' || activeCategory === 'all' }
  );

  // Mutations for prompts
  const togglePromptStatus = adminTrpc.library.togglePromptStatus.useMutation({
    onSuccess: () => {
      toast.success('Prompt status updated');
      refetchPrompts();
    },
    onError: (error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });

  const deletePrompt = adminTrpc.library.deletePrompt.useMutation({
    onSuccess: () => {
      toast.success('Prompt deleted successfully');
      refetchPrompts();
    },
    onError: (error) => {
      toast.error('Failed to delete prompt', { description: error.message });
    },
  });

  // Mutations for templates
  const curateTemplate = adminTrpc.library.curateTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template curation updated');
      refetchTemplates();
    },
    onError: (error) => {
      toast.error('Failed to update curation', { description: error.message });
    },
  });

  const deleteTemplate = adminTrpc.library.deleteTemplate.useMutation({
    onSuccess: () => {
      toast.success('Template deleted successfully');
      refetchTemplates();
    },
    onError: (error) => {
      toast.error('Failed to delete template', { description: error.message });
    },
  });

  // Mutations for outfit presets
  const deleteOutfitPreset = adminTrpc.library.deleteOutfitPreset.useMutation({
    onSuccess: () => {
      toast.success('Outfit preset deleted successfully');
      refetchOutfits();
    },
    onError: (error) => {
      toast.error('Failed to delete outfit preset', { description: error.message });
    },
  });

  // Mutations for prompt sets
  const deletePromptSet = adminTrpc.library.deletePromptSet.useMutation({
    onSuccess: () => {
      toast.success('Prompt set deleted successfully');
      refetchPromptSets();
    },
    onError: (error) => {
      toast.error('Failed to delete prompt set', { description: error.message });
    },
  });

  const togglePromptSetPublic = adminTrpc.library.togglePromptSetPublic.useMutation({
    onSuccess: () => {
      toast.success('Prompt set status updated');
      refetchPromptSets();
    },
    onError: (error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });

  const prompts = promptsData?.prompts || [];
  const templates = templatesData?.templates || [];
  const outfits = outfitsData?.presets || [];
  const promptSets = promptSetsData?.sets || [];

  const promptsPagination = promptsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };
  const templatesPagination = templatesData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };
  const outfitsPagination = outfitsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };
  const promptSetsPagination = promptSetsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const isLoading =
    isLoadingPrompts ||
    isLoadingTemplates ||
    isLoadingOutfits ||
    isLoadingPromptSets;

  const pagination =
    activeCategory === 'templates'
      ? templatesPagination
      : activeCategory === 'outfits'
        ? outfitsPagination
        : activeCategory === 'poses'
          ? promptSetsPagination
          : promptsPagination;

  const handleTogglePromptStatus = async (promptId: string, currentStatus: boolean) => {
    await togglePromptStatus.mutateAsync({
      promptId,
      isActive: !currentStatus,
    });
  };

  const handleDeletePrompt = async (promptId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this prompt (optional):');
      await deletePrompt.mutateAsync({
        promptId,
        reason: reason || undefined,
      });
    }
  };

  const handleCurateTemplate = async (templateId: string, currentCurated: boolean) => {
    await curateTemplate.mutateAsync({
      templateId,
      curated: !currentCurated,
    });
  };

  const handleDeleteTemplate = async (templateId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this template (optional):');
      await deleteTemplate.mutateAsync({
        templateId,
        reason: reason || undefined,
      });
    }
  };

  const handleDeleteOutfit = async (presetId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this outfit preset (optional):');
      await deleteOutfitPreset.mutateAsync({
        presetId,
        reason: reason || undefined,
      });
    }
  };

  const handleDeletePromptSet = async (setId: string, name: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${name}"? This action cannot be undone.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this prompt set (optional):');
      await deletePromptSet.mutateAsync({
        setId,
        reason: reason || undefined,
      });
    }
  };

  const handleTogglePromptSetPublic = async (setId: string, currentPublic: boolean) => {
    await togglePromptSetPublic.mutateAsync({
      setId,
      isPublic: !currentPublic,
    });
  };

  const showPrompts = activeCategory === 'prompts' || activeCategory === 'all';
  const showTemplates = activeCategory === 'templates' || activeCategory === 'all';
  const showOutfits = activeCategory === 'outfits' || activeCategory === 'all';
  const showPromptSets = activeCategory === 'poses' || activeCategory === 'all';

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-primary" />
            Content Library
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage prompts, templates, poses, and outfits
          </p>
        </div>
        {(showPrompts || showTemplates || showOutfits || showPromptSets) && (
          <button
            onClick={() => {
              if (showPrompts) {
                toast.info('Create prompt feature coming soon');
              } else if (showTemplates) {
                toast.info('Create template feature coming soon');
              } else if (showOutfits) {
                toast.info('Create outfit preset feature coming soon');
              } else {
                toast.info('Create prompt set feature coming soon');
              }
            }}
            className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
          >
            <Plus className="w-5 h-5" />
            Add New{' '}
            {showPrompts
              ? 'Prompt'
              : showTemplates
                ? 'Template'
                : showOutfits
                  ? 'Outfit'
                  : 'Prompt Set'}
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex overflow-x-auto gap-2 pb-2 scroll-hidden">
        <button
          onClick={() => setActiveCategory('all')}
          className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
            activeCategory === 'all'
              ? 'bg-primary/20 text-primary'
              : 'bg-secondary text-muted-foreground hover:text-foreground'
          }`}
        >
          All
        </button>
        {(Object.keys(CATEGORY_INFO) as LibraryCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`min-h-[44px] px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
              activeCategory === cat
                ? 'bg-primary/20 text-primary'
                : 'bg-secondary text-muted-foreground hover:text-foreground'
            }`}
          >
            {CATEGORY_INFO[cat].icon}
            {CATEGORY_INFO[cat].label}
          </button>
        ))}
      </div>

      {/* Filters */}
      {(showPrompts || showTemplates || showOutfits || showPromptSets) && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder={`Search ${
                showPrompts
                  ? 'prompts'
                  : showTemplates
                    ? 'templates'
                    : showOutfits
                      ? 'outfits'
                      : 'prompt sets'
              }...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {showPrompts ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          ) : showTemplates ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Templates</option>
              <option value="curated">Curated</option>
              <option value="popular">Popular</option>
            </select>
          ) : showPromptSets ? (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Sets</option>
              <option value="system">System Sets</option>
              <option value="public">Public Sets</option>
            </select>
          ) : null}
        </div>
      )}

      {/* Items grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="aspect-video bg-secondary/50 rounded-lg mb-4" />
              <div className="h-4 bg-secondary/50 rounded mb-2" />
              <div className="h-3 bg-secondary/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (showPrompts && prompts.length === 0) ||
        (showTemplates && templates.length === 0) ||
        (showOutfits && outfits.length === 0) ||
        (showPromptSets && promptSets.length === 0) ? (
        <div className="admin-card text-center py-12">
          {showPrompts ? (
            <Sparkles className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          ) : showTemplates ? (
            <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          ) : showOutfits ? (
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          ) : (
            <FolderOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          )}
          <p className="text-muted-foreground">
            No{' '}
            {showPrompts
              ? 'prompts'
              : showTemplates
                ? 'templates'
                : showOutfits
                  ? 'outfits'
                  : 'prompt sets'}{' '}
            found
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Prompts */}
            {showPrompts &&
              prompts.map((prompt) => {
              const categoryInfo = CATEGORY_INFO.prompts;
              return (
                <div key={prompt.id} className="admin-card space-y-4">
                  {/* Thumbnail placeholder */}
                  <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center bg-gradient-to-br from-purple-500/10 to-pink-500/10">
                    <div className={categoryInfo.color}>{categoryInfo.icon}</div>
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm ${categoryInfo.color}`}>
                        {categoryInfo.label}
                      </span>
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          prompt.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {prompt.isActive ? 'Published' : 'Draft'}
                      </span>
                      {prompt.rating !== 'sfw' && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                          {prompt.rating.toUpperCase()}
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium">{prompt.name}</h3>
                    {prompt.description && (
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {prompt.description}
                      </p>
                    )}
                    <p className="text-sm text-muted-foreground mt-1">
                      {(prompt.usageCount ?? 0).toLocaleString()} uses •{' '}
                      {formatDate(prompt.createdAt)}
                    </p>
                    {prompt.category && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Category: {prompt.category.replace('_', ' ')}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <button
                      onClick={() => {
                        // TODO: Open preview modal
                        toast.info('Preview feature coming soon');
                      }}
                      className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Preview
                    </button>
                    <button
                      onClick={() => {
                        // TODO: Open edit modal
                        toast.info('Edit feature coming soon');
                      }}
                      className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleTogglePromptStatus(prompt.id, prompt.isActive ?? false)}
                      disabled={togglePromptStatus.isPending}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-secondary rounded-lg hover:bg-secondary/80 transition-colors disabled:opacity-50"
                      title={prompt.isActive ? 'Unpublish' : 'Publish'}
                    >
                      {togglePromptStatus.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : prompt.isActive ? (
                        <ToggleRight className="w-5 h-5 text-green-400" />
                      ) : (
                        <ToggleLeft className="w-5 h-5 text-muted-foreground" />
                      )}
                    </button>
                    <button
                      onClick={() => handleDeletePrompt(prompt.id, prompt.name)}
                      disabled={deletePrompt.isPending}
                      className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                      title="Delete"
                    >
                      {deletePrompt.isPending ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Trash2 className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              );
              })}

            {/* Outfit Presets */}
            {showOutfits &&
              outfits.map((outfit) => {
                const categoryInfo = CATEGORY_INFO.outfits;
                return (
                  <div key={outfit.id} className="admin-card space-y-4">
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500/10 to-blue-500/10">
                      <div className={categoryInfo.color}>{categoryInfo.icon}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        {outfit.isDefault && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                            Default
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">{outfit.name}</h3>
                      {outfit.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {outfit.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {formatDate(outfit.createdAt)}
                      </p>
                      {outfit.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By:{' '}
                          <Link
                            href={routes.user.detail(outfit.user.id)}
                            className="hover:text-primary"
                          >
                            {outfit.user.email}
                          </Link>
                        </p>
                      )}
                      {outfit.influencer && (
                        <p className="text-xs text-muted-foreground mt-1">
                          For: {outfit.influencer.name}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          toast.info('Preview feature coming soon');
                        }}
                        className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleDeleteOutfit(outfit.id, outfit.name)}
                        disabled={deleteOutfitPreset.isPending}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteOutfitPreset.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}

            {/* Prompt Sets (Profile Picture Sets) */}
            {showPromptSets &&
              promptSets.map((set) => {
                const categoryInfo = CATEGORY_INFO.poses; // Using poses icon for prompt sets
                return (
                  <div key={set.id} className="admin-card space-y-4">
                    <div className="aspect-video bg-secondary rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <div className={categoryInfo.color}>{categoryInfo.icon}</div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm ${categoryInfo.color}`}>
                          Profile Picture Set
                        </span>
                        {set.isSystemSet && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                            System
                          </span>
                        )}
                        {set.isPublic && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            Public
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">{set.name}</h3>
                      {set.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {set.description}
                        </p>
                      )}
                      {set.style && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Style: {set.style}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {Number(set.usageCount || 0).toLocaleString()} uses •{' '}
                        {formatDate(set.createdAt)}
                      </p>
                      {set.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By:{' '}
                          <Link
                            href={routes.user.detail(set.user.id)}
                            className="hover:text-primary"
                          >
                            {set.user.email}
                          </Link>
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          toast.info('Preview feature coming soon');
                        }}
                        className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      {!set.isSystemSet && (
                        <button
                          onClick={() =>
                            handleTogglePromptSetPublic(set.id, set.isPublic ?? false)
                          }
                          disabled={togglePromptSetPublic.isPending}
                          className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                            set.isPublic
                              ? 'bg-green-500/10 text-green-400 hover:bg-green-500/20'
                              : 'bg-secondary hover:bg-secondary/80'
                          }`}
                          title={set.isPublic ? 'Make Private' : 'Make Public'}
                        >
                          {togglePromptSetPublic.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <ToggleRight
                              className={`w-5 h-5 ${set.isPublic ? 'text-green-400' : 'text-muted-foreground'}`}
                            />
                          )}
                        </button>
                      )}
                      {!set.isSystemSet && (
                        <button
                          onClick={() => handleDeletePromptSet(set.id, set.name)}
                          disabled={deletePromptSet.isPending}
                          className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deletePromptSet.isPending ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <Trash2 className="w-5 h-5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

            {/* Templates */}
            {showTemplates &&
              templates.map((template) => {
                const categoryInfo = CATEGORY_INFO.templates;
                return (
                  <div key={template.id} className="admin-card space-y-4">
                    {/* Thumbnail */}
                    <div className="aspect-video bg-secondary rounded-lg overflow-hidden relative">
                      {template.thumbnailUrl || template.previewImageUrl ? (
                        <NextImage
                          src={template.thumbnailUrl || template.previewImageUrl || ''}
                          alt={template.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-purple-500/10 flex items-center justify-center">
                          <div className={categoryInfo.color}>{categoryInfo.icon}</div>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-sm ${categoryInfo.color}`}>
                          {categoryInfo.label}
                        </span>
                        {template.isCurated && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            Curated
                          </span>
                        )}
                        {template.isPublic && (
                          <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                            Public
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium">{template.name}</h3>
                      {template.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {template.description}
                        </p>
                      )}
                      <p className="text-sm text-muted-foreground mt-1">
                        {(template.usageCount ?? 0).toLocaleString()} uses •{' '}
                        {(template.likesCount ?? 0).toLocaleString()} likes •{' '}
                        {formatDate(template.createdAt)}
                      </p>
                      {template.user && (
                        <p className="text-xs text-muted-foreground mt-1">
                          By:{' '}
                          <Link
                            href={routes.user.detail(template.user.id)}
                            className="hover:text-primary"
                          >
                            {template.user.email}
                          </Link>
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-border">
                      <button
                        onClick={() => {
                          // TODO: Open preview modal
                          toast.info('Preview feature coming soon');
                        }}
                        className="min-h-[44px] flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-secondary rounded-lg text-sm hover:bg-secondary/80 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        Preview
                      </button>
                      <button
                        onClick={() => handleCurateTemplate(template.id, template.isCurated ?? false)}
                        disabled={curateTemplate.isPending}
                        className={`min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg transition-colors disabled:opacity-50 ${
                          template.isCurated
                            ? 'bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20'
                            : 'bg-secondary hover:bg-secondary/80'
                        }`}
                        title={template.isCurated ? 'Uncurate' : 'Curate'}
                      >
                        {curateTemplate.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Star className={`w-5 h-5 ${template.isCurated ? 'fill-current' : ''}`} />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTemplate(template.id, template.name)}
                        disabled={deleteTemplate.isPending}
                        className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                        title="Delete"
                      >
                        {deleteTemplate.isPending ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <Trash2 className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* Pagination */}
          {pagination.total > limit && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {page * limit + 1}-
                {Math.min((page + 1) * limit, pagination.total)} of{' '}
                {pagination.total}
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasMore}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center bg-secondary rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
