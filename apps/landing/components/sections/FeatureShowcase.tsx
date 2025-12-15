"use client";

import { Section, SectionHeader } from "@/components/ryla-ui";
import { FadeInUp } from "@/components/animations";
import { BentoCard, BentoGrid } from "@/components/ui/bento-grid";
import { 
  SparklesIcon, 
  CalendarIcon,
  Share2Icon,
  BellIcon,
  HandIcon,
  UsersIcon,
  VideoIcon,
  MicIcon,
  GraduationCapIcon,
  FlameIcon,
  ShirtIcon,
  InstagramIcon
} from "lucide-react";
import Marquee from "@/components/ui/marquee";
import { cn } from "@/lib/utils";

// Sample generated images for the marquee
const generatedImages = [
  { src: "/images/features/scene-1.webp", label: "Scene 1" },
  { src: "/images/features/scene-2.webp", label: "Scene 2" },
  { src: "/images/features/realistic-female.webp", label: "Portrait" },
  { src: "/images/features/scene-3.webp", label: "Scene 3" },
  { src: "/images/features/showcase-2.webp", label: "Showcase" },
];

// Notification items for animated list
const notifications = [
  { icon: "💰", title: "New subscriber", time: "2m ago", platform: "Fanvue" },
  { icon: "❤️", title: "Post liked", time: "5m ago", platform: "OnlyFans" },
  { icon: "📈", title: "Trending content", time: "10m ago", platform: "TikTok" },
];

// Platform icons for integrations
const platformIcons = [
  { 
    name: "TikTok", 
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
      </svg>
    ),
    color: "#ff0050"
  },
  { 
    name: "Instagram", 
    icon: <InstagramIcon className="w-5 h-5" />,
    color: "#E4405F"
  },
  { 
    name: "Fanvue", 
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
      </svg>
    ),
    color: "#6366f1"
  },
  { 
    name: "OnlyFans", 
    icon: (
      <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
      </svg>
    ),
    color: "#00AFF0"
  },
];


// Community avatars
const communityAvatars = [
  { initial: "S", color: "from-pink-500 to-rose-500" },
  { initial: "M", color: "from-purple-500 to-indigo-500" },
  { initial: "A", color: "from-blue-500 to-cyan-500" },
  { initial: "J", color: "from-green-500 to-emerald-500" },
  { initial: "L", color: "from-orange-500 to-amber-500" },
];

// Icon color groups
const iconColors = {
  purple: "text-purple-400", // Core AI Quality
  pink: "text-pink-400", // Customization
  cyan: "text-cyan-400", // Video Creation
  green: "text-green-400", // Monetization/Platform
  orange: "text-orange-400", // Support/Community
};

