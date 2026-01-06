'use client';

import { useState } from 'react';
import {
  PageContainer,
  RylaButton,
  FadeInUp,
  StaggerChildren,
  Pagination,
} from '@ryla/ui';
import { InfluencerCard } from '../../components/influencer/InfluencerCard';
import { ProtectedRoute } from '../../components/auth/ProtectedRoute';
import { useAuth } from '../../lib/auth-context';
import { trpc } from '../../lib/trpc';
import Link from 'next/link';
import { cn } from '@ryla/ui';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculate offset for pagination
  const offset = (currentPage - 1) * itemsPerPage;

  // Fetch characters with pagination
  const { data: charactersData, isLoading } = trpc.character.list.useQuery({
    limit: itemsPerPage,
    offset,
  });
  
  // Map Character data to AIInfluencer format for compatibility
  // imageCount is now included in the character list response
  const influencers = (charactersData?.items || []).map((char) => ({
    id: char.id,
    name: char.name,
    handle: char.handle || `@${char.name.toLowerCase().replace(/\s+/g, '.')}`,
    bio: char.config?.bio || 'New AI influencer ✨',
    avatar: char.baseImageUrl || null,
    gender: char.config?.gender || 'female',
    style: char.config?.style || 'realistic',
    ethnicity: char.config?.ethnicity || 'caucasian',
    age: char.config?.age || 25,
    hairStyle: char.config?.hairStyle || 'long-straight',
    hairColor: char.config?.hairColor || 'brown',
    eyeColor: char.config?.eyeColor || 'brown',
    bodyType: char.config?.bodyType || 'slim',
    breastSize: char.config?.breastSize,
    archetype: char.config?.archetype || 'girl-next-door',
    personalityTraits: char.config?.personalityTraits || [],
    outfit: char.config?.defaultOutfit || 'casual',
    nsfwEnabled: char.config?.nsfwEnabled || false,
    profilePictureSetId: char.config?.profilePictureSetId || undefined,
    postCount: parseInt(char.postCount || '0', 10),
    imageCount: (char as any).imageCount ?? 0, // imageCount is now included from backend
    likedCount: parseInt(char.likedCount || '0', 10),
    createdAt: char.createdAt?.toISOString() || new Date().toISOString(),
    updatedAt: char.createdAt?.toISOString() || new Date().toISOString(),
  }));
  
  const totalCount = charactersData?.total ?? 0;
  const totalPages = Math.ceil(totalCount / itemsPerPage);
  const hasInfluencers = totalCount > 0;

  return (
    <PageContainer className="relative">
      {/* Background gradient effect */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
          style={{
            background:
              'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }}
        />
      </div>

      {/* Page Header */}
      <FadeInUp>
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">
              {user ? `Welcome, ${user.name.split(' ')[0]}` : 'My AI Influencers'}
            </h1>
            <p className="mt-1 text-[var(--text-secondary)]">
              {hasInfluencers
                ? `${totalCount} influencer${
                    totalCount !== 1 ? 's' : ''
                  } created`
                : 'Create your first AI influencer to get started'}
            </p>
          </div>
          {hasInfluencers && (
            <Link
              href="/wizard/step-0"
              className={cn(
                'inline-flex items-center justify-center gap-2',
                'h-10 px-5 rounded-full font-bold text-sm',
                'bg-gradient-to-r from-[#7c3aed] to-[#a855f7] text-white',
                'shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40',
                'transition-all duration-200 relative overflow-hidden',
                'hover:scale-[1.02] active:scale-[0.98]'
              )}
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 w-[200%] animate-shimmer bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="h-4 w-4 relative z-10"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              <span className="relative z-10">Create New</span>
            </Link>
          )}
        </div>
      </FadeInUp>

      {/* Content */}
      {isLoading ? (
        <FadeInUp delay={200}>
          <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-12 text-center">
            <p className="text-[var(--text-secondary)]">Loading influencers...</p>
          </div>
        </FadeInUp>
      ) : hasInfluencers ? (
        <>
          <StaggerChildren staggerDelay={80}>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 lg:gap-6">
              {influencers.map((influencer) => (
                <InfluencerCard key={influencer.id} influencer={influencer} />
              ))}
            </div>
          </StaggerChildren>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-6 flex justify-center pt-6">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </>
      ) : (
        <FadeInUp delay={200}>
          <div className="relative rounded-2xl border border-[var(--border-default)] bg-[var(--bg-elevated)] p-12 text-center overflow-hidden">
            {/* Gradient glow */}
            <div
              className="absolute inset-0 opacity-50"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(168, 85, 247, 0.1) 0%, transparent 50%)',
              }}
            />

            <div className="relative z-10">
              {/* Icon */}
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--purple-600)]/20 to-[var(--pink-500)]/20 border border-[var(--purple-500)]/20">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-10 w-10 text-[var(--purple-400)]"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
                  />
                </svg>
              </div>

              {/* Text */}
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">
                No AI Influencers Yet
              </h2>
              <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
                Create your first AI influencer to start generating amazing
                content for your social media platforms.
              </p>

              {/* CTA */}
              <RylaButton asChild variant="gradient" size="xl">
                <Link href="/wizard/step-0" className="flex items-center gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    className="h-5 w-5"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 7.89l.813-2.846A.75.75 0 019 4.5zM18 1.5a.75.75 0 01.728.568l.258 1.036c.236.94.97 1.674 1.91 1.91l1.036.258a.75.75 0 010 1.456l-1.036.258c-.94.236-1.674.97-1.91 1.91l-.258 1.036a.75.75 0 01-1.456 0l-.258-1.036a2.625 2.625 0 00-1.91-1.91l-1.036-.258a.75.75 0 010-1.456l1.036-.258a2.625 2.625 0 001.91-1.91l.258-1.036A.75.75 0 0118 1.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Create AI Influencer
                </Link>
              </RylaButton>
            </div>
          </div>
        </FadeInUp>
      )}
    </PageContainer>
  );
}

