"use client";

// Force dynamic rendering to avoid React 19 build issues
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black text-white">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl mb-8">Page not found</p>
        <a href="/" className="text-purple-400 hover:text-purple-300 underline">
          Go back home
        </a>
      </div>
    </div>
  );
}

