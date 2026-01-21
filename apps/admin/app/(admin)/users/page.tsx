'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  Search,
  Filter,
  MoreHorizontal,
  Eye,
  CreditCard,
  Ban,
  ChevronLeft,
  ChevronRight,
  Users as UsersIcon,
  Loader2,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';

function getStatusBadge(banned: boolean) {
  return banned
    ? 'bg-red-500/20 text-red-400 border border-red-500/30'
    : 'bg-green-500/20 text-green-400 border border-green-500/30';
}

function getPlanBadge(tier: string) {
  switch (tier) {
    case 'free':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    case 'starter':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'pro':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'unlimited':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [openActionMenu, setOpenActionMenu] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const limit = 50;

  // Fetch users with tRPC
  const { data, isLoading, refetch } = adminTrpc.users.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    status: statusFilter === 'all' ? undefined : (statusFilter as 'active' | 'banned'),
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Ban user mutation
  const banUser = adminTrpc.users.ban.useMutation({
    onSuccess: () => {
      toast.success('User banned successfully');
      refetch();
      setOpenActionMenu(null);
    },
    onError: (error) => {
      toast.error('Failed to ban user', { description: error.message });
    },
  });

  // Unban user mutation
  const unbanUser = adminTrpc.users.unban.useMutation({
    onSuccess: () => {
      toast.success('User unbanned successfully');
      refetch();
      setOpenActionMenu(null);
    },
    onError: (error) => {
      toast.error('Failed to unban user', { description: error.message });
    },
  });

  const users = data?.users || [];
  const pagination = data?.pagination || { total: 0, limit, offset: 0, hasMore: false };

  const handleBanUser = async (userId: string) => {
    if (confirm('Are you sure you want to ban this user?')) {
      const reason = prompt('Please provide a reason for banning this user:');
      if (reason) {
        await banUser.mutateAsync({ userId, reason });
      }
    }
  };

  const handleUnbanUser = async (userId: string) => {
    if (confirm('Are you sure you want to unban this user?')) {
      await unbanUser.mutateAsync({ userId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <UsersIcon className="w-6 h-6 text-primary" />
            Users
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin inline" />
          ) : (
            `Total: ${pagination.total} users`
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
          </select>
        </div>
      </div>

      {/* Users table - mobile responsive */}
      <div className="admin-card overflow-hidden p-0">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            No users found
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>Plan</th>
                    <th>Credits</th>
                    <th>Characters</th>
                    <th>Images</th>
                    <th>Created</th>
                    <th className="text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusBadge(user.banned)}`}
                        >
                          {user.banned ? 'Banned' : 'Active'}
                        </span>
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getPlanBadge(user.subscriptionTier)}`}
                        >
                          {user.subscriptionTier}
                        </span>
                      </td>
                      <td>{user.credits.toLocaleString()}</td>
                      <td>{user.characterCount}</td>
                      <td>{user.imageCount}</td>
                      <td className="text-muted-foreground text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="relative inline-block">
                          <button
                            onClick={() =>
                              setOpenActionMenu(openActionMenu === user.id ? null : user.id)
                            }
                            className="p-2 hover:bg-secondary rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                          {openActionMenu === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenActionMenu(null)}
                              />
                              <div className="absolute right-0 top-full mt-1 z-20 w-48 bg-popover border border-border rounded-lg shadow-lg overflow-hidden">
                                <button
                                  onClick={() => {
                                    router.push(routes.user.detail(user.id));
                                    setOpenActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-secondary min-h-[44px]"
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </button>
                                <button
                                  onClick={() => {
                                    router.push(`${routes.billing}?userId=${user.id}`);
                                    setOpenActionMenu(null);
                                  }}
                                  className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-secondary min-h-[44px]"
                                >
                                  <CreditCard className="w-4 h-4" />
                                  Manage Credits
                                </button>
                                {user.banned ? (
                                  <button
                                    onClick={() => handleUnbanUser(user.id)}
                                    disabled={unbanUser.isPending}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-secondary text-green-400 min-h-[44px] disabled:opacity-50"
                                  >
                                    <Ban className="w-4 h-4" />
                                    {unbanUser.isPending ? 'Unbanning...' : 'Unban User'}
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user.id)}
                                    disabled={banUser.isPending}
                                    className="flex items-center gap-2 w-full px-4 py-3 text-sm hover:bg-secondary text-red-400 min-h-[44px] disabled:opacity-50"
                                  >
                                    <Ban className="w-4 h-4" />
                                    {banUser.isPending ? 'Banning...' : 'Ban User'}
                                  </button>
                                )}
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-border">
              {users.map((user) => (
                <div key={user.id} className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getStatusBadge(user.banned)}`}
                    >
                      {user.banned ? 'Banned' : 'Active'}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${getPlanBadge(user.subscriptionTier)}`}
                    >
                      {user.subscriptionTier}
                    </span>
                    <span className="text-muted-foreground">
                      {user.credits.toLocaleString()} credits
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(routes.user.detail(user.id))}
                      className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                    >
                      <Eye className="w-4 h-4" />
                      View
                    </button>
                    <button
                      onClick={() => router.push(`${routes.billing}?userId=${user.id}`)}
                      className="flex-1 flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                    >
                      <CreditCard className="w-4 h-4" />
                      Credits
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {isLoading ? (
            'Loading...'
          ) : (
            `Showing ${pagination.offset + 1}-${Math.min(pagination.offset + pagination.limit, pagination.total)} of ${pagination.total} users`
          )}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0 || isLoading}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={!pagination.hasMore || isLoading}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
