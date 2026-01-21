'use client';

import { useState } from 'react';
import {
  BarChart3,
  Users,
  CreditCard,
  Image as ImageIcon,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import Link from 'next/link';
import { routes } from '@/lib/routes';

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'1d' | '7d' | '30d' | '90d'>('7d');

  // Fetch analytics metrics
  const { data: metrics, isLoading: isLoadingMetrics } =
    adminTrpc.analytics.getMetrics.useQuery({
      timeRange,
    });

  // Fetch time series data
  const { data: timeSeries, isLoading: isLoadingTimeSeries } =
    adminTrpc.analytics.getTimeSeries.useQuery({
      timeRange,
    });

  // Fetch top users
  const { data: topUsers, isLoading: isLoadingTopUsers } =
    adminTrpc.analytics.getTopUsers.useQuery({
      limit: 5,
      timeRange: '7d',
      metric: 'images',
    });

  // Fetch system health
  const { data: systemHealth, isLoading: isLoadingHealth } =
    adminTrpc.system.getHealth.useQuery(undefined, {
      refetchInterval: 30000, // Refetch every 30 seconds
    });

  const maxImages =
    timeSeries?.images && timeSeries.images.length > 0
      ? Math.max(...timeSeries.images.map((d) => d.count))
      : 1;

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics & Monitoring
          </h2>
          <p className="text-muted-foreground mt-1">
            Platform metrics and performance insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-muted-foreground" />
          <select
            value={timeRange}
            onChange={(e) =>
              setTimeRange(e.target.value as '1d' | '7d' | '30d' | '90d')
            }
            className="min-h-[44px] px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="1d">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Metrics grid */}
      {isLoadingMetrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-card animate-pulse">
              <div className="h-20 bg-secondary/50 rounded" />
            </div>
          ))}
        </div>
      ) : metrics ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Daily Active Users</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{metrics.dau.toLocaleString()}</p>
            <p className="text-sm mt-1 text-muted-foreground">
              {metrics.totalUsers.toLocaleString()} total users
            </p>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Revenue (MTD)</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <CreditCard className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              ${metrics.monthlyRevenue.toLocaleString()}
            </p>
            <p className="text-sm mt-1 text-muted-foreground">
              Active subscriptions
            </p>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">Images Generated</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <ImageIcon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">
              {metrics.imagesGenerated.toLocaleString()}
            </p>
            <p
              className={`text-sm mt-1 ${
                metrics.imagesChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {metrics.imagesChange >= 0 ? '+' : ''}
              {metrics.imagesChange.toFixed(1)}% from previous period
            </p>
          </div>

          <div className="admin-card">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-muted-foreground">New Users</span>
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold">{metrics.newUsers.toLocaleString()}</p>
            <p
              className={`text-sm mt-1 ${
                metrics.usersChange >= 0 ? 'text-green-400' : 'text-red-400'
              }`}
            >
              {metrics.usersChange >= 0 ? '+' : ''}
              {metrics.usersChange.toFixed(1)}% from previous period
            </p>
          </div>
        </div>
      ) : (
        <div className="admin-card text-center py-8">
          <p className="text-muted-foreground">Failed to load metrics</p>
        </div>
      )}

      {/* Charts section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activity chart */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-6">
            <Activity className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Images Generated</h3>
          </div>
          {isLoadingTimeSeries ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : timeSeries?.images && timeSeries.images.length > 0 ? (
            <div className="flex items-end justify-between gap-2 h-40">
              {timeSeries.images.map((data, idx) => (
                <div
                  key={idx}
                  className="flex-1 flex flex-col items-center gap-2 group"
                >
                  <div
                    className="w-full bg-gradient-to-t from-purple-500 to-pink-500 rounded-t-sm transition-all hover:opacity-80 cursor-pointer"
                    style={{ height: `${(data.count / maxImages) * 100}%` }}
                    title={`${data.period}: ${data.count} images`}
                  />
                  <span className="text-xs text-muted-foreground">
                    {data.period}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No data available</p>
            </div>
          )}
        </div>

        {/* Top users */}
        <div className="admin-card">
          <div className="flex items-center gap-2 mb-6">
            <Users className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold">Top Users (Last 7 Days)</h3>
          </div>
          {isLoadingTopUsers ? (
            <div className="flex items-center justify-center h-40">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : topUsers && topUsers.length > 0 ? (
            <div className="space-y-3">
              {topUsers.map((user, idx) => (
                <Link
                  key={user.userId}
                  href={routes.user.detail(user.userId)}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-primary">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{user.email}</p>
                      {user.name && (
                        <p className="text-xs text-muted-foreground">{user.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-muted-foreground">
                      {user.images > 0 && `${user.images} images`}
                      {user.credits > 0 && `${user.credits} credits`}
                      {user.revenue > 0 && `$${user.revenue}`}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No users found</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional stats */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Images</span>
              <ImageIcon className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">
              {metrics.totalImages.toLocaleString()}
            </p>
          </div>
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Credits Spent</span>
              <CreditCard className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">
              {metrics.creditsSpent.toLocaleString()}
            </p>
          </div>
          <div className="admin-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Total Users</span>
              <Users className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xl font-bold">
              {metrics.totalUsers.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* System Health */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">System Health</h3>
          {systemHealth && (
            <div className="flex items-center gap-2">
              {systemHealth.overall.healthy ? (
                <CheckCircle2 className="w-5 h-5 text-green-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400" />
              )}
              <span
                className={`text-sm font-medium ${
                  systemHealth.overall.healthy
                    ? 'text-green-400'
                    : 'text-yellow-400'
                }`}
              >
                {systemHealth.overall.status.toUpperCase()}
              </span>
            </div>
          )}
        </div>
        {isLoadingHealth ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : systemHealth ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Database */}
            <div
              className={`p-4 rounded-lg border ${
                systemHealth.database.healthy
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {systemHealth.database.healthy ? (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
                <span
                  className={`text-sm font-medium ${
                    systemHealth.database.healthy
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  Database
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Response: {systemHealth.database.responseTime}ms
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Size: {systemHealth.database.size}
              </p>
            </div>

            {/* Generation Queue */}
            <div
              className={`p-4 rounded-lg border ${
                systemHealth.generation.healthy
                  ? 'bg-green-500/10 border-green-500/20'
                  : 'bg-yellow-500/10 border-yellow-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {systemHealth.generation.healthy ? (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                )}
                <span
                  className={`text-sm font-medium ${
                    systemHealth.generation.healthy
                      ? 'text-green-400'
                      : 'text-yellow-400'
                  }`}
                >
                  Generation
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Queue: {systemHealth.generation.totalActive} jobs
              </p>
              {systemHealth.generation.recentFailed > 0 && (
                <p className="text-xs text-red-400 mt-1">
                  {systemHealth.generation.recentFailed} failed (1h)
                </p>
              )}
            </div>

            {/* Storage */}
            <div
              className={`p-4 rounded-lg border ${
                systemHealth.storage.status === 'healthy'
                  ? 'bg-green-500/10 border-green-500/20'
                  : systemHealth.storage.status === 'caution'
                    ? 'bg-yellow-500/10 border-yellow-500/20'
                    : 'bg-red-500/10 border-red-500/20'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                {systemHealth.storage.status === 'healthy' ? (
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                ) : systemHealth.storage.status === 'caution' ? (
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
                <span
                  className={`text-sm font-medium ${
                    systemHealth.storage.status === 'healthy'
                      ? 'text-green-400'
                      : systemHealth.storage.status === 'caution'
                        ? 'text-yellow-400'
                        : 'text-red-400'
                  }`}
                >
                  Storage
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {systemHealth.storage.usagePercentage}% used
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                ~{systemHealth.storage.estimatedStorageGB} GB
              </p>
            </div>

            {/* API Status (simplified - always healthy if we can query) */}
            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-sm font-medium text-green-400">API</span>
              </div>
              <p className="text-sm text-muted-foreground">Status: Operational</p>
              <p className="text-xs text-muted-foreground mt-1">
                Admin panel active
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Failed to load system health</p>
          </div>
        )}
      </div>
    </div>
  );
}
