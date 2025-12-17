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

// Diverse influencer images for social post cards
const postsRowA = [
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-1.webp',
    likes: '24.5K',
    comments: '892',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-2.webp',
    likes: '156K',
    comments: '2.3K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-3.webp',
    likes: '8.2K',
    comments: '156',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-4.webp',
    likes: '45K',
    comments: '1.2K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-5.webp',
    likes: '67K',
    comments: '3.4K',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-6.webp',
    likes: '234K',
    comments: '5.6K',
  },
];

const postsRowB = [
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-7.webp',
    likes: '12.8K',
    comments: '445',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-8.webp',
    likes: '89K',
    comments: '2.1K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-9.webp',
    likes: '34K',
    comments: '1.5K',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-10.webp',
    likes: '567K',
    comments: '12K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-11.webp',
    likes: '5.6K',
    comments: '234',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-12.webp',
    likes: '23K',
    comments: '890',
  },
];

const postsRowC = [
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-3.webp',
    likes: '189K',
    comments: '4.2K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-6.webp',
    likes: '78K',
    comments: '2.8K',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-1.webp',
    likes: '34K',
    comments: '1.1K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-9.webp',
    likes: '15K',
    comments: '567',
  },
  {
    platform: 'tiktok' as const,
    image: '/images/posts/influencer-12.webp',
    likes: '445K',
    comments: '8.9K',
  },
  {
    platform: 'instagram' as const,
    image: '/images/posts/influencer-4.webp',
    likes: '92K',
    comments: '3.1K',
  },
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
