// Legacy components (still used for backwards compatibility)
export { FilterPill } from './FilterPill';
export { FilterDropdown } from './FilterDropdown';
export { ViewModeToggle } from './ViewModeToggle';
export { SortDropdown } from './SortDropdown';

// Unified content type for template gallery
export type ContentType = 'all' | 'image' | 'video' | 'lip_sync' | 'audio' | 'mixed';

// New EP-047 components (Template Gallery UX Redesign)
export { TypeTabs, type TabType } from './TypeTabs';
export { SortButtons, type SortOption } from './SortButtons';
export { ContentTypeFilter } from './ContentTypeFilter';
export { CategoryPills, type Category } from './CategoryPills';
export { TemplateSetCard } from './TemplateSetCard';
export { InfluencerSelectionModal } from './InfluencerSelectionModal';
export { TemplateDetailModal } from './TemplateDetailModal';
