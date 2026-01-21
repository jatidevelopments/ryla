'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Image as ImageIcon,
  Search,
  Filter,
  Grid,
  List,
  Eye,
  Trash2,
  Flag,
  User,
  Loader2,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';
import Link from 'next/link';
import NextImage from 'next/image';

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'generating':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function formatDate(date: Date | string) {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export default function ContentPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Fetch images with tRPC
  const { data, isLoading, refetch } = adminTrpc.content.listImages.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch selected image detail
  const { data: imageDetail, isLoading: isLoadingDetail } =
    adminTrpc.content.getImage.useQuery(
      { imageId: selectedImageId! },
      { enabled: !!selectedImageId }
    );

  // Mutations
  const flagImage = adminTrpc.content.flagImage.useMutation({
    onSuccess: () => {
      toast.success('Image flagged successfully');
      refetch();
      setSelectedImageId(null);
    },
    onError: (error) => {
      toast.error('Failed to flag image', { description: error.message });
    },
  });

  const deleteImage = adminTrpc.content.deleteImage.useMutation({
    onSuccess: () => {
      toast.success('Image deleted successfully');
      refetch();
      setSelectedImageId(null);
    },
    onError: (error) => {
      toast.error('Failed to delete image', { description: error.message });
    },
  });

  const images = data?.images || [];
  const pagination = data?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleFlagImage = async (imageId: string) => {
    const reason = prompt('Please provide a reason for flagging this image:');
    if (reason) {
      await flagImage.mutateAsync({ imageId, reason });
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      const reason = prompt('Please provide a reason for deleting this image:');
      if (reason) {
        await deleteImage.mutateAsync({ imageId, reason });
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-primary" />
          Content Moderation
        </h2>
        <p className="text-muted-foreground mt-1">
          Browse and moderate generated images
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by user, influencer, or prompt..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="completed">Completed</option>
            <option value="generating">Generating</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
          </select>
          <div className="flex border border-border rounded-lg overflow-hidden">
            <button
              onClick={() => setViewMode('grid')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'grid'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary'
              }`}
            >
              <Grid className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`min-h-[44px] min-w-[44px] flex items-center justify-center ${
                viewMode === 'list'
                  ? 'bg-primary/20 text-primary'
                  : 'bg-secondary'
              }`}
            >
              <List className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Content grid/list */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div
              key={i}
              className="aspect-[3/4] bg-secondary rounded-lg animate-pulse"
            />
          ))}
        </div>
      ) : images.length === 0 ? (
        <div className="admin-card text-center py-12">
          <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No images found</p>
        </div>
      ) : viewMode === 'grid' ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map((img) => (
              <div
                key={img.id}
                className="group relative aspect-[3/4] bg-secondary rounded-lg overflow-hidden cursor-pointer"
                onClick={() => setSelectedImageId(img.id)}
              >
                {/* Image or placeholder */}
                {img.thumbnailUrl || img.s3Url ? (
                  <NextImage
                    src={img.thumbnailUrl || img.s3Url || ''}
                    alt={img.prompt || 'Generated image'}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                    <ImageIcon className="w-12 h-12 text-muted-foreground/50" />
                  </div>
                )}

                {/* Status badge */}
                {img.status !== 'completed' && (
                  <div className="absolute top-2 right-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                        img.status
                      )}`}
                    >
                      {img.status}
                    </span>
                  </div>
                )}

                {/* NSFW badge */}
                {img.nsfw && (
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                      NSFW
                    </span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
                  <div className="text-sm">
                    <p className="font-medium truncate">{img.characterName}</p>
                    <p className="text-muted-foreground truncate">
                      {img.userEmail}
                    </p>
                  </div>
                </div>
              </div>
            ))}
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
      ) : (
        <>
          <div className="admin-card p-0 divide-y divide-border">
            {images.map((img) => (
              <div
                key={img.id}
                className="flex items-center gap-4 p-4 hover:bg-secondary/50 cursor-pointer"
                onClick={() => setSelectedImageId(img.id)}
              >
                <div className="w-16 h-20 bg-secondary rounded-lg flex-shrink-0 overflow-hidden relative">
                  {img.thumbnailUrl || img.s3Url ? (
                    <NextImage
                      src={img.thumbnailUrl || img.s3Url || ''}
                      alt={img.prompt || 'Generated image'}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                      <ImageIcon className="w-6 h-6 text-muted-foreground/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{img.characterName}</span>
                    <span
                      className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(
                        img.status
                      )}`}
                    >
                      {img.status}
                    </span>
                    {img.nsfw && (
                      <span className="px-2 py-0.5 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                        NSFW
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">
                    {img.prompt || 'No prompt'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {img.userEmail} • {formatDate(img.createdAt)}
                  </p>
                </div>
                <Eye className="w-5 h-5 text-muted-foreground" />
              </div>
            ))}
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

      {/* Image detail modal */}
      {selectedImageId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedImageId(null)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Image Details</h3>
              <button
                onClick={() => setSelectedImageId(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {isLoadingDetail ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : imageDetail ? (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Image preview */}
                  <div className="aspect-[3/4] bg-secondary rounded-lg overflow-hidden relative">
                    {imageDetail.s3Url || imageDetail.thumbnailUrl ? (
                      <NextImage
                        src={imageDetail.s3Url || imageDetail.thumbnailUrl || ''}
                        alt={imageDetail.prompt || 'Generated image'}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 flex items-center justify-center">
                        <ImageIcon className="w-24 h-24 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Status
                      </label>
                      <p className="mt-1">
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(
                            imageDetail.status
                          )}`}
                        >
                          {imageDetail.status}
                        </span>
                        {imageDetail.nsfw && (
                          <span className="ml-2 px-2 py-1 text-xs rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                            NSFW
                          </span>
                        )}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Character
                      </label>
                      <p className="mt-1 font-medium">
                        {imageDetail.characterName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        @{imageDetail.characterHandle}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        User
                      </label>
                      <p className="mt-1">{imageDetail.userEmail}</p>
                      <p className="text-xs text-muted-foreground">
                        {imageDetail.userName}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Prompt
                      </label>
                      <p className="mt-1 text-sm">{imageDetail.prompt}</p>
                    </div>
                    {imageDetail.scene && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Scene
                        </label>
                        <p className="mt-1 text-sm">{imageDetail.scene}</p>
                      </div>
                    )}
                    {imageDetail.environment && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Environment
                        </label>
                        <p className="mt-1 text-sm">
                          {imageDetail.environment}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Created
                      </label>
                      <p className="mt-1 text-sm">
                        {formatDate(imageDetail.createdAt)}
                      </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap gap-2 pt-4">
                      <Link
                        href={routes.user.detail(imageDetail.userId)}
                        className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <User className="w-4 h-4" />
                        View User
                      </Link>
                      <button
                        onClick={() => handleFlagImage(imageDetail.id)}
                        disabled={flagImage.isPending}
                        className="min-h-[44px] px-4 py-2 bg-yellow-500/10 text-yellow-400 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {flagImage.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Flag className="w-4 h-4" />
                        )}
                        Flag Content
                      </button>
                      <button
                        onClick={() => handleDeleteImage(imageDetail.id)}
                        disabled={deleteImage.isPending}
                        className="min-h-[44px] px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {deleteImage.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Failed to load image details
                  </p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
