'use client';

import * as React from 'react';
import Link from 'next/link';
import { useParams, notFound } from 'next/navigation';
import { useInfluencer, useInfluencerStore, useLikedPosts } from '@ryla/business';
import { PageContainer, Button, Checkbox } from '@ryla/ui';
import { LikedPostRow } from '../../components/posts';
import { ProtectedRoute } from '../../components/auth';
import { trpc } from '../../../../lib/trpc';

export default function LikedPostsPage() {
  return (
    <ProtectedRoute>
      <LikedPostsContent />
    </ProtectedRoute>
  );
}

function LikedPostsContent() {
  const params = useParams();
  const influencerId = params.id as string;

  const influencer = useInfluencer(influencerId);
  const addInfluencer = useInfluencerStore((s) => s.addInfluencer);
  const { data: character, isLoading } = trpc.character.getById.useQuery(
    { id: influencerId },
    { enabled: !influencer }
  );
  const likedPosts = useLikedPosts(influencerId);
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  React.useEffect(() => {
    if (!influencer && character) {
      addInfluencer({
        id: character.id,
        name: character.name,
        handle: character.handle || `@${character.name.toLowerCase().replace(/\s+/g, '.')}`,
        bio: character.config?.bio || 'New AI influencer ✨',
        avatar: character.baseImageUrl || null,
        gender: character.config?.gender || 'female',
        style: character.config?.style || 'realistic',
        ethnicity: character.config?.ethnicity || 'caucasian',
        age: character.config?.age || 25,
        hairStyle: character.config?.hairStyle || 'long-straight',
        hairColor: character.config?.hairColor || 'brown',
        eyeColor: character.config?.eyeColor || 'brown',
        bodyType: character.config?.bodyType || 'slim',
        breastSize: character.config?.breastSize,
        archetype: character.config?.archetype || 'girl-next-door',
        personalityTraits: character.config?.personalityTraits || [],
        outfit: character.config?.defaultOutfit || 'casual',
        nsfwEnabled: character.config?.nsfwEnabled || false,
        profilePictureSetId: character.config?.profilePictureSetId || undefined,
        postCount: parseInt(character.postCount || '0', 10),
        imageCount: 0,
        likedCount: parseInt(character.likedCount || '0', 10),
        createdAt: character.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: character.updatedAt?.toISOString() || new Date().toISOString(),
      });
    }
  }, [addInfluencer, character, influencer]);

  if (!influencer && isLoading) {
    return null;
  }

  if (!influencer && !character) {
    notFound();
  }

  const allSelected =
    selectedIds.size === likedPosts.length && likedPosts.length > 0;
  const someSelected = selectedIds.size > 0;

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(likedPosts.map((p) => p.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectPost = (postId: string, selected: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (selected) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      return next;
    });
  };

  const handleExportSelected = () => {
    const selected = likedPosts.filter((p) => selectedIds.has(p.id));
    // Simulate batch export
    const captions = selected.map((p) => p.caption).join('\n\n---\n\n');
    navigator.clipboard.writeText(captions);
    alert(`Exported ${selected.length} posts! Captions copied to clipboard.`);
  };

  return (
    <PageContainer>
      {/* Header */}
      <div className="mb-6">
        <Link
          href={`/influencer/${influencerId}`}
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-white"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            className="h-4 w-4"
          >
            <path
              fillRule="evenodd"
              d="M17 10a.75.75 0 01-.75.75H5.612l4.158 3.96a.75.75 0 11-1.04 1.08l-5.5-5.25a.75.75 0 010-1.08l5.5-5.25a.75.75 0 111.04 1.08L5.612 9.25H16.25A.75.75 0 0117 10z"
              clipRule="evenodd"
            />
          </svg>
          Back to {influencer.name}
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">
              ⭐ Shortlisted Posts
            </h1>
            <p className="text-sm text-white/60">
              {likedPosts.length} post{likedPosts.length !== 1 ? 's' : ''} ready
              to export
            </p>
          </div>

          {someSelected && (
            <Button
              onClick={handleExportSelected}
              className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mr-1.5 h-4 w-4"
              >
                <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.235a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.129V2.75z" />
                <path d="M3.5 12.75a.75.75 0 00-1.5 0v2.5A2.75 2.75 0 004.75 18h10.5A2.75 2.75 0 0018 15.25v-2.5a.75.75 0 00-1.5 0v2.5c0 .69-.56 1.25-1.25 1.25H4.75c-.69 0-1.25-.56-1.25-1.25v-2.5z" />
              </svg>
              Export {selectedIds.size} Post{selectedIds.size !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {likedPosts.length > 0 ? (
        <div className="space-y-3">
          {/* Select all */}
          <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
              className="border-white/30 data-[state=checked]:bg-[#b99cff] data-[state=checked]:border-[#b99cff]"
            />
            <span className="text-sm text-white/60">
              {allSelected ? 'Deselect all' : 'Select all'}
            </span>
          </div>

          {/* Posts list */}
          {likedPosts.map((post) => (
            <LikedPostRow
              key={post.id}
              post={post}
              selected={selectedIds.has(post.id)}
              onSelect={(selected) => handleSelectPost(post.id, selected)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 py-12 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/10 text-3xl">
            ❤️
          </div>
          <h3 className="mb-2 text-lg font-semibold text-white">
            No shortlisted posts yet
          </h3>
          <p className="mb-6 max-w-sm text-sm text-white/60">
            Shortlist posts from {influencer.name}&apos;s profile to add them
            here for easy export.
          </p>
          <Button asChild variant="outline">
            <Link href={`/influencer/${influencerId}`}>View Profile</Link>
          </Button>
        </div>
      )}
    </PageContainer>
  );
}
