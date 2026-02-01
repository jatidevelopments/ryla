/**
 * Influencer Layout
 *
 * This layout wraps all influencer routes and enables edge runtime
 * for Cloudflare Pages compatibility.
 */

export const runtime = 'edge';

export default function InfluencerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
