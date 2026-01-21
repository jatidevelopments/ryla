'use client';

import { useState } from 'react';
import {
  Settings,
  Shield,
  Users,
  Bell,
  Database,
  Key,
  Save,
  RefreshCw,
} from 'lucide-react';
import { useAdminAuth } from '@/lib/auth-context';

export default function SettingsPage() {
  const { admin, hasRole } = useAdminAuth();
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Settings className="w-6 h-6 text-primary" />
          Settings
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage admin panel configuration
        </p>
      </div>

      {/* Settings sections */}
      <div className="space-y-6">
        {/* Profile section */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Admin Profile</h3>
              <p className="text-sm text-muted-foreground">Your account information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name</label>
              <input
                type="text"
                defaultValue={admin?.name}
                className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                defaultValue={admin?.email}
                className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Role</label>
              <input
                type="text"
                defaultValue={admin?.role?.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
                className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base"
                disabled
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Permissions</label>
              <input
                type="text"
                defaultValue={admin?.permissions?.length === 1 && admin?.permissions[0] === '*' ? 'All Permissions' : `${admin?.permissions?.length || 0} permissions`}
                className="w-full min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base"
                disabled
              />
            </div>
          </div>
        </div>

        {/* Admin users section - only for super_admin */}
        {hasRole('super_admin') && (
          <div className="admin-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">Admin Users</h3>
                <p className="text-sm text-muted-foreground">Manage other admin accounts</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Admin User</p>
                  <p className="text-sm text-muted-foreground">admin@ryla.ai</p>
                </div>
                <span className="px-2 py-1 text-xs rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  Super Admin
                </span>
              </div>
              <button className="min-h-[44px] w-full px-4 py-2 border border-dashed border-border rounded-lg text-muted-foreground hover:text-foreground hover:border-primary transition-colors">
                + Add Admin User
              </button>
            </div>
          </div>
        )}

        {/* Notifications section */}
        <div className="admin-card">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold">Notifications</h3>
              <p className="text-sm text-muted-foreground">Configure alert preferences</p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 cursor-pointer">
              <div>
                <p className="font-medium">Critical Bug Reports</p>
                <p className="text-sm text-muted-foreground">Get notified for critical bugs</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 cursor-pointer">
              <div>
                <p className="font-medium">Payment Failures</p>
                <p className="text-sm text-muted-foreground">Get notified for failed payments</p>
              </div>
              <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary" />
            </label>
            <label className="flex items-center justify-between p-4 rounded-lg bg-secondary/50 cursor-pointer">
              <div>
                <p className="font-medium">High Usage Alerts</p>
                <p className="text-sm text-muted-foreground">Get notified for unusual activity</p>
              </div>
              <input type="checkbox" className="w-5 h-5 accent-primary" />
            </label>
          </div>
        </div>

        {/* API Keys section - only for admin and above */}
        {hasRole(['super_admin', 'admin']) && (
          <div className="admin-card">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <Key className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">API Keys</h3>
                <p className="text-sm text-muted-foreground">Manage service API keys</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Replicate API</p>
                  <p className="text-sm text-muted-foreground font-mono">rp_****...****abc1</p>
                </div>
                <span className="badge-success px-2 py-1 text-xs rounded-full">Active</span>
              </div>
              <div className="flex items-center justify-between p-4 rounded-lg bg-secondary/50">
                <div>
                  <p className="font-medium">Finby API</p>
                  <p className="text-sm text-muted-foreground font-mono">fb_****...****xyz9</p>
                </div>
                <span className="badge-success px-2 py-1 text-xs rounded-full">Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end gap-4">
          <button className="min-h-[44px] px-6 py-2 bg-secondary rounded-lg font-medium flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="min-h-[44px] px-6 py-2 bg-gradient-primary text-white rounded-lg font-medium flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
