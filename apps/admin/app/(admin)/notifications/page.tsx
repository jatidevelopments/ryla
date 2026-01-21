'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Bell,
  Plus,
  Loader2,
  Trash2,
  Eye,
  Send,
  Calendar,
  Users,
  Filter,
  X,
  CheckCircle2,
  Clock,
  XCircle,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuth } from '@/lib/auth-context';

function getStatusBadge(status: string) {
  switch (status) {
    case 'sent':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'scheduled':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'sending':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'draft':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    case 'cancelled':
      return 'bg-red-500/20 text-red-400 border border-red-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function formatStatusName(status: string): string {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusIcon(status: string) {
  switch (status) {
    case 'sent':
      return <CheckCircle2 className="w-4 h-4" />;
    case 'scheduled':
      return <Calendar className="w-4 h-4" />;
    case 'sending':
      return <Clock className="w-4 h-4" />;
    case 'cancelled':
      return <XCircle className="w-4 h-4" />;
    default:
      return null;
  }
}

export default function NotificationsPage() {
  const { hasPermission } = useAdminAuth();
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const limit = 50;

  // Check permissions
  if (!hasPermission('settings:write')) {
    return (
      <div className="space-y-6">
        <div className="admin-card text-center py-12">
          <Bell className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to manage notifications
          </p>
        </div>
      </div>
    );
  }

  // Get broadcast notifications
  const {
    data: notificationsData,
    isLoading: isLoadingNotifications,
    refetch: refetchNotifications,
  } = adminTrpc.notifications.list.useQuery({
    limit,
    offset: page * limit,
    status: statusFilter === 'all' ? undefined : (statusFilter as any),
  });

  // Get stats
  const { data: stats } = adminTrpc.notifications.getStats.useQuery();

  // Preview targeting
  const [previewTargeting, setPreviewTargeting] = useState<any>(null);
  const { data: previewData, isLoading: isLoadingPreview } =
    adminTrpc.notifications.preview.useQuery(
      { targeting: previewTargeting || {} },
      { enabled: !!previewTargeting }
    );

  // Mutations
  const createNotification = adminTrpc.notifications.create.useMutation({
    onSuccess: () => {
      toast.success('Notification created successfully');
      refetchNotifications();
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error('Failed to create notification', { description: error.message });
    },
  });

  const cancelNotification = adminTrpc.notifications.cancel.useMutation({
    onSuccess: () => {
      toast.success('Notification cancelled successfully');
      refetchNotifications();
    },
    onError: (error) => {
      toast.error('Failed to cancel notification', { description: error.message });
    },
  });

  const notifications = notificationsData?.notifications || [];
  const pagination = notificationsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const targeting: any = {};
    
    // All users
    if (formData.get('targetAllUsers') === 'true') {
      targeting.allUsers = true;
    } else {
      // Specific targeting
      const userIds = (formData.get('userIds') as string)?.split(',').map((id) => id.trim()) || [];
      if (userIds.length > 0 && userIds[0]) {
        targeting.userIds = userIds.filter(Boolean);
      }
      
      const tiers = (formData.get('tiers') as string)?.split(',').map((t) => t.trim()) || [];
      if (tiers.length > 0 && tiers[0]) {
        targeting.tiers = tiers.filter(Boolean);
      }
      
      if (formData.get('hasActiveSubscription')) {
        targeting.hasActiveSubscription = formData.get('hasActiveSubscription') === 'true';
      }
      
      const minCredits = formData.get('minCredits');
      if (minCredits) {
        targeting.minCredits = Number(minCredits);
      }
      
      const maxCredits = formData.get('maxCredits');
      if (maxCredits) {
        targeting.maxCredits = Number(maxCredits);
      }
      
      const createdAfter = formData.get('createdAfter') as string;
      if (createdAfter) {
        targeting.createdAfter = new Date(createdAfter).toISOString();
      }
      
      const createdBefore = formData.get('createdBefore') as string;
      if (createdBefore) {
        targeting.createdBefore = new Date(createdBefore).toISOString();
      }
    }

    await createNotification.mutateAsync({
      type: formData.get('type') as string,
      title: formData.get('title') as string,
      message: formData.get('message') as string,
      href: (formData.get('href') as string) || undefined,
      targeting,
      scheduledFor: (formData.get('scheduledFor') as string) || undefined,
    });
  };

  const handlePreview = (targeting: {
    allUsers?: boolean;
    userIds?: string[];
    tiers?: string[];
    hasActiveSubscription?: boolean;
    minCredits?: number;
    maxCredits?: number;
    createdAfter?: string;
    createdBefore?: string;
  }) => {
    setPreviewTargeting(targeting);
    setShowPreviewModal(true);
  };

  const handleCancel = async (notificationId: string) => {
    if (confirm('Are you sure you want to cancel this notification?')) {
      await cancelNotification.mutateAsync({ notificationId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Broadcast Notifications
          </h2>
          <p className="text-muted-foreground mt-1">
            Send notifications to multiple users
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Create Notification
        </button>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="admin-card p-4">
            <div className="text-sm text-muted-foreground">Total Sent</div>
            <div className="text-2xl font-bold mt-1">{stats.totalSent.toLocaleString()}</div>
          </div>
          <div className="admin-card p-4">
            <div className="text-sm text-muted-foreground">Total Read</div>
            <div className="text-2xl font-bold mt-1">{stats.totalRead.toLocaleString()}</div>
          </div>
          <div className="admin-card p-4">
            <div className="text-sm text-muted-foreground">Scheduled</div>
            <div className="text-2xl font-bold mt-1">
              {stats.byStatus.scheduled || 0}
            </div>
          </div>
          <div className="admin-card p-4">
            <div className="text-sm text-muted-foreground">Draft</div>
            <div className="text-2xl font-bold mt-1">{stats.byStatus.draft || 0}</div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-2">
        <Filter className="w-5 h-5 text-muted-foreground" />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="sending">Sending</option>
          <option value="sent">Sent</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Notifications table */}
      <div className="admin-card p-0 overflow-hidden">
        {isLoadingNotifications ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : notifications.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Title</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Target</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Sent/Read</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {notifications.map((notification) => (
                  <tr
                    key={notification.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <div className="font-medium text-foreground">{notification.title}</div>
                      <div className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {notification.message}
                      </div>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground capitalize">
                      {notification.type}
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full flex items-center gap-1 w-fit ${getStatusBadge(notification.status)}`}
                      >
                        {getStatusIcon(notification.status)}
                        {formatStatusName(notification.status)}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {notification.targetCount?.toLocaleString() || 0} users
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {notification.sentCount || 0} / {notification.readCount || 0}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(notification.createdAt), 'MMM dd, yyyy')}
                      {notification.scheduledFor && (
                        <div className="text-xs mt-1">
                          Scheduled: {format(new Date(notification.scheduledFor), 'MMM dd, HH:mm')}
                        </div>
                      )}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        {(notification.status === 'scheduled' || notification.status === 'draft') && (
                          <button
                            onClick={() => handleCancel(notification.id)}
                            disabled={cancelNotification.isPending}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Cancel"
                          >
                            {cancelNotification.isPending ? (
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
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            No notifications found.
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

      {/* Create Notification Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-4xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Create Broadcast Notification</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <input
                    type="text"
                    name="type"
                    required
                    placeholder="e.g., announcement, maintenance, promotion"
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    maxLength={200}
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Message *</label>
                  <textarea
                    name="message"
                    required
                    rows={4}
                    maxLength={1000}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Link (optional)</label>
                  <input
                    type="text"
                    name="href"
                    placeholder="/dashboard, /studio, etc."
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>

                {/* Targeting */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-4">Targeting</h4>
                  <div className="space-y-4">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="targetAllUsers"
                        value="true"
                        className="w-5 h-5 accent-primary"
                      />
                      <span className="text-sm">Send to all users</span>
                    </label>
                    <div className="pl-7 space-y-3 text-sm">
                      <div>
                        <label className="block text-sm font-medium mb-2">User IDs (comma-separated)</label>
                        <input
                          type="text"
                          name="userIds"
                          placeholder="uuid1, uuid2, ..."
                          className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Subscription Tiers (comma-separated)</label>
                        <input
                          type="text"
                          name="tiers"
                          placeholder="free, creator, pro"
                          className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                      <div>
                        <label className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            name="hasActiveSubscription"
                            value="true"
                            className="w-5 h-5 accent-primary"
                          />
                          <span>Has active subscription</span>
                        </label>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Min Credits</label>
                          <input
                            type="number"
                            name="minCredits"
                            min="0"
                            className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Max Credits</label>
                          <input
                            type="number"
                            name="maxCredits"
                            min="0"
                            className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium mb-2">Created After</label>
                          <input
                            type="date"
                            name="createdAfter"
                            className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-2">Created Before</label>
                          <input
                            type="date"
                            name="createdBefore"
                            className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const form = document.querySelector('form') as HTMLFormElement;
                          if (form) {
                            const formData = new FormData(form);
                            const targeting: {
                              allUsers?: boolean;
                              userIds?: string[];
                              tiers?: string[];
                              hasActiveSubscription?: boolean;
                              minCredits?: number;
                              maxCredits?: number;
                              createdAfter?: string;
                              createdBefore?: string;
                            } = {};
                            if (formData.get('targetAllUsers') === 'true') {
                              targeting.allUsers = true;
                            } else {
                              const userIds = (formData.get('userIds') as string)?.split(',').map((id) => id.trim()) || [];
                              if (userIds.length > 0 && userIds[0]) {
                                targeting.userIds = userIds.filter(Boolean);
                              }
                              const tiers = (formData.get('tiers') as string)?.split(',').map((t) => t.trim()) || [];
                              if (tiers.length > 0 && tiers[0]) {
                                targeting.tiers = tiers.filter(Boolean);
                              }
                              if (formData.get('hasActiveSubscription')) {
                                targeting.hasActiveSubscription = formData.get('hasActiveSubscription') === 'true';
                              }
                              const minCredits = formData.get('minCredits');
                              if (minCredits) {
                                targeting.minCredits = Number(minCredits);
                              }
                              const maxCredits = formData.get('maxCredits');
                              if (maxCredits) {
                                targeting.maxCredits = Number(maxCredits);
                              }
                              const createdAfter = formData.get('createdAfter') as string;
                              if (createdAfter) {
                                targeting.createdAfter = new Date(createdAfter).toISOString();
                              }
                              const createdBefore = formData.get('createdBefore') as string;
                              if (createdBefore) {
                                targeting.createdBefore = new Date(createdBefore).toISOString();
                              }
                            }
                            handlePreview(targeting);
                          }
                        }}
                        className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium flex items-center gap-2"
                      >
                        <Eye className="w-4 h-4" />
                        Preview Targeting
                      </button>
                    </div>
                  </div>
                </div>

                {/* Scheduling */}
                <div className="border-t border-border pt-4">
                  <h4 className="font-medium mb-4">Scheduling (optional)</h4>
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule For</label>
                    <input
                      type="datetime-local"
                      name="scheduledFor"
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Leave empty to send immediately
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createNotification.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createNotification.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="w-4 h-4" />
                      Create & Send
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Preview Modal */}
      {showPreviewModal && previewData && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowPreviewModal(false);
              setPreviewTargeting(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Targeting Preview</h3>
              <button
                onClick={() => {
                  setShowPreviewModal(false);
                  setPreviewTargeting(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {isLoadingPreview ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="admin-card p-6 text-center">
                    <Users className="w-12 h-12 mx-auto text-primary mb-4" />
                    <div className="text-3xl font-bold">{previewData.targetCount.toLocaleString()}</div>
                    <div className="text-sm text-muted-foreground mt-2">
                      users will receive this notification
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <strong>Targeting criteria:</strong>
                    <pre className="mt-2 p-3 bg-secondary rounded-lg overflow-x-auto">
                      {JSON.stringify(previewData.targeting, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
