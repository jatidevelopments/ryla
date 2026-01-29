'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Shield,
  Search,
  Filter,
  Loader2,
  Calendar,
  User,
  Eye,
  Download,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';

function getActionBadge(action: string) {
  const actionLower = action.toLowerCase();
  if (actionLower.includes('create')) {
    return 'bg-green-500/20 text-green-400 border border-green-500/30';
  }
  if (actionLower.includes('update')) {
    return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
  }
  if (actionLower.includes('delete')) {
    return 'bg-red-500/20 text-red-400 border border-red-500/30';
  }
  return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
}

export default function AuditPage() {
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>('all');
  const [adminFilter, setAdminFilter] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [page, setPage] = useState(0);
  const [selectedLog, setSelectedLog] = useState<{ id: string; action: string; entityType: string | null; entityId: string | null; adminId: string; details: unknown; createdAt: Date; ipAddress: string | null; userAgent: string | null; admin?: { email: string; name?: string | null; role?: string | null } | null } | null>(null);
  const limit = 50;

  // Get stats for filters
  const { data: stats } = adminTrpc.audit.getStats.useQuery({
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
  });

  // Get audit logs
  const { data, isLoading } = adminTrpc.audit.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    action: actionFilter === 'all' ? undefined : actionFilter,
    entityType: entityTypeFilter === 'all' ? undefined : entityTypeFilter,
    adminId: adminFilter === 'all' ? undefined : adminFilter,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  const logs = data?.logs || [];
  const pagination = data?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const uniqueActions = stats?.actionCounts.map((a) => a.action).filter((a): a is string => a !== null) || [];
  const uniqueEntityTypes = stats?.entityTypeCounts.map((e) => e.entityType).filter((e): e is string => e !== null) || [];

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            Audit Log
          </h2>
          <p className="text-muted-foreground mt-1">
            View all admin actions and changes
          </p>
        </div>
        <button
          onClick={() => {
            toast.info('Export feature coming soon');
          }}
          className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total Actions</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Shield className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">{stats.total.toLocaleString()}</p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Unique Actions</span>
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Filter className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {stats.actionCounts.length}
            </p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Entity Types</span>
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <Filter className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {stats.entityTypeCounts.length}
            </p>
          </div>
          <div className="admin-card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Active Admins</span>
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <User className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl md:text-3xl font-bold">
              {stats.topAdmins.filter((a) => a.admin).length}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="admin-card space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search audit logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((action) => (
                <option key={action} value={action}>
                  {action}
                </option>
              ))}
            </select>
            <select
              value={entityTypeFilter}
              onChange={(e) => setEntityTypeFilter(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Types</option>
              {uniqueEntityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            {stats?.topAdmins && stats.topAdmins.length > 0 && (
              <select
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Admins</option>
                {stats.topAdmins
                  .filter((a) => a.admin)
                  .map((a) => (
                    <option key={a.adminId} value={a.adminId!}>
                      {a.admin?.email || a.admin?.name || 'Unknown'}
                    </option>
                  ))}
              </select>
            )}
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="From date"
            />
            <span className="text-muted-foreground">to</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="To date"
            />
          </div>
        </div>
      </div>

      {/* Audit logs table */}
      <div className="admin-card p-0 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Timestamp</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Admin</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Action</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Entity</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Details</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <div className="flex flex-col">
                        <span className="text-foreground">
                          {format(new Date(log.createdAt), 'MMM dd, yyyy')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {format(new Date(log.createdAt), 'HH:mm:ss')}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      {log.admin ? (
                        <div className="flex flex-col">
                          <span className="text-foreground">{log.admin.email}</span>
                          {log.admin.name && (
                            <span className="text-muted-foreground text-xs">
                              {log.admin.name}
                            </span>
                          )}
                          <span className="text-muted-foreground text-xs">
                            {log.admin.role?.replace('_', ' ')}
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Unknown</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getActionBadge(log.action)}`}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      {log.entityType && log.entityId ? (
                        <div className="flex flex-col">
                          <span className="text-foreground">{log.entityType}</span>
                          <span className="text-muted-foreground text-xs font-mono">
                            {log.entityId.substring(0, 8)}...
                          </span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      {log.details ? (
                        <span className="text-muted-foreground text-xs line-clamp-2">
                          {JSON.stringify(log.details).substring(0, 100)}...
                        </span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No audit logs found.
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
              Page {page + 1} of {Math.ceil(pagination.total / limit)} ({pagination.total}{' '}
              total)
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

      {/* Log detail modal */}
      {selectedLog && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedLog(null)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Audit Log Details</h3>
              <button
                onClick={() => setSelectedLog(null)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6 text-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div>
                    <label className="text-xs text-muted-foreground">ID</label>
                    <p className="mt-1 font-mono">{selectedLog.id}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Timestamp</label>
                    <p className="mt-1">
                      {selectedLog.createdAt ? format(new Date(selectedLog.createdAt), 'PPP p') : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Admin</label>
                    <p className="mt-1">
                      {selectedLog.admin?.email || 'Unknown'} ({selectedLog.admin?.role || 'N/A'})
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Action</label>
                    <p className="mt-1">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getActionBadge(selectedLog.action)}`}
                      >
                        {selectedLog.action}
                      </span>
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Entity Type</label>
                    <p className="mt-1">{selectedLog.entityType || 'N/A'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Entity ID</label>
                    <p className="mt-1 font-mono">
                      {selectedLog.entityId || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-3">
                  {selectedLog.ipAddress && (
                    <div>
                      <label className="text-xs text-muted-foreground">IP Address</label>
                      <p className="mt-1 font-mono">{selectedLog.ipAddress}</p>
                    </div>
                  )}
                  {selectedLog.userAgent && (
                    <div>
                      <label className="text-xs text-muted-foreground">User Agent</label>
                      <p className="mt-1 text-xs break-all">{selectedLog.userAgent}</p>
                    </div>
                  )}
                  {selectedLog.details != null && (
                    <div>
                      <label className="text-xs text-muted-foreground">Details</label>
                      <pre className="mt-1 bg-secondary p-2 rounded-lg overflow-x-auto text-xs font-mono">
                        {typeof selectedLog.details === 'object'
                          ? JSON.stringify(selectedLog.details, null, 2)
                          : String(selectedLog.details)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
