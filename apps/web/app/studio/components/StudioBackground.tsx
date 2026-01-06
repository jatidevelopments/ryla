export function StudioBackground() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div
        className="absolute -top-40 right-0 h-[500px] w-[500px] opacity-30"
        style={{
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.15) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
      <div
        className="absolute -bottom-40 left-0 h-[400px] w-[400px] opacity-20"
        style={{
          background:
            'radial-gradient(circle, rgba(236, 72, 153, 0.12) 0%, transparent 70%)',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}

