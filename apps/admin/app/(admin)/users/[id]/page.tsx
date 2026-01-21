'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  ArrowLeft,
  User,
  Mail,
  Calendar,
  CreditCard,
  Image,
  Users,
  Ban,
  CheckCircle,
  Loader2,
  ExternalLink,
} from 'lucide-react';
import { adminTrpc } from '@/lib/trpc/client';
import { routes } from '@/lib/routes';
import Link from 'next/link';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  // Fetch user data
  const { data: user, isLoading, error } = adminTrpc.users.get.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Fetch user credits
  const { data: credits } = adminTrpc.users.getCredits.useQuery(
    { userId, limit: 10, offset: 0 },
    { enabled: !!userId }
  );

  // Fetch subscription
  const { data: subscription } = adminTrpc.users.getSubscription.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Fetch characters
  const { data: characters } = adminTrpc.users.getCharacters.useQuery(
    { userId },
    { enabled: !!userId }
  );

  // Fetch images
  const { data: images } = adminTrpc.users.getImages.useQuery(
    { userId, limit: 20, offset: 0 },
    { enabled: !!userId }
  );

  // Mutations
  const banUser = adminTrpc.users.ban.useMutation({
    onSuccess: () => {
      toast.success('User banned successfully');
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Failed to ban user', { description: error.message });
    },
  });

  const unbanUser = adminTrpc.users.unban.useMutation({
    onSuccess: () => {
      toast.success('User unbanned successfully');
      window.location.reload();
    },
    onError: (error) => {
      toast.error('Failed to unban user', { description: error.message });
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <p className="text-red-400 mb-4">User not found</p>
        <Link
          href={routes.users}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg"
        >
          Back to Users
        </Link>
      </div>
    );
  }

  const handleBan = async () => {
    if (confirm('Are you sure you want to ban this user?')) {
      const reason = prompt('Please provide a reason for banning this user:');
      if (reason) {
        await banUser.mutateAsync({ userId, reason });
      }
    }
  };

  const handleUnban = async () => {
    if (confirm('Are you sure you want to unban this user?')) {
      await unbanUser.mutateAsync({ userId });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => router.back()}
          className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg border border-border hover:bg-secondary"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <User className="w-6 h-6 text-primary" />
            User Details
          </h2>
          <p className="text-muted-foreground mt-1">{user.email}</p>
        </div>
        {user.banned ? (
          <button
            onClick={handleUnban}
            disabled={unbanUser.isPending}
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 bg-green-500/20 text-green-400 border border-green-500/30 rounded-lg font-medium disabled:opacity-50"
          >
            <CheckCircle className="w-4 h-4" />
            {unbanUser.isPending ? 'Unbanning...' : 'Unban User'}
          </button>
        ) : (
          <button
            onClick={handleBan}
            disabled={banUser.isPending}
            className="flex items-center gap-2 min-h-[44px] px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg font-medium disabled:opacity-50"
          >
            <Ban className="w-4 h-4" />
            {banUser.isPending ? 'Banning...' : 'Ban User'}
          </button>
        )}
      </div>

      {/* User Info Card */}
      <div className="admin-card">
        <h3 className="text-lg font-semibold mb-4">User Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Email</p>
              <p className="font-medium">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <User className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Name</p>
              <p className="font-medium">{user.name || 'N/A'}</p>
            </div>
          </div>
          {user.publicName && (
            <div className="flex items-center gap-3">
              <User className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Public Name</p>
                <p className="font-medium">{user.publicName}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Created</p>
              <p className="font-medium">
                {new Date(user.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 flex items-center justify-center">
              {user.banned ? (
                <Ban className="w-5 h-5 text-red-400" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-400" />
              )}
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className={`font-medium ${user.banned ? 'text-red-400' : 'text-green-400'}`}>
                {user.banned ? 'Banned' : 'Active'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Credits</p>
              <p className="text-xl font-bold">
                {user.credits?.balance?.toLocaleString() || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <Users className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Characters</p>
              <p className="text-xl font-bold">{user.characterCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <Image className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Images</p>
              <p className="text-xl font-bold">{user.imageCount || 0}</p>
            </div>
          </div>
        </div>
        <div className="admin-card">
          <div className="flex items-center gap-3">
            <CreditCard className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Subscription</p>
              <p className="text-xl font-bold capitalize">
                {subscription?.tier || 'Free'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Credits Section */}
      {user.credits && (
        <div className="admin-card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Credit Information</h3>
            <Link
              href={`${routes.billing}?userId=${userId}`}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              Manage Credits
              <ExternalLink className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Current Balance</p>
              <p className="text-2xl font-bold">{user.credits.balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Earned</p>
              <p className="text-2xl font-bold">{user.credits.totalEarned.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Spent</p>
              <p className="text-2xl font-bold">{user.credits.totalSpent.toLocaleString()}</p>
            </div>
          </div>
          {credits && credits.transactions.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-semibold mb-3">Recent Transactions</h4>
              <div className="space-y-2">
                {credits.transactions.slice(0, 5).map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg"
                  >
                    <div>
                      <p className="text-sm font-medium">{tx.description || tx.type}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(tx.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <span className={`font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subscription Section */}
      {subscription && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4">Subscription Details</h3>
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
                <p className="text-sm text-muted-foreground">Finby Subscription ID</p>
                <p className="font-medium text-sm">{subscription.finbySubscriptionId}</p>
              </div>
            )}
            {subscription.currentPeriodStart && (
              <div>
                <p className="text-sm text-muted-foreground">Period Start</p>
                <p className="font-medium">
                  {new Date(subscription.currentPeriodStart).toLocaleDateString()}
                </p>
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
            {subscription.cancelAtPeriodEnd !== null && (
              <div>
                <p className="text-sm text-muted-foreground">Cancel at Period End</p>
                <p className="font-medium">{subscription.cancelAtPeriodEnd ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Characters Section */}
      {characters && characters.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4">Characters ({characters.length})</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {characters.slice(0, 6).map((character) => (
              <div
                key={character.id}
                className="p-4 bg-secondary/50 rounded-lg border border-border"
              >
                {character.baseImageUrl && (
                  <img
                    src={character.baseImageUrl}
                    alt={character.name}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                )}
                <p className="font-medium">{character.name}</p>
                {character.handle && (
                  <p className="text-sm text-muted-foreground">@{character.handle}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2 capitalize">
                  Status: {character.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Images Section */}
      {images && images.images.length > 0 && (
        <div className="admin-card">
          <h3 className="text-lg font-semibold mb-4">
            Recent Images ({images.pagination.total})
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {images.images.slice(0, 12).map((image) => (
              <div
                key={image.id}
                className="aspect-square bg-secondary/50 rounded-lg overflow-hidden border border-border"
              >
                {image.s3Url ? (
                  <img
                    src={image.s3Url}
                    alt="Generated image"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    No Image
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
