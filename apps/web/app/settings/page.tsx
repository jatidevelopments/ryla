"use client";

import { PageContainer, Button, Label, Switch } from "@ryla/ui";
import Link from "next/link";
import { ProtectedRoute } from "../../components/protected-route";
import { useAuth } from "../../lib/auth-context";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <PageContainer>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-sm text-white/60">Manage your account and preferences</p>
      </div>

      {/* Account Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Account</h2>
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Name</Label>
              <p className="text-sm text-white/60">{user?.name || 'Not set'}</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <Label className="text-white">Username</Label>
              <p className="text-sm text-white/60">@{user?.publicName || 'Not set'}</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <Label className="text-white">Email</Label>
              <p className="text-sm text-white/60">{user?.email || 'Not set'}</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <Label className="text-white">Password</Label>
              <p className="text-sm text-white/60">••••••••</p>
            </div>
            <Button variant="outline" size="sm">Update</Button>
          </div>
        </div>
      </section>

      {/* Subscription Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Subscription</h2>
        <div className="rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Label className="text-white">Free Plan</Label>
                <span className="rounded-full bg-[var(--text-muted)]/20 px-2 py-0.5 text-xs font-medium text-[var(--text-muted)]">
                  Active
                </span>
              </div>
              <p className="text-sm text-white/60">Upgrade for more features</p>
            </div>
            <Button variant="outline" size="sm">Upgrade</Button>
          </div>
          <div className="mt-4 border-t border-white/10 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/60">Credits remaining</span>
              <span className="font-semibold text-white">0 / 0</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
              <div className="h-full w-0 rounded-full bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]" />
            </div>
          </div>
        </div>
      </section>

      {/* Preferences Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Preferences</h2>
        <div className="space-y-4 rounded-lg border border-white/10 bg-white/5 p-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-white">Email Notifications</Label>
              <p className="text-sm text-white/60">Receive updates about your account</p>
            </div>
            <Switch defaultChecked />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <Label className="text-white">Default Quality</Label>
              <p className="text-sm text-white/60">HQ mode for all generations</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between border-t border-white/10 pt-4">
            <div>
              <Label className="text-white">18+ Content</Label>
              <p className="text-sm text-white/60">Enable adult content by default</p>
            </div>
            <Switch />
          </div>
        </div>
      </section>

      {/* Links Section */}
      <section className="mb-8">
        <h2 className="mb-4 text-lg font-semibold text-white">Legal</h2>
        <div className="space-y-2">
          <Link
            href="/legal"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <span className="text-white">Terms of Service</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-white/40"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
          <Link
            href="/legal"
            className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
          >
            <span className="text-white">Privacy Policy</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-5 w-5 text-white/40"
            >
              <path
                fillRule="evenodd"
                d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
      </section>

      {/* Logout */}
      <Button 
        variant="outline" 
        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
        onClick={handleLogout}
      >
        Log Out
      </Button>
    </PageContainer>
  );
}
