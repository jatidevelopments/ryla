'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import {
  Users,
  Search,
  Plus,
  Filter,
  Loader2,
  Edit,
  Trash2,
  Key,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { format, formatDistanceToNow } from 'date-fns';
import { useAdminAuth } from '@/lib/auth-context';

function getRoleBadge(role: string) {
  switch (role) {
    case 'super_admin':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'admin':
      return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
    case 'support':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'moderator':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'viewer':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

function formatRoleName(role: string): string {
  return role.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

export default function AdminsPage() {
  const { admin: currentAdmin, hasRole } = useAdminAuth();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const [selectedAdmin, setSelectedAdmin] = useState<any | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);
  const limit = 50;

  // Only super_admin can access
  if (!hasRole('super_admin')) {
    return (
      <div className="space-y-6">
        <div className="admin-card text-center py-12">
          <Shield className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">
            Only super_admin can access admin user management
          </p>
        </div>
      </div>
    );
  }

  // Get admin users
  const {
    data: adminsData,
    isLoading: isLoadingAdmins,
    refetch: refetchAdmins,
  } = adminTrpc.admins.list.useQuery({
    limit,
    offset: page * limit,
    search: search || undefined,
    role: roleFilter === 'all' ? undefined : (roleFilter as 'super_admin' | 'admin' | 'support' | 'moderator' | 'viewer'),
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Mutations
  const createAdmin = adminTrpc.admins.create.useMutation({
    onSuccess: () => {
      toast.success('Admin user created successfully');
      refetchAdmins();
      setShowCreateModal(false);
    },
    onError: (error) => {
      toast.error('Failed to create admin user', { description: error.message });
    },
  });

  const updateAdmin = adminTrpc.admins.update.useMutation({
    onSuccess: () => {
      toast.success('Admin user updated successfully');
      refetchAdmins();
      setShowEditModal(false);
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error('Failed to update admin user', { description: error.message });
    },
  });

  const resetPassword = adminTrpc.admins.resetPassword.useMutation({
    onSuccess: () => {
      toast.success('Password reset successfully');
      setShowResetPasswordModal(false);
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error('Failed to reset password', { description: error.message });
    },
  });

  const deleteAdmin = adminTrpc.admins.delete.useMutation({
    onSuccess: () => {
      toast.success('Admin user deleted successfully');
      refetchAdmins();
      setSelectedAdmin(null);
    },
    onError: (error) => {
      toast.error('Failed to delete admin user', { description: error.message });
    },
  });

  const admins = adminsData?.admins || [];
  const pagination = adminsData?.pagination || {
    total: 0,
    limit,
    offset: 0,
    hasMore: false,
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    await createAdmin.mutateAsync({
      email: formData.get('email') as string,
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      password: formData.get('password') as string,
      isActive: formData.get('isActive') === 'true',
    });
  };

  const handleUpdate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    const formData = new FormData(e.currentTarget);
    await updateAdmin.mutateAsync({
      adminId: selectedAdmin.id,
      name: formData.get('name') as string,
      role: formData.get('role') as any,
      isActive: formData.get('isActive') === 'true',
    });
  };

  const handleResetPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAdmin) return;
    const formData = new FormData(e.currentTarget);
    await resetPassword.mutateAsync({
      adminId: selectedAdmin.id,
      newPassword: formData.get('newPassword') as string,
    });
  };

  const handleDelete = async (adminId: string, email: string) => {
    if (
      confirm(
        `Are you sure you want to delete "${email}"? This will disable their account.`
      )
    ) {
      const reason = prompt('Please provide a reason for deleting this admin (optional):');
      await deleteAdmin.mutateAsync({
        adminId,
        reason: reason || undefined,
      });
    }
  };

  const handleToggleActive = async (admin: { id: string; isActive: boolean }) => {
    await updateAdmin.mutateAsync({
      adminId: admin.id,
      isActive: !admin.isActive,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6 text-primary" />
            Admin User Management
          </h2>
          <p className="text-muted-foreground mt-1">
            Manage admin accounts and permissions
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg font-medium flex items-center gap-2 w-full md:w-auto justify-center"
        >
          <Plus className="w-5 h-5" />
          Add Admin User
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-muted-foreground hidden sm:block" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Roles</option>
            <option value="super_admin">Super Admin</option>
            <option value="admin">Admin</option>
            <option value="support">Support</option>
            <option value="moderator">Moderator</option>
            <option value="viewer">Viewer</option>
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Admins table */}
      <div className="admin-card p-0 overflow-hidden">
        {isLoadingAdmins ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : admins.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Email</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Name</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Role</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Status</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Last Login</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Created</th>
                  <th className="p-4 text-sm font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {admins.map((admin) => (
                  <tr
                    key={admin.id}
                    className="border-b border-border hover:bg-secondary/50 transition-colors"
                  >
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        {admin.id === currentAdmin?.id && (
                          <span className="text-xs text-muted-foreground">(You)</span>
                        )}
                        <span className="text-foreground">{admin.email}</span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-foreground">{admin.name}</td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${getRoleBadge(admin.role)}`}
                      >
                        {formatRoleName(admin.role)}
                      </span>
                    </td>
                    <td className="p-4 text-sm">
                      <span
                        className={`px-2 py-0.5 text-xs rounded-full ${
                          admin.isActive
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-gray-500/20 text-gray-400 border border-gray-500/30'
                        }`}
                      >
                        {admin.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {admin.lastLoginAt
                        ? formatDistanceToNow(new Date(admin.lastLoginAt), { addSuffix: true })
                        : 'Never'}
                    </td>
                    <td className="p-4 text-sm text-muted-foreground">
                      {format(new Date(admin.createdAt), 'MMM dd, yyyy')}
                    </td>
                    <td className="p-4 text-sm">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowEditModal(true);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedAdmin(admin);
                            setShowResetPasswordModal(true);
                          }}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                          title="Reset Password"
                        >
                          <Key className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(admin)}
                          disabled={updateAdmin.isPending || admin.id === currentAdmin?.id}
                          className="min-h-[36px] min-w-[36px] flex items-center justify-center text-muted-foreground hover:text-green-400 hover:bg-green-500/10 rounded-lg transition-colors disabled:opacity-50"
                          title={admin.isActive ? 'Disable' : 'Enable'}
                        >
                          {admin.isActive ? (
                            <UserX className="w-4 h-4" />
                          ) : (
                            <UserCheck className="w-4 h-4" />
                          )}
                        </button>
                        {admin.id !== currentAdmin?.id && (
                          <button
                            onClick={() => handleDelete(admin.id, admin.email)}
                            disabled={deleteAdmin.isPending}
                            className="min-h-[36px] min-w-[36px] flex items-center justify-center bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                            title="Delete"
                          >
                            {deleteAdmin.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
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
            No admin users found.
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

      {/* Create Admin Modal */}
      {showCreateModal && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Create Admin User</h3>
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
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Role *</label>
                  <select
                    name="role"
                    required
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="moderator">Moderator</option>
                    <option value="support">Support</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Password *</label>
                  <input
                    type="password"
                    name="password"
                    required
                    minLength={8}
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 8 characters
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="isActive"
                    value="true"
                    defaultChecked
                    className="w-5 h-5 accent-primary"
                  />
                  <label className="text-sm">Active</label>
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
                  disabled={createAdmin.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createAdmin.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </span>
                  ) : (
                    'Create Admin'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && selectedAdmin && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowEditModal(false);
              setSelectedAdmin(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Edit Admin User</h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAdmin(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleUpdate} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <input
                    type="email"
                    value={selectedAdmin.email}
                    disabled
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Name *</label>
                  <input
                    type="text"
                    name="name"
                    defaultValue={selectedAdmin.name}
                    required
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {selectedAdmin.id !== currentAdmin?.id && (
                  <div>
                    <label className="block text-sm font-medium mb-2">Role *</label>
                    <select
                      name="role"
                      defaultValue={selectedAdmin.role}
                      required
                      className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="viewer">Viewer</option>
                      <option value="moderator">Moderator</option>
                      <option value="support">Support</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                  </div>
                )}
                {selectedAdmin.id !== currentAdmin?.id && (
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      name="isActive"
                      value="true"
                      defaultChecked={selectedAdmin.isActive}
                      className="w-5 h-5 accent-primary"
                    />
                    <label className="text-sm">Active</label>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium mb-2">Permissions</label>
                  <div className="p-3 bg-secondary rounded-lg text-sm text-muted-foreground">
                    {selectedAdmin.permissions?.length === 1 &&
                    selectedAdmin.permissions[0] === '*' ? (
                      'All Permissions'
                    ) : (
                      <div className="flex flex-wrap gap-2">
                        {selectedAdmin.permissions?.map((perm: string) => (
                          <span
                            key={perm}
                            className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs"
                          >
                            {perm}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Permissions are automatically assigned based on role
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateAdmin.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {updateAdmin.isPending ? (
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

      {/* Reset Password Modal */}
      {showResetPasswordModal && selectedAdmin && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
            onClick={() => {
              setShowResetPasswordModal(false);
              setSelectedAdmin(null);
            }}
          />
          <div className="fixed inset-4 md:inset-8 lg:inset-16 z-50 bg-card border border-border rounded-xl overflow-hidden flex flex-col max-w-2xl mx-auto">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-semibold">Reset Password</h3>
              <button
                onClick={() => {
                  setShowResetPasswordModal(false);
                  setSelectedAdmin(null);
                }}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-secondary rounded-lg"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleResetPassword} className="flex-1 overflow-y-auto p-4 md:p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Admin</label>
                  <input
                    type="text"
                    value={`${selectedAdmin.name} (${selectedAdmin.email})`}
                    disabled
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base opacity-50 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">New Password *</label>
                  <input
                    type="password"
                    name="newPassword"
                    required
                    minLength={8}
                    className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum 8 characters
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-border">
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPasswordModal(false);
                    setSelectedAdmin(null);
                  }}
                  className="min-h-[44px] px-4 py-2 bg-secondary rounded-lg text-sm font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={resetPassword.isPending}
                  className="min-h-[44px] px-4 py-2 bg-gradient-primary text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {resetPassword.isPending ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Resetting...
                    </span>
                  ) : (
                    'Reset Password'
                  )}
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
