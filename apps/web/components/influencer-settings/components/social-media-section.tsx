'use client';

import * as React from 'react';
import { Instagram, Twitter, Music, Lock } from 'lucide-react';

export function SocialMediaSection() {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-[var(--text-primary)]">Social Media Connections</h2>
      <div className="bg-[var(--bg-subtle)] border border-[var(--border-default)] rounded-xl p-6 space-y-4 opacity-60">
        <p className="text-sm text-[var(--text-muted)] mb-4">
          Connect your social media accounts to automatically post content. Coming soon!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Instagram */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
              <Instagram className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">Instagram</span>
                <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
            <Lock className="h-4 w-4 text-[var(--text-muted)]" />
          </div>

          {/* Twitter/X */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <Twitter className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">Twitter / X</span>
                <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
            <Lock className="h-4 w-4 text-[var(--text-muted)]" />
          </div>

          {/* TikTok */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-black flex items-center justify-center">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">TikTok</span>
                <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
            <Lock className="h-4 w-4 text-[var(--text-muted)]" />
          </div>

          {/* OnlyFans */}
          <div className="flex items-center gap-3 p-4 bg-[var(--bg-surface)] border border-[var(--border-default)] rounded-lg">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <span className="text-white text-xs font-bold">OF</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text-primary)]">OnlyFans</span>
                <span className="text-xs px-2 py-0.5 bg-[var(--bg-subtle)] text-[var(--text-muted)] rounded-full">
                  Coming Soon
                </span>
              </div>
            </div>
            <Lock className="h-4 w-4 text-[var(--text-muted)]" />
          </div>
        </div>
      </div>
    </section>
  );
}

