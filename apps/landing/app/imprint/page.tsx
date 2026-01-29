import { redirect } from 'next/navigation';

// Temporarily remove Imprint page by redirecting to home.
// This preserves the route file (so no build errors) while preventing the page from being accessed.
export default function ImprintPage() {
  redirect('/');
}
