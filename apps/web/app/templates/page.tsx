'use client';

import * as React from 'react';
import { PageContainer, FadeInUp } from '@ryla/ui';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { TemplateSearch } from '../../components/studio/templates/template-search';
import { trpc } from '../../lib/trpc';
import { useRouter } from 'next/navigation';
import { LayoutGrid, Sparkles } from 'lucide-react';
import { cn } from '@ryla/ui';
import {
  TypeTabs,
  SortButtons,
  ContentTypeFilter,
  CategoryPills,
  TemplateSetCard,
  InfluencerSelectionModal,
  TemplateDetailModal,
} from './components';
import { useTemplateFilters, useTemplateGalleryAnalytics } from './hooks';
import { LockScreen } from '../../components/ui/lock-screen';
import type { TabType, SortOption, Category } from './components';
import type { ContentType } from './hooks/useTemplateFilters';

// Feature flag: Set to true when ready to launch new template gallery
const NEW_GALLERY_ENABLED = true;

function TemplatesGalleryNew() {
  const router = useRouter();
  const {
    filters,
    tabType,
    sortOption,
    contentType,
    categorySlug,
    searchQuery,
    likedOnly,
    selectedContentTypes,
    setTabType,
    setSortOption,
    setContentType,
    setMultipleContentTypes,
    setCategorySlug,
    setSearchQuery,
    toggleLikedOnly,
  } = useTemplateFilters();

  // Analytics
  const analytics = useTemplateGalleryAnalytics();

  // Track filter changes
  const handleTabChange = React.useCallback((newTab: TabType) => {
    const previousTab = tabType;
    setTabType(newTab);
    analytics.trackTabChanged(newTab, previousTab);
  }, [tabType, setTabType, analytics]);

  const handleSortChange = React.useCallback((newSort: SortOption) => {
    const previousSort = sortOption;
    setSortOption(newSort);
    analytics.trackSortChanged(newSort, previousSort);
  }, [sortOption, setSortOption, analytics]);

  const handleContentTypeChange = React.useCallback((newType: ContentType) => {
    const previousType = contentType;
    setContentType(newType);
    analytics.trackContentTypeChanged(newType, previousType);
  }, [contentType, setContentType, analytics]);

  const handleCategoryChange = React.useCallback((slug: string | null, name?: string) => {
    setCategorySlug(slug);
    analytics.trackCategorySelected(slug, name);
  }, [setCategorySlug, analytics]);

  // Modal state
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<string | null>(null);
  const [selectedIsSet, setSelectedIsSet] = React.useState(false);
  const [influencerModalOpen, setInfluencerModalOpen] = React.useState(false);
  const [applyTemplateId, setApplyTemplateId] = React.useState<string | null>(null);

  // Check if user has any influencers
  const { data: charactersData } = trpc.character.list.useQuery();
  const hasInfluencers = (charactersData?.items?.length ?? 0) > 0;

  // Fetch categories
  const { data: categoriesData, isLoading: categoriesLoading } = trpc.templateCategories.getTree.useQuery({});

  // Transform categories to flat list for pills
  const flatCategories = React.useMemo((): Category[] => {
    if (!categoriesData?.tree) return [];
    const result: Category[] = [];
    
    const flatten = (cats: typeof categoriesData.tree) => {
      for (const cat of cats) {
        result.push({
          id: cat.id,
          slug: cat.slug,
          name: cat.name,
          icon: cat.icon ?? undefined,
        });
        if ((cat as any).children) {
          flatten((cat as any).children);
        }
      }
    };
    
    flatten(categoriesData.tree);
    return result;
  }, [categoriesData]);

  // Fetch templates
  const { data: templatesData, isLoading: templatesLoading } = trpc.templates.list.useQuery({
    category: categorySlug ? undefined : filters.category,
    search: searchQuery || undefined,
    sort: sortOption === 'popular' ? 'popular' : sortOption === 'trending' ? 'trending' : sortOption === 'new' ? 'new' : 'recent',
    page: 1,
    limit: 24,
  });

  // Derive single contentType for API from selectedContentTypes (API accepts one type or all)
  const activeContentTypes = selectedContentTypes.filter(t => t !== 'all');
  const apiContentType = activeContentTypes.length === 1 ? activeContentTypes[0] : undefined;

  // Fetch template sets
  const { data: setsData, isLoading: setsLoading } = trpc.templateSets.list.useQuery({
    search: searchQuery || undefined,
    sort: sortOption === 'popular' ? 'popular' : sortOption === 'trending' ? 'trending' : sortOption === 'new' ? 'new' : 'recent',
    contentType: apiContentType,
    page: 1,
    limit: 24,
  }, {
    enabled: tabType === 'sets' || tabType === 'all',
  });

  // Fetch like statuses for current user (templates and sets lists don't include isLiked)
  const templateIds = React.useMemo(
    () => (templatesData?.templates ?? []).map((t) => t.id),
    [templatesData?.templates]
  );
  const setIds = React.useMemo(
    () => (setsData?.sets ?? []).map((s) => s.id),
    [setsData?.sets]
  );
  const { data: templateLikeStatuses } = trpc.templateLikes.getLikeStatuses.useQuery(
    { templateIds },
    { enabled: templateIds.length > 0 }
  );
  const { data: setLikeStatuses } = trpc.templateLikes.getSetLikeStatuses.useQuery(
    { setIds },
    { enabled: setIds.length > 0 }
  );

  // Combine templates and sets for "all" view
  const combinedItems = React.useMemo(() => {
    const statusesT = templateLikeStatuses?.statuses ?? {};
    const statusesS = setLikeStatuses?.statuses ?? {};

    const templates = (templatesData?.templates ?? []).map((t) => ({
      ...t,
      isSet: false,
      memberCount: undefined,
      memberThumbnails: undefined,
      contentType: (t.config?.nsfw ? 'image' : 'image') as ContentType, // Default to image for now
      likesCount: (t as any).likesCount ?? 0,
      isLiked: Boolean(statusesT[t.id]),
    }));

    const sets = (setsData?.sets ?? []).map((s) => {
      // Extract member thumbnails if available
      const members = (s as any).members || [];
      const memberThumbnails = members
        .slice(0, 4)
        .map((m: any) => m.thumbnailUrl || m.previewImageUrl)
        .filter(Boolean);

      return {
        id: s.id,
        name: s.name,
        description: s.description,
        previewImageUrl: s.previewImageUrl || '',
        thumbnailUrl: s.thumbnailUrl || s.previewImageUrl || '',
        isSet: true,
        memberCount: (s as any).memberCount ?? 0,
        memberThumbnails,
        contentType: ((s as any).contentType || 'mixed') as ContentType,
        likesCount: (s as any).likesCount ?? 0,
        usageCount: (s as any).usageCount ?? 0,
        isLiked: Boolean(statusesS[s.id]),
      };
    });

    let items = tabType === 'templates' ? templates : tabType === 'sets' ? sets : [...templates, ...sets];
    
    // Filter by content type if not 'all'
    const activeTypes = selectedContentTypes.filter(t => t !== 'all');
    if (activeTypes.length > 0) {
      items = items.filter(item => activeTypes.includes(item.contentType));
    }
    
    // Filter by liked only if enabled
    if (likedOnly) {
      items = items.filter(item => item.isLiked);
    }
    
    return items;
  }, [templatesData, setsData, tabType, selectedContentTypes, likedOnly, templateLikeStatuses?.statuses, setLikeStatuses?.statuses]);

  const isLoading = templatesLoading || (tabType !== 'templates' && setsLoading);

  // Handlers
  const handleCardClick = (id: string, isSet: boolean, position?: number) => {
    setSelectedTemplateId(id);
    setSelectedIsSet(isSet);
    analytics.trackCardClicked(id, isSet, position ?? 0);
  };

  const handleApplyClick = (id: string, isSet = false) => {
    setApplyTemplateId(id);
    setInfluencerModalOpen(true);
    analytics.trackApplyModalOpened(id, isSet);
  };

  const handleInfluencerSelect = (influencerId: string) => {
    if (applyTemplateId) {
      const item = combinedItems.find(i => i.id === applyTemplateId);
      const isSet = item?.isSet ?? false;
      analytics.trackTemplateApplied(applyTemplateId, isSet, influencerId, 'modal');
      router.push(`/studio?template=${applyTemplateId}&influencer=${influencerId}`);
    }
    setInfluencerModalOpen(false);
  };

  // Like mutations
  const utils = trpc.useUtils();
  const likeMutation = trpc.templateLikes.toggle.useMutation({
    onSuccess: (result) => {
      utils.templates.list.invalidate();
      utils.templateLikes.getLikeStatuses.invalidate();
      if (result.liked) {
        analytics.trackTemplateLiked(result.templateId ?? '', result.likesCount);
      } else {
        analytics.trackTemplateUnliked(result.templateId ?? '', result.likesCount);
      }
    },
  });
  const setLikeMutation = trpc.templateLikes.toggleSet.useMutation({
    onSuccess: (result) => {
      utils.templateSets.list.invalidate();
      utils.templateLikes.getSetLikeStatuses.invalidate();
      if (result.liked) {
        analytics.trackSetLiked(result.setId ?? '', result.likesCount);
      } else {
        analytics.trackSetUnliked(result.setId ?? '', result.likesCount);
      }
    },
  });

  const handleLikeToggle = React.useCallback((id: string, isSet: boolean) => {
    if (isSet) {
      setLikeMutation.mutate({ setId: id });
    } else {
      likeMutation.mutate({ templateId: id });
    }
  }, [likeMutation, setLikeMutation]);

  // Show lock screen if no influencers exist
  if (!hasInfluencers) {
    return (
      <PageContainer maxWidth="full" className="relative">
        <LockScreen
          title="Templates Locked"
          description="Create your first AI influencer to unlock the Template Gallery and discover curated presets for your content."
          createButtonText="Create Influencer"
          createButtonHref="/wizard/step-0"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" className="relative">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[10%] -right-[5%] h-[600px] w-[600px] opacity-40 shrink-0"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.2) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
        <div
          className="absolute -bottom-[10%] -left-[5%] h-[600px] w-[600px] opacity-30 shrink-0"
          style={{
            background:
              'radial-gradient(circle, rgba(236, 72, 153, 0.15) 0%, transparent 70%)',
            filter: 'blur(100px)',
          }}
        />
      </div>

      {/* Header */}
      <FadeInUp>
        <div className="mb-8 md:mb-12 flex flex-col items-center text-center px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider bg-[var(--purple-500)]/10 text-[var(--purple-400)] border border-[var(--purple-500)]/20 mb-4">
            <Sparkles className="h-3 w-3" />
            Content Library
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-[var(--text-primary)] tracking-tight mb-3">
            Template Gallery
          </h1>
          <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-xl">
            Discover curated templates and sets to create stunning content instantly
          </p>
        </div>
      </FadeInUp>

      {/* Filters Section - Studio Style */}
      <FadeInUp delay={100}>
        <div className="space-y-3 mb-4 md:mb-5">
          {/* Top Row: Tabs + Search in round container */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            {/* Tabs in round box */}
            <div className="flex-shrink-0">
              <TypeTabs
                value={tabType}
                onChange={handleTabChange}
                counts={{
                  templates: templatesData?.templates?.length,
                  sets: setsData?.sets?.length,
                  all: (templatesData?.templates?.length ?? 0) + (setsData?.sets?.length ?? 0),
                }}
              />
            </div>
            
            {/* Search bar */}
            <div className="flex-1 min-w-0">
              <TemplateSearch
                query={searchQuery}
                onQueryChange={setSearchQuery}
                placeholder="Search templates..."
              />
            </div>
          </div>

          {/* Two separate filter bars with even spacing and aligned borders */}
          <div className="flex flex-col gap-4 relative z-50 w-full">
            {/* Top bar: Sort + Type + Liked */}
            <div className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-3">
              <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
                <div className="flex-shrink-0">
                  <SortButtons value={sortOption} onChange={handleSortChange} />
                </div>
                <div className="flex-shrink-0">
                  <ContentTypeFilter 
                    value={contentType} 
                    onChange={setContentType}
                    selectedTypes={selectedContentTypes}
                    onMultiChange={setMultipleContentTypes}
                    multiSelect={true}
                  />
                </div>
                <div className="flex-shrink-0">
                  <button
                    onClick={toggleLikedOnly}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all',
                      'focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--purple-500)]',
                      likedOnly
                        ? 'text-pink-400 bg-pink-500/10 border border-pink-500/30'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]'
                    )}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={cn('h-4 w-4', likedOnly && 'fill-current')}>
                      <path d="M9.653 16.915l-.005-.003-.019-.01a20.759 20.759 0 01-1.162-.682 22.045 22.045 0 01-2.582-1.9C4.045 12.733 2 10.352 2 7.5a4.5 4.5 0 018-2.828A4.5 4.5 0 0118 7.5c0 2.852-2.044 5.233-3.885 6.82a22.049 22.049 0 01-3.744 2.582l-.019.01-.005.003h-.002a.739.739 0 01-.69.001l-.002-.001z" />
                    </svg>
                    <span className="hidden sm:inline">Liked</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom bar: Category tags in their own card */}
            <div className="w-full bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-3">
              <CategoryPills
                categories={flatCategories}
                selectedSlug={categorySlug}
                onChange={(slug) => {
                  const category = flatCategories.find(c => c.slug === slug);
                  handleCategoryChange(slug, category?.name);
                }}
                isLoading={categoriesLoading}
              />
            </div>
          </div>
        </div>
      </FadeInUp>

      {/* Template Grid */}
      <FadeInUp delay={200}>
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-xl bg-[var(--bg-subtle)] animate-pulse"
              />
            ))}
          </div>
        ) : combinedItems.length === 0 ? (
          <div className="text-center py-16 md:py-20 px-4">
            <LayoutGrid className="h-12 w-12 md:h-16 md:w-16 mx-auto text-[var(--text-tertiary)] mb-4" />
            <h3 className="text-lg md:text-xl font-semibold text-[var(--text-primary)] mb-2">
              No templates found
            </h3>
            <p className="text-sm md:text-base text-[var(--text-secondary)] max-w-md mx-auto">
              Try adjusting your filters or search query to find more templates.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {combinedItems.map((item, index) => (
              <TemplateSetCard
                key={item.id}
                id={item.id}
                name={item.name}
                previewImageUrl={item.previewImageUrl}
                thumbnailUrl={item.thumbnailUrl}
                likesCount={item.likesCount}
                contentType={item.contentType}
                isSet={item.isSet}
                isLiked={item.isLiked}
                memberCount={item.memberCount}
                memberThumbnails={item.memberThumbnails}
                onClick={() => handleCardClick(item.id, item.isSet, index)}
                onApply={() => handleApplyClick(item.id, item.isSet)}
                onLikeToggle={() => handleLikeToggle(item.id, item.isSet)}
              />
            ))}
          </div>
        )}
      </FadeInUp>

      {/* Template Detail Modal */}
      <TemplateDetailModal
        templateId={selectedTemplateId}
        isSet={selectedIsSet}
        isOpen={!!selectedTemplateId}
        onClose={() => setSelectedTemplateId(null)}
        onApply={handleApplyClick}
      />

      {/* Influencer Selection Modal */}
      <InfluencerSelectionModal
        isOpen={influencerModalOpen}
        onClose={() => setInfluencerModalOpen(false)}
        onSelect={handleInfluencerSelect}
        templateName={combinedItems.find(i => i.id === applyTemplateId)?.name}
      />
    </PageContainer>
  );
}

