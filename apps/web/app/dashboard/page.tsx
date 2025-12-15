"use client";

import { useAllInfluencers } from "@ryla/business";
import { PageContainer, EmptyState, Button } from "@ryla/ui";
import { InfluencerCard } from "../../components/influencer-card";
import Link from "next/link";

export default function DashboardPage() {
  const influencers = useAllInfluencers();
  const hasInfluencers = influencers.length > 0;

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">My AI Influencers</h1>
          <p className="text-sm text-white/60">
            {hasInfluencers
              ? `${influencers.length} influencer${influencers.length !== 1 ? "s" : ""}`
              : "Create your first AI influencer"}
          </p>
        </div>
        {hasInfluencers && (
          <Button asChild className="bg-gradient-to-r from-[#d5b9ff] to-[#b99cff]">
            <Link href="/wizard/step-1">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="mr-1.5 h-4 w-4"
              >
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create New
            </Link>
          </Button>
        )}
      </div>

      {/* Content */}
      {hasInfluencers ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {influencers.map((influencer) => (
            <InfluencerCard key={influencer.id} influencer={influencer} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="h-8 w-8"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z"
              />
            </svg>
          }
          title="No AI Influencers Yet"
          description="Create your first AI influencer to start generating amazing content for your social media."
          actionLabel="Create AI Influencer"
          actionHref="/wizard/step-1"
        />
      )}
    </PageContainer>
  );
}

