'use client';

import { useRef, useEffect } from 'react';
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { SocialPostCard } from '@/components/ui/social-post-card';
import { cn } from '@/lib/utils';
import { withCdn } from '@/lib/cdn';

// Helper to create post with CDN URL
const createPost = (
  platform: 'instagram' | 'tiktok',
  imagePath: string,
  likes: string,
  comments: string
) => ({
  platform,
  image: withCdn(imagePath),
  likes,
  comments,
});

// Diverse influencer images for social post cards (using CDN)
const postsRowA = [
  createPost('instagram', '/images/posts/influencer-1.webp', '24.5K', '892'),
  createPost('tiktok', '/images/posts/influencer-2.webp', '156K', '2.3K'),
  createPost('instagram', '/images/posts/influencer-3.webp', '8.2K', '156'),
  createPost('tiktok', '/images/posts/influencer-4.webp', '45K', '1.2K'),
  createPost('instagram', '/images/posts/influencer-5.webp', '67K', '3.4K'),
  createPost('tiktok', '/images/posts/influencer-6.webp', '234K', '5.6K'),
];

const postsRowB = [
  createPost('instagram', '/images/posts/influencer-7.webp', '12.8K', '445'),
  createPost('tiktok', '/images/posts/influencer-8.webp', '89K', '2.1K'),
  createPost('instagram', '/images/posts/influencer-9.webp', '34K', '1.5K'),
  createPost('tiktok', '/images/posts/influencer-10.webp', '567K', '12K'),
  createPost('instagram', '/images/posts/influencer-11.webp', '5.6K', '234'),
  createPost('tiktok', '/images/posts/influencer-12.webp', '23K', '890'),
];

const postsRowC = [
  createPost('tiktok', '/images/posts/influencer-3.webp', '189K', '4.2K'),
  createPost('instagram', '/images/posts/influencer-6.webp', '78K', '2.8K'),
  createPost('tiktok', '/images/posts/influencer-1.webp', '34K', '1.1K'),
  createPost('instagram', '/images/posts/influencer-9.webp', '15K', '567'),
  createPost('tiktok', '/images/posts/influencer-12.webp', '445K', '8.9K'),
  createPost('instagram', '/images/posts/influencer-4.webp', '92K', '3.1K'),
];

interface ScrollRowProps {
  children: React.ReactNode;
  baseVelocity?: number;
  direction?: 1 | -1;
  className?: string;
}

function ScrollRow({
  children,
  baseVelocity = 2,
  direction = 1,
  className,
}: ScrollRowProps) {
  const baseX = useMotionValue(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const isVisibleRef = useRef(true);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, {
    damping: 50,
    stiffness: 400,
  });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 3], {
    clamp: false,
  });

  // Intersection Observer to pause animations when off-screen
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef.current = entry.isIntersecting;
        });
      },
      {
        rootMargin: '50px', // Start animating slightly before visible
        threshold: 0,
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
    };
  }, []);

  const wrap = (min: number, max: number, v: number) => {
    const rangeSize = max - min;
    return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
  };

  // Export for testing
  (globalThis as any).__wrap = wrap;

  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  const directionFactor = useRef<number>(direction);

  useAnimationFrame((_, delta) => {
    // Pause animation when not visible
    if (!isVisibleRef.current) return;

    let moveBy = directionFactor.current * baseVelocity * (delta / 1000);

    if (velocityFactor.get() < 0) {
      directionFactor.current = -direction;
    } else if (velocityFactor.get() > 0) {
      directionFactor.current = direction;
    }

    moveBy += directionFactor.current * moveBy * velocityFactor.get();
    baseX.set(baseX.get() + moveBy);
  });

  return (
    <div
      ref={containerRef}
      className={cn('overflow-hidden', className)}
      style={{ willChange: 'transform' }}
    >
      <motion.div
        className="flex gap-4"
        style={{
          x,
          transform: 'translateZ(0)', // Force GPU acceleration
        }}
      >
        {/* Duplicate children for seamless loop */}
        {children}
        {children}
      </motion.div>
    </div>
  );
}

export function HeroBackground() {
  return (
    <div
      className="absolute inset-0 overflow-hidden pointer-events-none"
      style={{ willChange: 'transform' }}
    >
      {/* Black background layer that shows through the floating post images */}
      <div className="absolute inset-0 bg-black z-0" aria-hidden="true" />

      {/* Rows container - slightly tilted for depth */}
      <div
        className="absolute inset-0 flex flex-col justify-center gap-6 z-10"
        style={{
          transform:
            'perspective(1000px) rotateX(5deg) scale(1.1) translateZ(0)',
          transformOrigin: 'center center',
          willChange: 'transform',
        }}
      >
        {/* Row 1 - scrolling left */}
        <ScrollRow baseVelocity={1.5} direction={-1} className="opacity-20">
          {postsRowA.map((post, idx) => (
            <SocialPostCard
              key={`a-${idx}`}
              platform={post.platform}
              image={post.image}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </ScrollRow>

        {/* Row 2 - scrolling right */}
        <ScrollRow baseVelocity={2} direction={1} className="opacity-25">
          {postsRowB.map((post, idx) => (
            <SocialPostCard
              key={`b-${idx}`}
              platform={post.platform}
              image={post.image}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </ScrollRow>

        {/* Row 3 - scrolling left (slower) */}
        <ScrollRow baseVelocity={1} direction={-1} className="opacity-15">
          {postsRowC.map((post, idx) => (
            <SocialPostCard
              key={`c-${idx}`}
              platform={post.platform}
              image={post.image}
              likes={post.likes}
              comments={post.comments}
            />
          ))}
        </ScrollRow>
      </div>

      {/* Dark gradient overlay - ensures content readability */}
      <div
        className="absolute inset-0 z-20"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% 50%, 
              rgba(0,0,0,0.85) 0%, 
              rgba(0,0,0,0.7) 40%, 
              rgba(0,0,0,0.4) 100%
            )
          `,
        }}
      />

      {/* Edge fade gradients */}
      <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-black to-transparent z-20" />
      <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-black to-transparent z-20" />
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent z-20" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent z-20" />
    </div>
  );
}

export default HeroBackground;
