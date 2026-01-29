'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Activity,
  Search,
  Filter,
  RefreshCw,
  XCircle,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Play,
  X,
  Eye,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';
import Link from 'next/link';

function getStatusBadge(status: string) {
  switch (status) {
    case 'completed':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'processing':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'queued':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'failed':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    case 'cancelled':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function getTypeLabel(type: string) {
  return type
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

function formatDate(date: Date | string | null) {
  if (!date) return 'N/A';
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

function formatDuration(startedAt: Date | string | null, completedAt: Date | string | null) {
  if (!startedAt) return 'N/A';
  const start = typeof startedAt === 'string' ? new Date(startedAt) : startedAt;
  const end = completedAt
    ? typeof completedAt === 'string'
      ? new Date(completedAt)
      : completedAt
    : new Date();
  const diff = Math.round((end.getTime() - start.getTime()) / 1000);
  if (diff < 60) return `${diff}s`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
}

export default function JobsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Fetch jobs with tRPC
  const { data, isLoading, refetch } = adminTrpc.jobs.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    type: typeFilter === 'all' ? undefined : (typeFilter as any),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Fetch job stats
  const { data: stats } = adminTrpc.jobs.getStats.useQuery({
    timeRange: '24h',
  });

  // Fetch selected job detail
  const { data: jobDetail, isLoading: isLoadingDetail } =
    adminTrpc.jobs.get.useQuery(
      { jobId: selectedJobId! },
      { enabled: !!selectedJobId }
    );

  // Mutations
  const retryJob = adminTrpc.jobs.retry.useMutation({
    onSuccess: () => {
      toast.success('Job queued for retry');
      refetch();
      setSelectedJobId(null);
    },
    onError: (error) => {
      toast.error('Failed to retry job', { description: error.message });
    },
  });

  const cancelJob = adminTrpc.jobs.cancel.useMutation({
    onSuccess: () => {
      toast.success('Job cancelled successfully');
      refetch();
      setSelectedJobId(null);
    },
    onError: (error) => {
      toast.error('Failed to cancel job', { description: error.message });
    },
  });

  const jobs = data?.jobs || [];
  const pagination = data?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleRetryJob = async (jobId: string) => {
    if (confirm('Are you sure you want to retry this job?')) {
      await retryJob.mutateAsync({ jobId });
    }
  };

  const handleCancelJob = async (jobId: string) => {
    const reason = prompt('Please provide a reason for cancelling this job (optional):');
    await cancelJob.mutateAsync({ jobId, reason: reason || undefined });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" />
          Generation Jobs Monitor
        </h2>
        <p className="text-muted-foreground mt-1">
          Monitor and manage image generation jobs
        </p>
      </div>

      {/* Stats cards */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Jobs (24h)</span>
              <Activity className="w-5 h-5 text-primary" />
            </div>
            <p className="text-2xl font-bold">{stats.total}</p>
          </div>
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Active</span>
              <Clock className="w-5 h-5 text-blue-400" />
            </div>
            <p className="text-2xl font-bold text-blue-400">{stats.active}</p>
          </div>
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Completed</span>
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            </div>
            <p className="text-2xl font-bold text-green-400">{stats.completed}</p>
          </div>
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Failed</span>
              <XCircle className="w-5 h-5 text-red-400" />
            </div>
            <p className="text-2xl font-bold text-red-400">{stats.failed}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by job ID or error message..."
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
            <option value="queued">Queued</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="base_image_generation">Base Image</option>
            <option value="character_sheet_generation">Character Sheet</option>
            <option value="image_generation">Image Generation</option>
            <option value="image_upscale">Image Upscale</option>
            <option value="lora_training">LoRA Training</option>
            <option value="caption_generation">Caption Generation</option>
          </select>
        </div>
      </div>

      {/* Jobs table */}
      {isLoading ? (
        <div className="admin-card p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="admin-card text-center py-12">
          <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      ) : (
        <>
          <div className="admin-card p-0 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Job ID
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Type
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Status
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    User
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Progress
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Duration
                  </th>
                  <th className="text-left text-sm font-medium text-muted-foreground p-4">
                    Created
                  </th>
                  <th className="text-right text-sm font-medium text-muted-foreground p-4">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {jobs.map((job) => (
                  <tr
                    key={job.id}
                    className="hover:bg-secondary/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedJobId(job.id)}
                  >
                    <td className="p-4">
                      <code className="text-xs text-muted-foreground">
                        {job.id.slice(0, 8)}...
                      </code>
                    </td>
                    <td className="p-4 text-sm">{getTypeLabel(job.type)}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(
                          job.status ?? 'unknown'
                        )}`}
                      >
                        {job.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <Link
                        href={routes.user.detail(job.userId)}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm hover:text-primary"
                      >
                        {job.userEmail}
                      </Link>
                    </td>
                    <td className="p-4 text-sm">
                      {job.imageCount !== null && job.completedCount !== null ? (
                        <span>
                          {job.completedCount}/{job.imageCount}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDuration(job.startedAt, job.completedAt)}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {formatDate(job.createdAt)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedJobId(job.id);
                          }}
                          className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-secondary rounded"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {job.status === 'failed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRetryJob(job.id);
                            }}
                            disabled={retryJob.isPending}
                            className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-secondary rounded disabled:opacity-50"
                          >
                            {retryJob.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>
                        )}
                        {(job.status === 'queued' || job.status === 'processing') && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCancelJob(job.id);
                            }}
                            disabled={cancelJob.isPending}
                            className="min-h-[32px] min-w-[32px] flex items-center justify-center hover:bg-secondary rounded disabled:opacity-50"
                          >
                            {cancelJob.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

      {/* Job detail modal */}
      {selectedJobId && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedJobId(null)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-4xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Job Details</h3>
              <button
                onClick={() => setSelectedJobId(null)}
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
              ) : jobDetail ? (
                <div className="space-y-6">
                  {/* Status and Type */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Status</label>
                      <p className="mt-1">
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(
                            jobDetail.status ?? 'unknown'
                          )}`}
                        >
                          {jobDetail.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <label className="text-sm text-muted-foreground">Type</label>
                      <p className="mt-1 text-sm">{getTypeLabel(jobDetail.type)}</p>
                    </div>
                  </div>

                  {/* User and Character */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">User</label>
                      <p className="mt-1 text-sm">
                        <Link
                          href={routes.user.detail(jobDetail.userId)}
                          className="hover:text-primary"
                        >
                          {jobDetail.userEmail}
                        </Link>
                      </p>
                    </div>
                    {jobDetail.characterName && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Character
                        </label>
                        <p className="mt-1 text-sm">{jobDetail.characterName}</p>
                        <p className="text-xs text-muted-foreground">
                          @{jobDetail.characterHandle}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Progress */}
                  {(jobDetail.imageCount !== null ||
                    jobDetail.completedCount !== null) && (
                    <div>
                      <label className="text-sm text-muted-foreground">Progress</label>
                      <p className="mt-1 text-sm">
                        {jobDetail.completedCount || 0} / {jobDetail.imageCount || 0}{' '}
                        images
                      </p>
                    </div>
                  )}

                  {/* Credits */}
                  {jobDetail.creditsUsed !== null && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        Credits Used
                      </label>
                      <p className="mt-1 text-sm">{jobDetail.creditsUsed}</p>
                    </div>
                  )}

                  {/* External Job Info */}
                  {jobDetail.externalJobId && (
                    <div>
                      <label className="text-sm text-muted-foreground">
                        External Job ID
                      </label>
                      <p className="mt-1 text-sm font-mono text-xs">
                        {jobDetail.externalJobId}
                      </p>
                      {jobDetail.externalProvider && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Provider: {jobDetail.externalProvider}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Error */}
                  {jobDetail.error && (
                    <div>
                      <label className="text-sm text-muted-foreground">Error</label>
                      <p className="mt-1 text-sm text-red-400 bg-red-500/10 p-3 rounded-lg">
                        {jobDetail.error}
                      </p>
                    </div>
                  )}

                  {/* Timestamps */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-muted-foreground">Created</label>
                      <p className="mt-1 text-sm">{formatDate(jobDetail.createdAt)}</p>
                    </div>
                    {jobDetail.startedAt && (
                      <div>
                        <label className="text-sm text-muted-foreground">Started</label>
                        <p className="mt-1 text-sm">{formatDate(jobDetail.startedAt)}</p>
                      </div>
                    )}
                    {jobDetail.completedAt && (
                      <div>
                        <label className="text-sm text-muted-foreground">
                          Completed
                        </label>
                        <p className="mt-1 text-sm">
                          {formatDate(jobDetail.completedAt)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Input/Output (collapsible) */}
                  <details className="border border-border rounded-lg p-4">
                    <summary className="cursor-pointer text-sm font-medium">
                      Input/Output (JSON)
                    </summary>
                    <pre className="mt-4 text-xs overflow-x-auto bg-secondary p-4 rounded">
                      {JSON.stringify(
                        {
                          input: jobDetail.input,
                          output: jobDetail.output,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </details>

                  {/* Actions */}
                  <div className="flex flex-wrap gap-2 pt-4 border-t border-border">
                    {jobDetail.status === 'failed' && (
                      <button
                        onClick={() => handleRetryJob(jobDetail.id)}
                        disabled={retryJob.isPending}
                        className="min-h-[44px] px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {retryJob.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <RefreshCw className="w-4 h-4" />
                        )}
                        Retry Job
                      </button>
                    )}
                    {(jobDetail.status === 'queued' ||
                      jobDetail.status === 'processing') && (
                      <button
                        onClick={() => handleCancelJob(jobDetail.id)}
                        disabled={cancelJob.isPending}
                        className="min-h-[44px] px-4 py-2 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium flex items-center gap-2 disabled:opacity-50"
                      >
                        {cancelJob.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <X className="w-4 h-4" />
                        )}
                        Cancel Job
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Failed to load job details</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
