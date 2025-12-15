"use client";

import { useParams, notFound } from "next/navigation";
import { useInfluencer, useInfluencerPosts, useLikedPosts } from "@ryla/business";
import { PageContainer, Tabs, TabsList, TabsTrigger, TabsContent } from "@ryla/ui";
import { InfluencerProfile } from "../../../components/influencer-profile";
import { PostGrid } from "../../../components/post-grid";

export default function InfluencerProfilePage() {
  const params = useParams();
  const influencerId = params.id as string;
  
  const influencer = useInfluencer(influencerId);
  const allPosts = useInfluencerPosts(influencerId);
  const likedPosts = useLikedPosts(influencerId);

  if (!influencer) {
    notFound();
  }

  const handleExport = (post: { id: string; caption: string; imageUrl: string }) => {
    // Simulate export - in production this would trigger download + copy
    navigator.clipboard.writeText(post.caption);
    alert(`Exported: ${post.caption.substring(0, 50)}...`);
  };

  return (
    <>
      {/* Profile Header */}
      <InfluencerProfile influencer={influencer} />

      {/* Content */}
      <PageContainer>
        <Tabs defaultValue="posts" className="mt-4">
          <TabsList className="mb-4 w-full justify-start bg-transparent p-0">
            <TabsTrigger
              value="posts"
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/60"
            >
              All Posts ({allPosts.length})
            </TabsTrigger>
            <TabsTrigger
              value="liked"
              className="rounded-lg px-4 py-2 text-sm data-[state=active]:bg-white/10 data-[state=active]:text-white data-[state=inactive]:text-white/60"
            >
              Liked ({likedPosts.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="posts">
            <PostGrid
              posts={allPosts}
              onExport={handleExport}
              emptyMessage="No posts yet. Generate some content!"
            />
          </TabsContent>

          <TabsContent value="liked">
            <PostGrid
              posts={likedPosts}
              onExport={handleExport}
              emptyMessage="No liked posts yet. Like posts to add them here."
            />
          </TabsContent>
        </Tabs>
      </PageContainer>
    </>
  );
}

