import { PaywallContent } from './PaywallContent';

// Disable static generation and prerendering for this page
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function PaywallPage() {
  return <PaywallContent />;
}
 
