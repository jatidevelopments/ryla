import Link from "next/link";

// Prevent static generation to avoid Html import issues
export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex items-center justify-center">
      <div className="text-center p-8 max-w-md">
        <h1 className="text-6xl font-bold mb-4 text-purple-400">404</h1>
        <h2 className="text-2xl font-bold mb-4">Page not found</h2>
        <p className="text-white/60 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-purple-600 hover:bg-purple-700 rounded-full font-medium transition-colors"
        >
          Go home
        </Link>
      </div>
    </div>
  );
}

