# Landing Page Content Removal - Fanvue, OnlyFans & Adult Content

## Overview

Remove all references to Fanvue, OnlyFans, and adult content from the landing page to comply with content policies.

**General Rule:** "Generally we can't show any fanvue or onlyfans / any adult on the landing page"

---

## Changes Required by Section

### 1. Hero Section (`apps/landing/components/sections/HeroSection.tsx`)

#### Headline (Optional Update)

- **Current:** "Create AI influencers that earn 24/7."
- **Suggested:** "Create AI Influencer that produce Content 24/7" (per annotation feedback)
- **Status:** Optional - current headline is acceptable

#### Sub-headline (REQUIRED)

- **Current:** "Hyper-realistic. Consistent. Ready to monetize on Fanvue, OnlyFans, TikTok & more."
- **New:** "Hyper-realistic. Consistent. Ready to generate revenue at scale."
- **File:** `apps/landing/components/sections/HeroSection.tsx` (line 43)

#### Platform Logos (REQUIRED)

- **Remove:** Fanvue and OnlyFans logos from LogoMarquee
- **Keep:** TikTok and Instagram only
- **File:** `apps/landing/components/sections/HeroSection.tsx` (lines 67-68)

#### Velocity Scroll Keywords (REQUIRED)

- **Remove:** "Fanvue" and "OnlyFans" from scrolling text
- **Keep:** "Hyper-realistic", "Consistent", "Ready to monetize", "TikTok", "Instagram"
- **File:** `apps/landing/components/sections/HeroSection.tsx` (lines 89-94)

---

### 2. Feature Showcase (`apps/landing/components/sections/FeatureShowcase.tsx`)

#### Spicy Content Card (REQUIRED - REMOVE ENTIRELY)

- **Action:** Remove the entire "Spicy Content" feature card
- **Details:**
  - Name: "Spicy Content"
  - Description: "Generate adult content with precision and consistency."
  - Tags: "High Precision", "Consistent", "Uncensored"
  - Icon: FlameIcon
- **File:** `apps/landing/components/sections/FeatureShowcase.tsx` (lines 244-267)
- **Note:** This removes the entire feature object from the `features` array

#### Notifications (REQUIRED)

- **Remove:** Notifications referencing Fanvue and OnlyFans platforms
- **Current:**
  - "New subscriber" - platform: "Fanvue" (line 34)
  - "Post liked" - platform: "OnlyFans" (line 35)
- **Action:** Replace with TikTok or Instagram only
- **File:** `apps/landing/components/sections/FeatureShowcase.tsx` (lines 33-37)

#### Platform Icons Array (REQUIRED)

- **Remove:** Fanvue and OnlyFans from `platformIcons` array
- **Keep:** TikTok and Instagram only
- **File:** `apps/landing/components/sections/FeatureShowcase.tsx` (lines 55-72)

#### Multi-Platform Feature Description (REQUIRED)

- **Current:** "Post to Fanvue, OnlyFans, TikTok, and Instagram."
- **New:** "Post to TikTok, Instagram, and more."
- **File:** `apps/landing/components/sections/FeatureShowcase.tsx` (line 312)

---

### 3. How It Works Section (`apps/landing/components/sections/HowItWorksSection.tsx`)

#### Step 3 - Post Story Text (REQUIRED)

- **Current:** "Connect your platforms with one click. TikTok. Instagram. Fanvue. OnlyFans. Choose from viral-ready prompts and scenes. Schedule posts for optimal engagement. Your AI influencer is now live."
- **New:** "Connect your platforms with one click. TikTok. Instagram. Choose from viral-ready prompts and scenes. Schedule posts for optimal engagement. Your AI influencer is now live."
- **File:** `apps/landing/components/sections/HowItWorksSection.tsx` (line 65)

---

### 4. FAQ Section (`apps/landing/components/sections/FAQSection.tsx`)

#### FAQ Question (REQUIRED - REMOVE)

- **Action:** Remove the entire FAQ item about Fanvue and OnlyFans
- **Current Question:** "Can I monetize on Fanvue and OnlyFans?"
- **Current Answer:** "Yes! Generate images and videos to sell on Fanvue, OnlyFans, TikTok, and other platforms. Your AI influencer earns money 24/7."
- **File:** `apps/landing/components/sections/FAQSection.tsx` (lines 21-25)
- **Alternative:** Replace with a more generic monetization question if needed

---

### 5. Testimonials Section (`apps/landing/components/sections/TestimonialsSection.tsx`)

#### Platform Type Definition (REQUIRED)

- **Action:** Remove "fanvue" and "onlyfans" from Platform type
- **Current:** `type Platform = "instagram" | "tiktok" | "fanvue" | "onlyfans";`
- **New:** `type Platform = "instagram" | "tiktok";`
- **File:** `apps/landing/components/sections/TestimonialsSection.tsx` (line 10)

#### Platform Config (REQUIRED)

- **Action:** Remove fanvue and onlyfans from platformConfig object
- **File:** `apps/landing/components/sections/TestimonialsSection.tsx` (lines 112-113)

#### Testimonial Data (REQUIRED)

