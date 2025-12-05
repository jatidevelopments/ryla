export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <div className="text-center">
        {/* Logo placeholder */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#d5b9ff] to-[#b99cff] bg-clip-text text-transparent">
            RYLA
          </h1>
          <p className="text-[#a1a1aa] mt-2 text-lg">
            Create Your AI Companion
          </p>
        </div>

        {/* Status card */}
        <div className="bg-[#1f1f24] border border-white/10 rounded-xl p-8 max-w-md">
          <div className="flex items-center justify-center mb-4">
            <span className="inline-block w-3 h-3 bg-[#00ed77] rounded-full animate-pulse mr-2" />
            <span className="text-[#00ed77] text-sm font-medium">
              Design System Ready
            </span>
          </div>

          <p className="text-[#a1a1aa] text-sm mb-6">
            The UI components and design system have been set up. Ready to build
            the character creation wizard.
          </p>

          {/* Sample button with primary gradient */}
          <button className="w-full bg-primary-gradient text-white font-semibold py-3 px-6 rounded-[10px] transition-all hover:brightness-110">
            Get Started
          </button>
        </div>

        {/* Tech stack badges */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {['Next.js', 'Tailwind CSS', 'Radix UI', 'Zustand'].map((tech) => (
            <span
              key={tech}
              className="px-3 py-1 bg-[#b99cff]/20 text-[#b99cff] text-xs font-medium rounded-full border border-[#b99cff]/30"
            >
              {tech}
            </span>
          ))}
        </div>
      </div>
    </main>
  );
}

