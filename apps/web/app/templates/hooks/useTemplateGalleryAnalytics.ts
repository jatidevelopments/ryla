/**
 * Template Gallery Analytics Hook
 * 
 * Provides analytics tracking for template gallery interactions.
 * IN-011: EP-047, EP-049
 */

import { useCallback } from 'react';
import { capture, TEMPLATE_GALLERY_EVENTS } from '@ryla/analytics';
import type { TabType, SortOption, ContentType } from '../components';

export function useTemplateGalleryAnalytics() {
  // Navigation events
  const trackTabChanged = useCallback(
    (tabType: TabType, previousTab: TabType) => {
      capture(TEMPLATE_GALLERY_EVENTS.TAB_CHANGED, {
        tab_type: tabType,
        previous_tab: previousTab,
      });
    },
    []
  );

  const trackSortChanged = useCallback(
    (sortOption: SortOption, previousSort: SortOption) => {
      capture(TEMPLATE_GALLERY_EVENTS.SORT_CHANGED, {
        sort_option: sortOption,
        previous_sort: previousSort,
      });
    },
    []
  );

  const trackContentTypeChanged = useCallback(
    (contentType: ContentType, previousType: ContentType) => {
      capture(TEMPLATE_GALLERY_EVENTS.CONTENT_TYPE_CHANGED, {
        content_type: contentType,
        previous_type: previousType,
      });
    },
    []
  );

  const trackCategorySelected = useCallback(
    (categorySlug: string | null, categoryName?: string) => {
      capture(TEMPLATE_GALLERY_EVENTS.CATEGORY_SELECTED, {
        category_slug: categorySlug,
        category_name: categoryName,
      });
    },
    []
  );

  const trackExpanded = useCallback((expanded: boolean) => {
    capture(TEMPLATE_GALLERY_EVENTS.EXPANDED, { expanded });
  }, []);

  // Template interactions
  const trackCardClicked = useCallback(
    (templateId: string, isSet: boolean, position: number) => {
      capture(TEMPLATE_GALLERY_EVENTS.CARD_CLICKED, {
        template_id: templateId,
        is_set: isSet,
        position,
      });
    },
    []
  );

  const trackApplyModalOpened = useCallback(
    (templateId: string, isSet: boolean) => {
      capture(TEMPLATE_GALLERY_EVENTS.APPLY_MODAL_OPENED, {
        template_id: templateId,
        is_set: isSet,
      });
    },
    []
  );

  const trackTemplateApplied = useCallback(
    (
      templateId: string,
      isSet: boolean,
      influencerId: string,
      source: 'modal' | 'direct'
    ) => {
      capture(TEMPLATE_GALLERY_EVENTS.TEMPLATE_APPLIED, {
        template_id: templateId,
        is_set: isSet,
        influencer_id: influencerId,
        source,
      });
    },
    []
  );

  // Likes
  const trackTemplateLiked = useCallback(
    (templateId: string, likesCount: number) => {
      capture(TEMPLATE_GALLERY_EVENTS.TEMPLATE_LIKED, {
        template_id: templateId,
        likes_count: likesCount,
      });
    },
    []
  );

  const trackTemplateUnliked = useCallback(
    (templateId: string, likesCount: number) => {
      capture(TEMPLATE_GALLERY_EVENTS.TEMPLATE_UNLIKED, {
        template_id: templateId,
        likes_count: likesCount,
      });
    },
    []
  );

  const trackSetLiked = useCallback(
    (setId: string, likesCount: number) => {
      capture(TEMPLATE_GALLERY_EVENTS.SET_LIKED, {
        set_id: setId,
        likes_count: likesCount,
      });
    },
    []
  );

  const trackSetUnliked = useCallback(
    (setId: string, likesCount: number) => {
      capture(TEMPLATE_GALLERY_EVENTS.SET_UNLIKED, {
        set_id: setId,
        likes_count: likesCount,
      });
    },
    []
  );

  // Sets
  const trackSetCreated = useCallback(
    (setId: string, memberCount: number, isPublic: boolean) => {
      capture(TEMPLATE_GALLERY_EVENTS.SET_CREATED, {
        set_id: setId,
        member_count: memberCount,
        is_public: isPublic,
      });
    },
    []
  );

  const trackSetViewed = useCallback((setId: string) => {
    capture(TEMPLATE_GALLERY_EVENTS.SET_VIEWED, { set_id: setId });
  }, []);

  const trackSetApplied = useCallback(
    (setId: string, influencerId: string) => {
      capture(TEMPLATE_GALLERY_EVENTS.SET_APPLIED, {
        set_id: setId,
        influencer_id: influencerId,
      });
    },
    []
  );

  return {
    // Navigation
    trackTabChanged,
    trackSortChanged,
    trackContentTypeChanged,
    trackCategorySelected,
    trackExpanded,

    // Template interactions
    trackCardClicked,
    trackApplyModalOpened,
    trackTemplateApplied,

    // Likes
    trackTemplateLiked,
    trackTemplateUnliked,
    trackSetLiked,
    trackSetUnliked,

    // Sets
    trackSetCreated,
    trackSetViewed,
    trackSetApplied,
  };
}
