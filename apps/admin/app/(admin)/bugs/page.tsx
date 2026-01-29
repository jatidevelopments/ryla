'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Bug,
  Search,
  Filter,
  AlertCircle,
  CheckCircle2,
  Clock,
  ExternalLink,
  ChevronDown,
  Loader2,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';

function getStatusIcon(status: string) {
  switch (status) {
    case 'open':
      return <AlertCircle className="w-4 h-4 text-blue-400" />;
    case 'in_progress':
      return <Clock className="w-4 h-4 text-yellow-400" />;
    case 'resolved':
      return <CheckCircle2 className="w-4 h-4 text-green-400" />;
    case 'closed':
      return <CheckCircle2 className="w-4 h-4 text-gray-400" />;
    default:
      return <AlertCircle className="w-4 h-4 text-blue-400" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'open':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'in_progress':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'resolved':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'closed':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function BugsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedBug, setExpandedBug] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 25;

  // Get bug reports stats
  const { data: stats } = adminTrpc.bugReports.getStats.useQuery();

  // Get bug reports list
  const { data, isLoading, refetch } = adminTrpc.bugReports.list.useQuery({
    limit,
    offset: page * limit,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
    search: search || undefined,
  });

  // Update status mutation
  const updateStatus = adminTrpc.bugReports.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('Status updated successfully');
      refetch();
      setExpandedBug(null);
    },
    onError: (error) => {
      toast.error('Failed to update status', { description: error.message });
    },
  });

  const reports = data?.reports || [];
  const pagination = data?.pagination || { total: 0, limit, offset: 0, hasMore: false };

  const handleStatusChange = async (reportId: string, newStatus: string) => {
    const note = prompt('Optional note for status change:');
    await updateStatus.mutateAsync({
      reportId,
      status: newStatus as any,
      note: note || undefined,
    });
  };

  const openBugs = stats?.openCount || 0;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Bug className="w-6 h-6 text-primary" />
            Bug Reports
          </h2>
          <p className="text-muted-foreground mt-1">
            Track and manage user-reported issues
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-yellow-400" />
            <span>{openBugs} Open</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search bugs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="new">New</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
            <option value="wont_fix">Won&apos;t Fix</option>
          </select>
        </div>
      </div>

      {/* Bug list */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="admin-card text-center py-12">
            <Bug className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No bug reports found</p>
          </div>
        ) : (
          <>
            {reports.map((bug) => (
              <div
                key={bug.id}
                className="admin-card cursor-pointer hover:border-primary/30 transition-colors"
                onClick={() => setExpandedBug(expandedBug === bug.id ? null : bug.id)}
              >
                <div className="flex items-start gap-3">
                  {getStatusIcon(bug.status)}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-sm font-mono text-muted-foreground">
                        {bug.id.substring(0, 8)}...
                      </span>
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getStatusBadge(bug.status)}`}>
                        {bug.status.replace('_', ' ')}
                      </span>
                      {bug.hasScreenshot && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-green-500/20 text-green-400 border border-green-500/30">
                          Screenshot
                        </span>
                      )}
                      {bug.hasConsoleLogs && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30">
                          Logs
                        </span>
                      )}
                    </div>
                    <h3 className="font-medium line-clamp-2">{bug.description.substring(0, 100)}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-muted-foreground">
                      <span>{bug.userEmail || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{new Date(bug.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${expandedBug === bug.id ? 'rotate-180' : ''}`}
                  />
                </div>

                {expandedBug === bug.id && (
                  <div className="mt-4 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground mb-4 whitespace-pre-wrap">{bug.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <select
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleStatusChange(bug.id, e.target.value)}
                        disabled={updateStatus.isPending}
                        className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm disabled:opacity-50"
                        defaultValue={bug.status}
                      >
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                      {bug.userId && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(routes.user.detail(bug.userId!));
                          }}
                          className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center gap-2"
                        >
                          <ExternalLink className="w-4 h-4" />
                          View User
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(routes.bug.detail(bug.id));
                        }}
                        className="min-h-[44px] px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {pagination.total > 0 && (
              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-muted-foreground">
                  Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} reports
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    disabled={page === 0 || isLoading}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
                  >
                    ←
                  </button>
                  <button
                    onClick={() => setPage((p) => p + 1)}
                    disabled={!pagination.hasMore || isLoading}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
                  >
                    →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
