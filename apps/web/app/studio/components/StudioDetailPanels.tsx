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
      {/* Desktop Sidebar - Detail View (Flex-based for space-making) */}
      <div
        className={cn(
          'hidden lg:flex flex-col transition-all duration-300 ease-in-out relative overflow-hidden',
          isOpen ? 'w-[420px] opacity-100' : 'w-0 opacity-0'
        )}
      >
        <div className="w-[420px] h-full p-4 pb-[190px]">
          <div className="h-full w-full flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-2xl shadow-2xl overflow-hidden">
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
        </div>
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