// Features data - grouped by color
const features = [
  {
    Icon: SparklesIcon,
    iconColor: iconColors.purple, // Core AI Quality
    name: "Hyper-Realistic Quality",
    description: "Skin, hands, and details indistinguishable from real photos.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <Marquee
        pauseOnHover
        className="absolute top-10 [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)] [--duration:20s]"
      >
        {generatedImages.map((img, idx) => (
          <figure
            key={idx}
            className={cn(
              "relative w-32 h-40 cursor-pointer overflow-hidden rounded-xl border",
              "border-purple-500/20 bg-purple-950/30",
              "transform-gpu blur-[1px] transition-all duration-300 ease-out hover:blur-none hover:border-purple-500/40"
            )}
          >
            <img
              src={img.src}
              alt={img.label}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <figcaption className="text-xs font-medium text-white">
                {img.label}
              </figcaption>
            </div>
          </figure>
        ))}
      </Marquee>
    ),
  },
  {
    Icon: HandIcon,
    iconColor: iconColors.purple, // Core AI Quality
    name: "Perfect Hands",
    description: "No more AI hand nightmares. Anatomically perfect every time.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_25%,#000_100%)]">
        <img 
          src="/images/features/perfect-hands.webp" 
          alt="Perfect hands" 
          className="w-full h-full object-cover opacity-60" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/60 to-transparent" />
      </div>
    ),
  },
  {
    Icon: UsersIcon,
    iconColor: iconColors.purple, // Core AI Quality
    name: "Character Consistency",
    description: "Same face, every scene. 100% consistency across all content.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1 lg:row-span-2",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_15%,#000_100%)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/video/character-consistency.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />
      </div>
    ),
  },
  {
    Icon: ShirtIcon,
    iconColor: iconColors.pink, // Customization
    name: "Outfit Customization",
    description: "Change outfits and styles with one click instead of long prompts.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1 lg:row-span-2",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_15%,#000_100%)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/video/outfit-customization.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />
      </div>
    ),
  },
  {
    Icon: VideoIcon,
    iconColor: iconColors.cyan, // Video Creation
    name: "Viral Video Templates & Scenes",
    description: "Dance, selfie, driving, custom—create viral content in one click.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_15%,#000_100%)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/video/viral-scenes.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />
      </div>
    ),
  },
  {
    Icon: MicIcon,
    iconColor: iconColors.cyan, // Video Creation
    name: "Lipsync Videos",
    description: "Talking videos with realistic lip movement and expressions.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_15%,#000_100%)]">
        <video
          autoPlay
          loop
          muted
          playsInline
          className="w-full h-full object-cover opacity-70"
        >
          <source src="/video/lipsync.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/40 to-transparent" />
      </div>
    ),
  },
  {
    Icon: FlameIcon,
    iconColor: iconColors.pink, // Content Type (adult content)
    name: "Spicy Content",
    description: "Generate adult content with precision and consistency.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_25%,#000_100%)]">
        <img 
          src="/images/features/video-banner.webp" 
          alt="Adult content preview"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex justify-center gap-2">
          <span className="px-2 py-1 rounded-full bg-pink-500/30 border border-pink-500/40 text-[10px] text-pink-300 backdrop-blur-sm">High Precision</span>
          <span className="px-2 py-1 rounded-full bg-purple-500/30 border border-purple-500/40 text-[10px] text-purple-300 backdrop-blur-sm">Consistent</span>
          <span className="px-2 py-1 rounded-full bg-rose-500/30 border border-rose-500/40 text-[10px] text-rose-300 backdrop-blur-sm">Uncensored</span>
        </div>
      </div>
    ),
  },
  // --- Platform & Monetization Features (at the end) ---
  {
    Icon: BellIcon,
    iconColor: iconColors.green, // Monetization/Platform
    name: "Live Earnings",
    description: "Track subscribers and earnings in real-time.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0">
        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm">
          <span className="text-[10px] text-amber-300 font-medium italic uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="absolute top-12 right-4 left-4 flex flex-col gap-2 [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
          {notifications.map((notification, idx) => (
            <div
              key={idx}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "bg-purple-950/50 border border-purple-500/20",
                "transform transition-all duration-300",
                idx === 0 && "scale-100 opacity-100",
                idx === 1 && "scale-95 opacity-70 translate-x-2",
                idx === 2 && "scale-90 opacity-40 translate-x-4"
              )}
            >
              <span className="text-2xl">{notification.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">
                  {notification.title} · <span className="text-white/50">{notification.time}</span>
                </p>
                <p className="text-xs text-purple-400">{notification.platform}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    Icon: Share2Icon,
    iconColor: iconColors.green, // Monetization/Platform
    name: "Multi-Platform",
    description: "Post to Fanvue, OnlyFans, TikTok, and Instagram.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 flex items-center justify-center [mask-image:linear-gradient(to_top,transparent_10%,#000_100%)]">
        {/* Central hub */}
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white text-lg font-bold">R</span>
          </div>
          {/* Connection lines and platform icons */}
          {platformIcons.map((platform, idx) => {
            const angle = (idx * 90 - 45) * (Math.PI / 180);
            const radius = 55;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            return (
              <div
                key={platform.name}
                className="absolute w-8 h-8 rounded-full bg-purple-950/90 border border-white/10 flex items-center justify-center shadow-md backdrop-blur-sm"
                style={{
                  left: `calc(50% + ${x}px - 16px)`,
                  top: `calc(50% + ${y}px - 16px)`,
                  color: platform.color,
                }}
              >
                {platform.icon}
              </div>
            );
          })}
        </div>
      </div>
    ),
  },
  {
    Icon: CalendarIcon,
    iconColor: iconColors.green, // Monetization/Platform
    name: "Schedule Posts",
    description: "Plan your content calendar weeks ahead.",
    href: "#",
    cta: "Learn more",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0">
        <div className="absolute top-4 right-4 px-2 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 backdrop-blur-sm z-10">
          <span className="text-[10px] text-amber-300 font-medium italic uppercase tracking-wider">Coming Soon</span>
        </div>
        <div className="absolute top-10 right-0 left-0 flex justify-center [mask-image:linear-gradient(to_top,transparent_40%,#000_100%)]">
          <div className="bg-purple-950/50 rounded-lg border border-purple-500/20 p-3 scale-90 origin-top">
            <div className="text-center mb-2">
              <span className="font-semibold text-white text-sm">December 2025</span>
            </div>
            <div className="grid grid-cols-7 gap-1 text-xs">
              {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
                <div key={day} className="text-center text-white/40 font-medium">
                  {day}
                </div>
              ))}
              {Array.from({ length: 14 }, (_, i) => i + 1).map((day) => (
                <div
                  key={day}
                  className={cn(
                    "text-center py-1 rounded text-xs",
                    day === 8 && "bg-gradient-to-br from-purple-600 to-pink-500 text-white",
                    day !== 8 && "text-white/60"
                  )}
                >
                  {day}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    ),
  },
  {
    Icon: GraduationCapIcon,
    iconColor: iconColors.orange, // Support/Community
    name: "Community & Courses",
    description: "Learn from creators earning $10K+/month.",
    href: "#",
    cta: "Join community",
    className: "col-span-3 lg:col-span-1",
    background: (
      <div className="absolute inset-0 [mask-image:linear-gradient(to_top,transparent_25%,#000_100%)]">
        <img 
          src="/images/features/community.webp" 
          alt="Community"
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d12] via-[#0d0d12]/60 to-transparent" />
        <div className="absolute top-4 left-4 right-4 flex flex-col items-center gap-3">
          {/* Avatar stack */}
          <div className="flex -space-x-2">
            {communityAvatars.slice(0, 4).map((avatar, idx) => (
              <div
                key={idx}
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs",
                  "bg-gradient-to-br border-2 border-[#0d0d12]",
                  avatar.color
                )}
                style={{ zIndex: communityAvatars.length - idx }}
              >
                {avatar.initial}
              </div>
            ))}
            <div className="w-10 h-10 rounded-full bg-purple-950/80 border-2 border-purple-500/40 flex items-center justify-center text-purple-400 text-[10px] font-bold backdrop-blur-sm">
              +2K
            </div>
          </div>
          {/* Course badges */}
          <div className="flex gap-2">
            <span className="px-2 py-1 rounded-full bg-purple-500/30 border border-purple-500/40 text-[10px] text-purple-300 backdrop-blur-sm">Niche Finding</span>
            <span className="px-2 py-1 rounded-full bg-pink-500/30 border border-pink-500/40 text-[10px] text-pink-300 backdrop-blur-sm">Monetization</span>
          </div>
        </div>
      </div>
    ),
  },
];

/**
 * FeatureShowcase Component (V4 Minimal + Bento Grid)
 * 
 * Magic UI inspired bento grid layout with 10 feature cards.
 */
export function FeatureShowcase() {
  return (
    <Section id="features" background="default" className="py-20 md:py-32 bg-transparent">
      <FadeInUp>
        <SectionHeader 
          title="Everything you need to earn." 
          titleHighlight="to earn"
        />
      </FadeInUp>

      <div className="mt-12">
        <BentoGrid>
          {features.map((feature, index) => (
            <BentoCard 
              key={feature.name} 
              {...feature}
              animationDelay={index * 50}
            />
          ))}
        </BentoGrid>
      </div>
    </Section>
  );
}

export default FeatureShowcase;
