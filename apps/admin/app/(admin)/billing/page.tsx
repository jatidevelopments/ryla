'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import {
  CreditCard,
  Search,
  Filter,
  RefreshCw,
  DollarSign,
  TrendingUp,
  Plus,
  ArrowLeftRight,
  Loader2,
  User,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';

function getTypeBadge(type: string) {
  switch (type) {
    case 'subscription_grant':
      return 'bg-purple-500/20 text-purple-400 border border-purple-500/30';
    case 'purchase':
      return 'bg-green-500/20 text-green-400 border border-green-500/30';
    case 'refund':
      return 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30';
    case 'admin_adjustment':
      return 'bg-blue-500/20 text-blue-400 border border-blue-500/30';
    case 'generation':
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
    case 'bonus':
      return 'bg-pink-500/20 text-pink-400 border border-pink-500/30';
    default:
      return 'bg-gray-500/20 text-gray-400 border border-gray-500/30';
  }
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const userIdParam = searchParams.get('userId');
  
  const [searchUserId, setSearchUserId] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userIdParam);
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [page, setPage] = useState(0);
  const limit = 50;

  // Search for user
  const { data: searchResults } = adminTrpc.users.search.useQuery(
    { query: searchUserId, limit: 10 },
    { enabled: searchUserId.length > 0 }
  );

  // Get billing stats
  const { data: stats } = adminTrpc.billing.getStats.useQuery({ period: 'month' });

  // Get user credits if user selected
  const { data: userCredits } = adminTrpc.billing.getUserCredits.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  // Get transactions if user selected
  const { data: transactionsData, isLoading: transactionsLoading } = adminTrpc.billing.getTransactions.useQuery(
    {
      userId: selectedUserId!,
      limit,
      offset: page * limit,
      type: typeFilter === 'all' ? undefined : typeFilter,
    },
    { enabled: !!selectedUserId }
  );

  // Get subscription if user selected
  const { data: subscription } = adminTrpc.billing.getUserSubscription.useQuery(
    { userId: selectedUserId! },
    { enabled: !!selectedUserId }
  );

  // Mutations
  const addCredits = adminTrpc.billing.addCredits.useMutation({
    onSuccess: (data) => {
      toast.success('Credits added successfully', {
        description: `New balance: ${data.newBalance.toLocaleString()} credits`,
      });
      // Refetch credits and transactions
      window.location.reload(); // Simple refresh for now
    },
    onError: (error) => {
      toast.error('Failed to add credits', { description: error.message });
    },
  });

  const refundCredits = adminTrpc.billing.refundCredits.useMutation({
    onSuccess: (data) => {
      toast.success('Refund issued successfully', {
        description: `New balance: ${data.newBalance.toLocaleString()} credits`,
      });
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Failed to refund credits', { description: error.message });
    },
  });

  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination || { total: 0, limit, offset: 0, hasMore: false };

  const handleAddCredits = async () => {
    if (!selectedUserId) return;
    const amount = prompt('Enter credit amount (1-10000):');
    if (!amount || isNaN(Number(amount))) return;
    const reason = prompt('Enter reason:');
    if (!reason) return;
    await addCredits.mutateAsync({
      userId: selectedUserId,
      amount: Number(amount),
      reason,
      category: 'other',
    });
  };

  const handleRefund = async () => {
    if (!selectedUserId) return;
    const amount = prompt('Enter refund amount:');
    if (!amount || isNaN(Number(amount))) return;
    const reason = prompt('Enter reason:');
    if (!reason) return;
    await refundCredits.mutateAsync({
      userId: selectedUserId,
      amount: Number(amount),
      reason,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <CreditCard className="w-6 h-6 text-primary" />
          Credits & Billing
        </h2>
        <p className="text-muted-foreground mt-1">
          Manage transactions, subscriptions, and credit operations
        </p>
      </div>

      {/* Billing Stats */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="admin-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-500/10 text-green-400">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Added (This Month)</p>
                <p className="text-xl font-bold">{stats.creditsAdded.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-400">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Refunds (This Month)</p>
                <p className="text-xl font-bold">{stats.refunds.toLocaleString()}</p>
              </div>
            </div>
          </div>
          <div className="admin-card">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Credits Spent (This Month)</p>
                <p className="text-xl font-bold">{stats.creditsSpent.toLocaleString()}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Search */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4">Select User</h3>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search user by email or name..."
            value={searchUserId}
            onChange={(e) => setSearchUserId(e.target.value)}
            className="w-full min-h-[44px] pl-10 pr-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchResults && searchResults.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-popover border border-border rounded-lg shadow-lg max-h-60 overflow-auto">
              {searchResults.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    setSelectedUserId(user.id);
                    setSearchUserId('');
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-secondary min-h-[44px] flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{user.name}</p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* User Billing Info */}
      {selectedUserId && userCredits && (
        <div className="space-y-4">
          {/* Credit Balance Card */}
          <div className="admin-card">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Credit Balance</h3>
                <div className="space-y-1">
                  <p className="text-3xl font-bold">{userCredits.balance.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground">
                    Total Earned: {userCredits.totalEarned.toLocaleString()} | Total Spent: {userCredits.totalSpent.toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={handleAddCredits}
                  disabled={addCredits.isPending}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-primary text-primary-foreground rounded-lg font-medium disabled:opacity-50"
                >
                  <Plus className="w-4 h-4" />
                  {addCredits.isPending ? 'Adding...' : 'Add Credits'}
                </button>
                <button
                  onClick={handleRefund}
                  disabled={refundCredits.isPending}
                  className="flex items-center justify-center gap-2 min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg font-medium disabled:opacity-50"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  {refundCredits.isPending ? 'Refunding...' : 'Refund Credits'}
                </button>
              </div>
            </div>
          </div>

          {/* Subscription Info */}
          {subscription && (
            <div className="admin-card">
              <h3 className="text-lg font-semibold mb-4">Subscription</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Tier</p>
                  <p className="font-medium capitalize">{subscription.tier}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                {subscription.finbySubscriptionId && (
                  <div>
                    <p className="text-sm text-muted-foreground">Finby ID</p>
                    <p className="font-medium text-sm">{subscription.finbySubscriptionId}</p>
                  </div>
                )}
                {subscription.currentPeriodEnd && (
                  <div>
                    <p className="text-sm text-muted-foreground">Period End</p>
                    <p className="font-medium">
                      {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      {selectedUserId && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transaction History</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-muted-foreground" />
              <select
                value={typeFilter}
                onChange={(e) => {
                  setTypeFilter(e.target.value);
                  setPage(0);
                }}
                className="min-h-[44px] px-4 py-2 bg-secondary border border-border rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="all">All Types</option>
                <option value="subscription_grant">Subscription Grants</option>
                <option value="purchase">Purchases</option>
                <option value="generation">Generation</option>
                <option value="refund">Refunds</option>
                <option value="admin_adjustment">Admin Adjustments</option>
                <option value="bonus">Bonuses</option>
              </select>
            </div>
          </div>

          <div className="admin-card p-0 overflow-hidden">
            {transactionsLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : transactions.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No transactions found
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Balance After</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id}>
                          <td className="text-sm text-muted-foreground">
                            {new Date(tx.createdAt).toLocaleString()}
                          </td>
                          <td>
                            <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeBadge(tx.type)}`}>
                              {tx.type.replace('_', ' ')}
                            </span>
                          </td>
                          <td>{tx.description || '-'}</td>
                          <td>
                            <span className={tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}>
                              {tx.amount >= 0 ? '+' : ''}{tx.amount}
                            </span>
                          </td>
                          <td className="text-muted-foreground">{tx.balanceAfter.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-border">
                  {transactions.map((tx) => (
                    <div key={tx.id} className="p-4 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{tx.description || tx.type}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(tx.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <span className={`font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs rounded-full ${getTypeBadge(tx.type)}`}>
                          {tx.type.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          Balance: {tx.balanceAfter.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pagination */}
          {pagination.total > 0 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {pagination.offset + 1}-{Math.min(pagination.offset + pagination.limit, pagination.total)} of {pagination.total} transactions
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0 || transactionsLoading}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={!pagination.hasMore || transactionsLoading}
                  className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border disabled:opacity-50 hover:bg-secondary"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!selectedUserId && (
        <div className="admin-card text-center py-12">
          <p className="text-muted-foreground">Search for a user above to view their billing information</p>
        </div>
      )}
    </div>
  );
}