// Legacy page component for backwards compatibility
function TemplatesContentLegacy() {
  const router = useRouter();
  const {
    filters,
    searchQuery,
    viewMode,
    sortBy,
    updateFilter,
    setSearchQuery,
    setViewMode,
    setSortBy,
  } = useTemplateFilters();
  const [selectedTemplateId, setSelectedTemplateId] = React.useState<
    string | null
  >(null);

  // Check if user has any influencers
  const { data: charactersData } = trpc.character.list.useQuery();
  const hasInfluencers = (charactersData?.items?.length ?? 0) > 0;

  const { data, isLoading, error } = trpc.templates.list.useQuery({
    category: filters.category,
    scene: filters.scene,
    environment: filters.environment,
    aspectRatio: filters.aspectRatio,
    nsfw: filters.nsfw,
    search: searchQuery || undefined,
    page: 1,
    limit: 24,
  });

  const handleTemplateClick = React.useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
  }, []);

  const handleTemplateApply = React.useCallback(
    (templateId: string) => {
      router.push(`/studio?template=${templateId}`);
    },
    [router]
  );

  // Show lock screen if no influencers exist
  if (!hasInfluencers) {
    return (
      <PageContainer maxWidth="full" className="relative">
        <LockScreen
          title="Templates Locked"
          description="Create your first AI influencer to unlock the Template Gallery and discover curated presets for your content."
          createButtonText="Create Influencer"
          createButtonHref="/wizard/step-0"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="full" className="relative">
      <div className="text-center py-16">
        <p className="text-[var(--text-secondary)]">
          Legacy template gallery - enable NEW_GALLERY_ENABLED flag
        </p>
      </div>
    </PageContainer>
  );
}

function TemplatesContent() {
  return NEW_GALLERY_ENABLED ? <TemplatesGalleryNew /> : <TemplatesContentLegacy />;
}

export default function TemplatesPage() {
  return (
    <ProtectedRoute>
      <TemplatesContent />
    </ProtectedRoute>
  );
}
