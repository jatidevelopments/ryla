import type { StudioImage } from '../../../components/studio/studio-image-card';
import { StudioDetailPanel } from '../../../components/studio';
import { cn } from '@ryla/ui';

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
  const isOpen = showPanel && selectedImage;

  return (
    <>
      <div
        className={cn(
          'hidden lg:block transition-all duration-300 ease-in-out relative flex-shrink-0 border-l border-[var(--border-default)] bg-[var(--bg-elevated)] h-full',
          isOpen ? 'w-[420px]' : 'w-0 overflow-hidden border-none'
        )}
      >
        {isOpen && (
          <div className="absolute inset-0 flex flex-col h-full bg-transparent overflow-hidden">
            <StudioDetailPanel
              image={selectedImage}
              onClose={onClose}
              onLike={onLike}
              onDelete={onDelete}
              onDownload={onDownload}
              onRetry={onRetry}
              className="flex-1 border-none shadow-none"
              variant="panel"
            />
          </div>
        )}
      </div>

      {/* Mobile Modal - Detail View */}
      {isOpen && (
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
      )}
    </>
  );
}
