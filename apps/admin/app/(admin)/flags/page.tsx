'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Flag,
  Search,
  Plus,
  Filter,
  Loader2,
  Edit,
  Trash2,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
  History,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuth } from '@/lib/auth-context';

function getTypeBadge(type: string) {
  switch (type) {
    case 'boolean':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'percentage':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'tier':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function formatTypeName(type: string): string {
  return type.charAt(0).toUpperCase() + type.slice(1);
}

export default function FlagsPage() {
  const { hasPermission } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [enabledFilter, setEnabledFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedFlag, setSelectedFlag] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [flagType, setFlagType] = useState<string>('boolean');
  const limit = 50;

  // Check permissions
  if (!hasPermission('settings:write')) {
    return (
      <div className="space-y-6">
        <div className="admin-card text-center py-12">
          <Flag className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            You don't have permission to manage feature flags
          </p>
        </div>
      </div>
    );
  }

  // Get feature flags
  const {
    data: flagsData,
    isLoading: isLoadingFlags,
    refetch: refetchFlags,
  } = adminTrpc.flags.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    type: typeFilter === 'all' ? undefined : (typeFilter as any),
    enabled: enabledFilter === 'all' ? undefined : enabledFilter === 'enabled',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Get flag details for history
  const { data: flagDetails } = adminTrpc.flags.get.useQuery(
    { flagName: selectedFlag?.name || '' },
    { enabled: !!selectedFlag && showHistoryModal }
  );

  // Mutations
  const createFlag = adminTrpc.flags.create.useMutation({
    onSuccess: () => {
      toast.success('Feature flag created successfully');
      refetchFlags();
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error('Failed to create feature flag', { description: error.message });
    },
  });

  const updateFlag = adminTrpc.flags.update.useMutation({
    onSuccess: () => {
      toast.success('Feature flag updated successfully');
      refetchFlags();
      setShowEditModal(false);
      setSelectedFlag(null);
    },
    onError: (error) => {
      toast.error('Failed to update feature flag', { description: error.message });
    },
  });

  const deleteFlag = adminTrpc.flags.delete.useMutation({
    onSuccess: () => {
      toast.success('Feature flag deleted successfully');
      refetchFlags();
      setSelectedFlag(null);
    },
    onError: (error) => {
      toast.error('Failed to delete feature flag', { description: error.message });
    },
  });

  const flags = flagsData?.flags || [];
  const pagination = flagsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createFlag.mutateAsync({
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      type: formData.get('type') as any,
      enabled: formData.get('enabled') === 'true',
      config: (() => {
        const type = formData.get('type') as string;
        if (type === 'percentage') {
          const percentage = Number(formData.get('percentage'));
          return { percentage: isNaN(percentage) ? undefined : percentage };
        }
        if (type === 'tier') {
          const tiers = (formData.get('tiers') as string)?.split(',').map((t) => t.trim()) || [];
          return { tiers: tiers.filter(Boolean) };
        }
        return {};
      })(),
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedFlag) return;
    const formData = new FormData(e.currentTarget);
    await updateFlag.mutateAsync({
      flagName: selectedFlag.name,
      description: formData.get('description') as string,
      enabled: formData.get('enabled') === 'true',
      config: (() => {
        const type = selectedFlag.type;
        if (type === 'percentage') {
          const percentage = Number(formData.get('percentage'));
          return { percentage: isNaN(percentage) ? undefined : percentage };
        }
        if (type === 'tier') {
          const tiers = (formData.get('tiers') as string)?.split(',').map((t) => t.trim()) || [];
          return { tiers: tiers.filter(Boolean) };
        }
        return selectedFlag.config;
      })(),
    });
  };

  const handleToggle = async (flag: { name: string; enabled: boolean }) => {
    await updateFlag.mutateAsync({
      flagName: flag.name,
      enabled: !flag.enabled,
    });
  };

  const handleDelete = async (flagName: string) => {
    if (confirm(`Are you sure you want to delete the feature flag "${flagName}"?`)) {
      await deleteFlag.mutateAsync({ flagName });
    }
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Flag className="w-6 h-6 text-primary" />
            Feature Flags
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage feature flags for gradual rollouts and A/B testing
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Create Flag
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search flags..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Types</option>
            <option value="boolean">Boolean</option>
            <option value="percentage">Percentage</option>
            <option value="tier">Tier</option>
          </select>
          <select
            value={enabledFilter}
            onChange={(e) => setEnabledFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="enabled">Enabled</option>
            <option value="disabled">Disabled</option>
          </select>
        </div>
      </div>

      {/* Flags table */}
      <div className="admin-card p-0 overflow-hidden">
        {isLoadingFlags ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : flags.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Type</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Config</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <tr
                    key={flag.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <div>
                        <div className="font-medium text-foreground">{flag.name}</div>
                        {flag.description && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {flag.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-4 text-sm">
                      <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeBadge(flag.type)}`}>
                        {formatTypeName(flag.type)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <button
                        onClick={() => handleToggle(flag)}
                        disabled={updateFlag.isPending}
                        className="flex items-center gap-2"
                      >
                        {flag.enabled ? (
                          <ToggleRight className="w-6 h-6 text-green-400" />
                        ) : (
                          <ToggleLeft className="w-6 h-6 text-gray-400" />
                        )}
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full ${
                            flag.enabled
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                          }`}
                        >
                          {flag.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </button>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {flag.type === 'percentage' && flag.config?.percentage !== undefined && (
                        <span>{flag.config.percentage}% rollout</span>
                      )}
                      {flag.type === 'tier' && flag.config?.tiers && (
                        <span>{flag.config.tiers.length} tier(s)</span>
                      )}
                      {flag.type === 'boolean' && <span>—</span>}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(flag.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowHistoryModal(true);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="View History"
                        >
                          <History className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedFlag(flag);
                            setShowEditModal(true);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(flag.name)}
                          disabled={deleteFlag.isPending}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                          title="Delete"
                        >
                          {deleteFlag.isPending ? (
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
            No feature flags found.
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

      {/* Create Flag Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Create Feature Flag</h3>
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
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    pattern="[a-z0-9_]+"
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Lowercase letters, numbers, and underscores only
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    rows={3}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type *</label>
                  <select
                    name="type"
                    required
                    value={flagType}
                    onChange={(e) => setFlagType(e.target.value)}
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="boolean">Boolean (on/off)</option>
                    <option value="percentage">Percentage Rollout</option>
                    <option value="tier">Tier-based</option>
                  </select>
                </div>
                {flagType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Percentage (0-100)</label>
                    <input
                      type="number"
                      name="percentage"
                      min="0"
                      max="100"
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                {flagType === 'tier' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Enabled Tiers (comma-separated)</label>
                    <input
                      type="text"
                      name="tiers"
                      placeholder="free, creator, pro"
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    value="true"
                    className="w-5 h-5 accent-primary"
                  />
                  <label className="text-sm">Enabled</label>
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
                  disabled={createFlag.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createFlag.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Flag'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Flag Modal */}
      {showEditModal && selectedFlag && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setSelectedFlag(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Edit Feature Flag</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedFlag(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <input
                    type="text"
                    value={selectedFlag.name}
                    disabled
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Type</label>
                  <input
                    type="text"
                    value={formatTypeName(selectedFlag.type)}
                    disabled
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Description</label>
                  <textarea
                    name="description"
                    defaultValue={selectedFlag.description || ''}
                    rows={3}
                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {selectedFlag.type === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Percentage (0-100)</label>
                    <input
                      type="number"
                      name="percentage"
                      defaultValue={selectedFlag.config?.percentage || 0}
                      min="0"
                      max="100"
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                {selectedFlag.type === 'tier' && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Enabled Tiers (comma-separated)</label>
                    <input
                      type="text"
                      name="tiers"
                      defaultValue={selectedFlag.config?.tiers?.join(', ') || ''}
                      placeholder="free, creator, pro"
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="enabled"
                    value="true"
                    defaultChecked={selectedFlag.enabled}
                    className="w-5 h-5 accent-primary"
                  />
                  <label className="text-sm">Enabled</label>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedFlag(null);
                  }}
                  className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateFlag.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {updateFlag.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Updating...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* History Modal */}
      {showHistoryModal && selectedFlag && flagDetails && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowHistoryModal(false);
              setSelectedFlag(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-3xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Flag History: {selectedFlag.name}</h3>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setSelectedFlag(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {flagDetails.history && flagDetails.history.length > 0 ? (
                <div className="space-y-4">
                  {flagDetails.history.map((entry) => (
                    <div key={entry.id} className="p-4 bg-secondary rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">
                          {entry.adminUser?.name || 'System'}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-1">
                        <div>
                          <strong>Old:</strong>{' '}
                          {JSON.stringify(entry.oldConfig, null, 2)}
                        </div>
                        <div>
                          <strong>New:</strong>{' '}
                          {JSON.stringify(entry.newConfig, null, 2)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  No history available
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
