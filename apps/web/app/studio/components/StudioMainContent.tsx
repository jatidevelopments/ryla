import { FadeInUp } from '@ryla/ui';
import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { ViewMode } from '../../../components/studio/studio-toolbar';
import { StudioGallery } from '../../../components/studio';
import { StudioDetailPanels } from './StudioDetailPanels';

interface StudioMainContentProps {
  filteredImages: StudioImage[];
  selectedImage: StudioImage | null;
  showPanel: boolean;
  viewMode: ViewMode;
  isLoading?: boolean;
  onSelectImage: (image: StudioImage | null) => void;
  onOpenDetails: (image: StudioImage) => void;
  onLike: (imageId: string) => void;
  onDownload: (image: StudioImage) => void;
  onClosePanel: () => void;
  onDelete: (imageId: string) => void;
  onRetry: (image: StudioImage) => void;
}

export function StudioMainContent({
  filteredImages,
  selectedImage,
  showPanel,
  viewMode,
  isLoading = false,
  onSelectImage,
  onOpenDetails,
  onLike,
  onDownload,
  onClosePanel,
  onDelete,
  onRetry,
}: StudioMainContentProps) {
  return (
    <div className="relative flex flex-1 h-full overflow-hidden">
      {/* Gallery */}
      <div className="flex-1 overflow-y-auto px-3 py-3 transition-all duration-300 ease-in-out">
        <FadeInUp delay={100}>
          <StudioGallery
            images={filteredImages}
            selectedImage={selectedImage}
            onSelectImage={onSelectImage}
            onOpenDetails={onOpenDetails}
            onQuickLike={onLike}
            onQuickDownload={onDownload}
            viewMode={viewMode}
            isLoading={isLoading}
          />
        </FadeInUp>
      </div>
    </div>
  );
}
