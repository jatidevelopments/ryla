'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Cpu,
  Search,
  Filter,
  Loader2,
  RefreshCw,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  Link as LinkIcon,
  Clock,
  DollarSign,
  AlertCircle,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { routes } from '@/lib/routes';

function getStatusBadge(status: string) {
  switch (status) {
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'training':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'ready':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'expired':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function formatDuration(ms: number | null | undefined): string {
  if (!ms) return 'N/A';
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

function formatCost(cents: number | null | undefined): string {
  if (!cents) return 'N/A';
  return `$${(cents / 100).toFixed(2)}`;
}

export default function LoraPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedModel, setSelectedModel] = useState<any | null>(null);
  const limit = 50;

  // Get stats
  const { data: stats, isLoading: isLoadingStats } = adminTrpc.lora.getStats.useQuery();

  // Get models
  const {
    data: modelsData,
    isLoading: isLoadingModels,
    refetch: refetchModels,
  } = adminTrpc.lora.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    type: typeFilter === 'all' ? undefined : (typeFilter as any),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Mutations
  const retryModel = adminTrpc.lora.retry.useMutation({
    onSuccess: () => {
      toast.success('LoRA training retried successfully');
      refetchModels();
      setSelectedModel(null);
    },
    onError: (error) => {
      toast.error('Failed to retry training', { description: error.message });
    },
  });

  const deleteModel = adminTrpc.lora.delete.useMutation({
    onSuccess: () => {
      toast.success('LoRA model deleted successfully');
      refetchModels();
      setSelectedModel(null);
    },
    onError: (error) => {
      toast.error('Failed to delete model', { description: error.message });
    },
  });

  const models = modelsData?.models || [];
  const pagination = modelsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleRetry = async (modelId: string) => {
    if (confirm('Are you sure you want to retry this LoRA training?')) {
      await retryModel.mutateAsync({ modelId });
    }
  };

  const handleDelete = async (modelId: string, characterName: string) => {
    if (
      confirm(
        `Are you sure you want to delete the LoRA model for "${characterName}"? This action cannot be undone.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this model (optional):');
      await deleteModel.mutateAsync({
        modelId,
        reason: reason || undefined,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Cpu className="w-6 h-6 text-primary" />
          LoRA Model Management
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitor and manage AI model training jobs
        </p>
      </div>

      {/* Stats grid */}
      {isLoadingStats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="h-20 bg-secondary/50 rounded" />
            </div>
          ))}
        </div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Models</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.total}</p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Ready</span>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <Cpu className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.ready}</p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Training</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.training}</p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Failed</span>
              <div className="p-2 rounded-lg bg-red-500/10 text-red-400">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.failed}</p>
          </div>
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by trigger word, base model, job ID, or error..."
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
            <option value="pending">Pending</option>
            <option value="training">Training</option>
            <option value="ready">Ready</option>
            <option value="failed">Failed</option>
            <option value="expired">Expired</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="face">Face</option>
            <option value="style">Style</option>
            <option value="pose">Pose</option>
          </select>
        </div>
      </div>

      {/* Models table */}
      <div className="admin-card p-0 overflow-hidden">
        {isLoadingModels ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : models.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] text-left">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Character</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">User</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Base Model</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Duration</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Cost</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {models.map((model) => (
                  <tr
                    key={model.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      {model.character ? (
                        <div className="flex flex-col">
                          <span className="text-foreground font-medium">
                            {model.character.name}
                          </span>
                          {model.character.handle && (
                            <span className="text-muted-foreground text-xs">
                              @{model.character.handle}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {model.user ? (
                        <Link
                          href={routes.user.detail(model.user.id)}
                          className="text-primary hover:underline"
                        >
                          {model.user.email}
                        </Link>
                      ) : (
                        <span className="text-muted-foreground">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {model.type}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(model.status)}`}
                      >
                        {model.status}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {model.baseModel || 'N/A'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDuration(model.trainingDurationMs)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatCost(model.trainingCost)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(model.createdAt), { addSuffix: true })}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setSelectedModel(model)}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {model.status === 'failed' && (
                          <button
                            onClick={() => handleRetry(model.id)}
                            disabled={retryModel.isPending}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                            title="Retry Training"
                          >
                            {retryModel.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        <button
                          onClick={() =>
                            handleDelete(model.id, model.character?.name || 'Unknown')
                          }
                          disabled={deleteModel.isPending}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Delete Model"
                        >
                          {deleteModel.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No LoRA models found.
          </div>
        )}

        {/* Pagination */}
        {pagination.total > limit && (
          <div className="flex items-center justify-between p-4 border-t border-border">
            <button
              onClick={() => setPage((prev) => Math.max(0, prev - 1))}
              disabled={page === 0}
              className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-muted-foreground">
              Page {page + 1} of {Math.ceil(pagination.total / limit)} ({pagination.total} total)
            </span>
            <button
              onClick={() => setPage((prev) => prev + 1)}
              disabled={!pagination.hasMore}
              className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Model detail modal */}
      {selectedModel && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedModel(null)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">
                LoRA Model: {selectedModel.character?.name || selectedModel.id.substring(0, 8)}
              </h3>
              <button
                onClick={() => setSelectedModel(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* General Info */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Model ID</label>
                    <p className="mt-1 font-mono">{selectedModel.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Status</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(selectedModel.status)}`}
                      >
                        {selectedModel.status}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Type</label>
                    <p className="mt-1">
                      <span className="px-2 py-0.5 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                        {selectedModel.type}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Character</label>
                    <p className="mt-1">
                      {selectedModel.character ? (
                        <>
                          {selectedModel.character.name}
                          {selectedModel.character.handle && (
                            <span className="text-muted-foreground ml-2">
                              @{selectedModel.character.handle}
                            </span>
                          )}
                        </>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">User</label>
                    <p className="mt-1">
                      {selectedModel.user ? (
                        <Link
                          href={routes.user.detail(selectedModel.user.id)}
                          className="text-primary hover:underline"
                        >
                          {selectedModel.user.email}
                        </Link>
                      ) : (
                        'N/A'
                      )}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Base Model</label>
                    <p className="mt-1">{selectedModel.baseModel || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Trigger Word</label>
                    <p className="mt-1 font-mono">{selectedModel.triggerWord || 'N/A'}</p>
                  </div>
                </div>

                {/* Training Details */}
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Training Steps</label>
                    <p className="mt-1">{selectedModel.trainingSteps || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Training Duration</label>
                    <p className="mt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDuration(selectedModel.trainingDurationMs)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Training Cost</label>
                    <p className="mt-1 flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      {formatCost(selectedModel.trainingCost)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Retry Count</label>
                    <p className="mt-1">{selectedModel.retryCount || 0}</p>
                  </div>
                  {selectedModel.externalJobId && (
                    <div>
                      <label className="text-xs text-muted-foreground">External Job ID</label>
                      <p className="mt-1 font-mono">{selectedModel.externalJobId}</p>
                    </div>
                  )}
                  {selectedModel.externalProvider && (
                    <div>
                      <label className="text-xs text-muted-foreground">External Provider</label>
                      <p className="mt-1">{selectedModel.externalProvider}</p>
                    </div>
                  )}
                  {selectedModel.modelUrl && (
                    <div>
                      <label className="text-xs text-muted-foreground">Model URL</label>
                      <p className="mt-1">
                        <a
                          href={selectedModel.modelUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:underline flex items-center gap-1"
                        >
                          <LinkIcon className="w-3 h-3" />
                          View Model
                        </a>
                      </p>
                    </div>
                  )}
                  {selectedModel.errorMessage && (
                    <div>
                      <label className="text-xs text-muted-foreground text-red-400">
                        Error Message
                      </label>
                      <p className="mt-1 text-red-300">{selectedModel.errorMessage}</p>
                    </div>
                  )}
                  <div>
                    <label className="text-xs text-muted-foreground">Created At</label>
                    <p className="mt-1">
                      {format(new Date(selectedModel.createdAt), 'PPP p')}
                    </p>
                  </div>
                  {selectedModel.trainingStartedAt && (
                    <div>
                      <label className="text-xs text-muted-foreground">Training Started</label>
                      <p className="mt-1">
                        {format(new Date(selectedModel.trainingStartedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                  {selectedModel.trainingCompletedAt && (
                    <div>
                      <label className="text-xs text-muted-foreground">Training Completed</label>
                      <p className="mt-1">
                        {format(new Date(selectedModel.trainingCompletedAt), 'PPP p')}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Training Config */}
              {selectedModel.config && (
                <div className="mt-6 pt-6 border-t border-border">
                  <label className="text-xs text-muted-foreground">Training Configuration</label>
                  <pre className="mt-1 bg-secondary p-2 rounded-lg overflow-x-auto text-xs font-mono">
                    {JSON.stringify(selectedModel.config, null, 2)}
                  </pre>
                </div>
              )}

              {/* Actions */}
              <div className="flex flex-wrap gap-2 pt-6 border-t border-border mt-6">
                {selectedModel.status === 'failed' && (
                  <button
                    onClick={() => handleRetry(selectedModel.id)}
                    className="min-h-[44px] px-4 py-2 bg-green-500/10 text-green-400 rounded-lg text-sm font-medium flex items-center gap-2"
                    disabled={retryModel.isPending}
                  >
                    {retryModel.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <RefreshCw className="w-4 h-4" />
                    )}
                    Retry Training
                  </button>
                )}
                <button
                  onClick={() =>
                    handleDelete(selectedModel.id, selectedModel.character?.name || 'Unknown')
                  }
                  className="min-h-[44px] px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2"
                  disabled={deleteModel.isPending}
                >
                  {deleteModel.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                  Delete Model
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