- **Action:** Update all testimonials that reference "fanvue" or "onlyfans" platforms
- **Affected Testimonials:**
  - `testimonialsRowA[0]` - Sarah M. - platform: "fanvue" (line 27)
  - `testimonialsRowA[1]` - Jake T. - platform: "onlyfans" (line 35)
  - `testimonialsRowA[4]` - Emma K. - platform: "fanvue" (line 59)
  - `testimonialsRowB[0]` - Chris D. - platform: "onlyfans" (line 70)
  - `testimonialsRowB[3]` - Lisa W. - platform: "fanvue" (line 94)
  - `testimonialsRowB[4]` - David K. - platform: "onlyfans" (line 102)
- **Action:** Change platform to either "instagram" or "tiktok"
- **File:** `apps/landing/components/sections/TestimonialsSection.tsx`

---

### 6. Hero Background (`apps/landing/components/sections/HeroBackground.tsx`)

#### Social Post Cards (REQUIRED)

- **Action:** Remove all posts with "fanvue" or "onlyfans" platforms from scrolling background
- **Affected Posts:**
  - `postsRowA[2]` - platform: "fanvue" (line 20)
  - `postsRowA[3]` - platform: "onlyfans" (line 21)
  - `postsRowB[0]` - platform: "fanvue" (line 27)
  - `postsRowB[1]` - platform: "onlyfans" (line 28)
  - `postsRowB[4]` - platform: "fanvue" (line 31)
  - `postsRowB[5]` - platform: "onlyfans" (line 32)
  - `postsRowC[2]` - platform: "onlyfans" (line 38)
  - `postsRowC[3]` - platform: "fanvue" (line 39)
- **Action:** Replace with Instagram or TikTok posts, or remove entirely
- **File:** `apps/landing/components/sections/HeroBackground.tsx`

---

### 7. Metadata & SEO (`apps/landing/app/layout.tsx`)

#### Description (REQUIRED)

- **Current:** "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans. Build your AI influencer empire with one click."
- **New:** "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click."
- **File:** `apps/landing/app/layout.tsx` (line 36)

#### Keywords (REQUIRED)

- **Remove:** "NSFW AI content", "Fanvue AI", "OnlyFans AI"
- **Keep:** Other keywords
- **File:** `apps/landing/app/layout.tsx` (lines 45-47)

#### OpenGraph Description (REQUIRED)

- **Current:** "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, and OnlyFans."
- **New:** "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more."
- **File:** `apps/landing/app/layout.tsx` (line 76)

---

### 8. Social Post Card Component (`apps/landing/components/ui/social-post-card.tsx`)

#### Platform Type (REQUIRED)

- **Action:** Remove "fanvue" and "onlyfans" from Platform type
- **File:** Check if this file exists and update accordingly

#### Platform Config (REQUIRED)

- **Action:** Remove fanvue and onlyfans platform configurations
- **File:** Check if this file exists and update accordingly

---

### 9. Logo Marquee Component (`apps/landing/components/animations/LogoMarquee.tsx`)

#### Platform Type (REQUIRED)

- **Action:** Remove "fanvue" and "onlyfans" from platform name type
- **Current:** `name: "tiktok" | "instagram" | "fanvue" | "onlyfans" | "youtube" | "twitter";`
- **New:** `name: "tiktok" | "instagram" | "youtube" | "twitter";`
- **File:** `apps/landing/components/animations/LogoMarquee.tsx` (line 72)

#### Platform Colors (REQUIRED)

- **Action:** Remove fanvue and onlyfans color configurations
- **File:** `apps/landing/components/animations/LogoMarquee.tsx` (lines 101-102)

#### Platform Labels (REQUIRED)

- **Action:** Remove OnlyFans label handling
- **File:** `apps/landing/components/animations/LogoMarquee.tsx` (line 123)

---

## Summary of Files to Modify

1. ✅ `apps/landing/components/sections/HeroSection.tsx`
2. ✅ `apps/landing/components/sections/FeatureShowcase.tsx`
3. ✅ `apps/landing/components/sections/HowItWorksSection.tsx`
4. ✅ `apps/landing/components/sections/FAQSection.tsx`
5. ✅ `apps/landing/components/sections/TestimonialsSection.tsx`
6. ✅ `apps/landing/components/sections/HeroBackground.tsx`
7. ✅ `apps/landing/app/layout.tsx`
8. ✅ `apps/landing/components/ui/social-post-card.tsx` (if exists)
9. ✅ `apps/landing/components/animations/LogoMarquee.tsx`

---

## Implementation Priority

1. **High Priority (Visible Content):**

   - Hero Section sub-headline
   - Spicy Content card removal
   - FAQ question removal
   - Platform logos/icons removal

2. **Medium Priority (Background/Supporting Content):**

   - Testimonials platform updates
   - Hero background posts
   - Notifications updates

3. **Low Priority (SEO/Metadata):**
   - Layout metadata updates
   - Keywords cleanup

---

## Notes

- All changes should maintain the visual design and functionality
- Replace removed content with appropriate alternatives (TikTok, Instagram)
- Ensure no broken references or TypeScript errors after changes
- Test all sections after implementation
