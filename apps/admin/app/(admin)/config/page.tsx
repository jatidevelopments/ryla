'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Settings,
  Search,
  Loader2,
  Edit,
  History,
  ChevronDown,
  ChevronRight,
  Database,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { formatDistanceToNow } from 'date-fns';
import { useAdminAuth } from '@/lib/auth-context';

export default function ConfigPage() {
  const { hasRole } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyKey, setHistoryKey] = useState<string | null>(null);

  // Get system configs
  const {
    data: configData,
    isLoading: isLoadingConfig,
    refetch: refetchConfig,
  } = adminTrpc.config.list.useQuery({
    search: search || undefined,
  });

  // Get config history
  const { data: configHistory } = adminTrpc.config.getHistory.useQuery(
    { key: historyKey || '', limit: 20 },
    { enabled: !!historyKey && showHistoryModal }
  );

  // Mutations
  const setConfig = adminTrpc.config.set.useMutation({
    onSuccess: () => {
      toast.success('Configuration updated successfully');
      refetchConfig();
      setEditingKey(null);
    },
    onError: (error) => {
      toast.error('Failed to update configuration', { description: error.message });
    },
  });

  const initializeDefaults = adminTrpc.config.initializeDefaults.useMutation({
    onSuccess: (data) => {
      toast.success(
        `Initialized ${data.initialized} default configurations (${data.skipped} already existed)`
      );
      refetchConfig();
    },
    onError: (error) => {
      toast.error('Failed to initialize defaults', { description: error.message });
    },
  });

  const grouped = configData?.grouped || {};
  const categories = configData?.categories || [];

  const toggleCategory = (category: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(category)) {
      newExpanded.delete(category);
    } else {
      newExpanded.add(category);
    }
    setExpandedCategories(newExpanded);
  };

  const handleSave = async (e: React.FormEvent<HTMLFormElement>, key: string, config: { validationType?: string }) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    let value: unknown;
    
    // Handle boolean checkbox
    if (config.validationType === 'boolean') {
      value = formData.get('value') === 'on' || formData.get('value') === 'true';
    } else {
      const valueInput = formData.get('value') as string;
      
      // Try to parse as JSON first, fallback to string
      try {
        value = JSON.parse(valueInput);
      } catch {
        // If not JSON, try to infer type
        if (valueInput === 'true' || valueInput === 'false') {
          value = valueInput === 'true';
        } else if (!isNaN(Number(valueInput)) && valueInput.trim() !== '') {
          value = Number(valueInput);
        } else {
          value = valueInput;
        }
      }
    }

    await setConfig.mutateAsync({
      key,
      value,
    });
  };

  const getValueDisplay = (value: unknown): string => {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  };


  if (isLoadingConfig) {
    return (
      <div className="space-y-6">
        <div className="admin-card flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Settings className="w-6 h-6 text-primary" />
            System Configuration
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage system-wide configuration settings
          </p>
        </div>
        {hasRole('super_admin') && (
          <button
            onClick={() => initializeDefaults.mutate()}
            disabled={initializeDefaults.isPending}
            className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center disabled:opacity-50"
          >
            {initializeDefaults.isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Database className="w-5 h-5" />
            )}
            Initialize Defaults
          </button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search configurations..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Configs by category */}
      <div className="space-y-4">
        {categories.length > 0 ? (
          categories.map((category) => {
            const categoryConfigs = grouped[category] || [];
            const isExpanded = expandedCategories.has(category);

            return (
              <div key={category} className="admin-card p-0 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                    <h3 className="font-semibold capitalize">{category}</h3>
                    <span className="text-xs text-muted-foreground">
                      ({categoryConfigs.length} configs)
                    </span>
                  </div>
                </button>

                {isExpanded && (
                  <div className="border-t border-border">
                    {categoryConfigs.map((config) => (
                      <div
                        key={config.id}
                        className="p-4 border-b border-border last:border-b-0 hover:bg-secondary/30 transition-colors"
                      >
                        {editingKey === config.key ? (
                          <form onSubmit={(e) => handleSave(e, config.key, config)}>
                            <div className="space-y-3">
                              <div>
                                <label className="block text-sm font-medium mb-2">
                                  {config.key}
                                </label>
                                {config.validationType === 'boolean' ? (
                                  <div className="flex items-center gap-2">
                                    <input
                                      type="checkbox"
                                      name="value"
                                      defaultChecked={config.value === true}
                                      className="w-5 h-5 accent-primary"
                                    />
                                    <span className="text-sm text-muted-foreground">
                                      {config.value === true ? 'Enabled' : 'Disabled'}
                                    </span>
                                  </div>
                                ) : (
                                  <textarea
                                    name="value"
                                    defaultValue={getValueDisplay(config.value)}
                                    rows={config.validationType === 'json' ? 5 : 2}
                                    className="w-full px-4 py-2 bg-secondary border border-border rounded-lg text-base font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                                  />
                                )}
                              </div>
                              {config.description && (
                                <p className="text-xs text-muted-foreground">
                                  {config.description}
                                </p>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="text-xs text-muted-foreground">
                                  {config.updatedByAdmin && (
                                    <span>
                                      Last updated by {config.updatedByAdmin.name}{' '}
                                      {formatDistanceToNow(new Date(config.updatedAt), {
                                        addSuffix: true,
                                      })}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => setEditingKey(null)}
                                    className="min-h-[36px] px-3 py-1.5 bg-secondary rounded-lg text-sm font-medium"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    type="submit"
                                    disabled={setConfig.isPending}
                                    className="min-h-[36px] px-3 py-1.5 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                                  >
                                    {setConfig.isPending ? (
                                      <span className="flex items-center gap-2">
                                        <Loader2 className="w-3 h-3 animate-spin" />
                                        Saving...
                                      </span>
                                    ) : (
                                      'Save'
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </form>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{config.key}</div>
                                {config.description && (
                                  <p className="text-xs text-muted-foreground mt-1">
                                    {config.description}
                                  </p>
                                )}
                                <div className="mt-2">
                                  <pre className="text-xs bg-secondary p-2 rounded font-mono overflow-x-auto">
                                    {getValueDisplay(config.value)}
                                  </pre>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => {
                                    setHistoryKey(config.key);
                                    setShowHistoryModal(true);
                                  }}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="View History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setEditingKey(config.key)}
                                  className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            {config.updatedByAdmin && (
                              <div className="text-xs text-muted-foreground">
                                Updated by {config.updatedByAdmin.name}{' '}
                                {formatDistanceToNow(new Date(config.updatedAt), {
                                  addSuffix: true,
                                })}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="admin-card text-center py-12 text-muted-foreground">
            No configurations found.
            {hasRole('super_admin') && (
              <div className="mt-4">
                <button
                  onClick={() => initializeDefaults.mutate()}
                  className="text-primary hover:underline"
                >
                  Initialize default configurations
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* History Modal */}
      {showHistoryModal && historyKey && configHistory && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowHistoryModal(false);
              setHistoryKey(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-3xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Config History: {historyKey}</h3>
              <button
                onClick={() => {
                  setShowHistoryModal(false);
                  setHistoryKey(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {configHistory.length > 0 ? (
                <div className="space-y-4">
                  {configHistory.map((entry) => (
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
                          <pre className="inline-block font-mono">
                            {JSON.stringify(entry.oldValue, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <strong>New:</strong>{' '}
                          <pre className="inline-block font-mono">
                            {JSON.stringify(entry.newValue, null, 2)}
                          </pre>
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
