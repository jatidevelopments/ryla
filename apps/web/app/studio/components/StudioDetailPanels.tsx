import type { StudioImage } from '../../../components/studio/studio-image-card';
import type { ViewMode } from '../../../components/studio/studio-toolbar';
import { StudioDetailPanel } from '../../../components/studio';

interface StudioDetailPanelsProps {
  showPanel: boolean;
  selectedImage: StudioImage | null;
  onClose: () => void;
  onLike: (imageId: string) => void;
  onDelete: (imageId: string) => void;
  onDownload: (image: StudioImage) => void;
  onRetry: (image: StudioImage) => void;
}

export function StudioDetailPanels({
  showPanel,
  selectedImage,
  onClose,
  onLike,
  onDelete,
  onDownload,
  onRetry,
}: StudioDetailPanelsProps) {
  if (!showPanel || !selectedImage) return null;

  return (
    <>
      {/* Right Panel - Detail View (Desktop) */}
      <StudioDetailPanel
        image={selectedImage}
        onClose={onClose}
        onLike={onLike}
        onDelete={onDelete}
        onDownload={onDownload}
        onRetry={onRetry}
        className="hidden w-[380px] flex-shrink-0 lg:flex"
        variant="panel"
      />

      {/* Mobile Modal - Detail View */}
      <StudioDetailPanel
        image={selectedImage}
        onClose={onClose}
        onLike={onLike}
        onDelete={onDelete}
        onDownload={onDownload}
        onRetry={onRetry}
        className="lg:hidden"
        variant="modal"
      />
    </>
  );
}

