# Landing Page SEO Keyword Update

**Date:** December 21, 2025  
**Status:** Pending Marketing Review  
**Branch:** `feat/seo-landing-keywords`

---

## Target Keywords

### Narrow Keywords (High Intent)

| Keyword                 | Priority              |
| ----------------------- | --------------------- |
| ai influencer           | ⭐ Primary            |
| ai influencers          | ⭐ Primary            |
| ai influencer generator | ⭐ Primary            |
| create ai influencer    | ⭐ Primary            |
| ai onlyfans             | Secondary (meta only) |
| ai girl                 | Secondary             |
| ai girls                | Secondary             |

### Broad Keywords

| Keyword            | Priority   |
| ------------------ | ---------- |
| AI Generator       | ⭐ Primary |
| AI Video Generator | ⭐ Primary |

---

## Changes Summary

### 1. Page Title

**Before:**

> RYLA — Create Hyper-Realistic AI Influencers That Earn 24/7

**After:**

> RYLA — AI Influencer Generator | Create AI Girls & Videos

---

### 2. Meta Description

**Before:**

> Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, and more. Build your AI influencer empire with one click. Starting at $29/month. Free trial available.

**After:**

> Create AI influencers with our AI influencer generator. Generate hyper-realistic AI girls and videos for TikTok, Instagram, and OnlyFans. The #1 AI generator for virtual influencers with perfect character consistency. AI video generator included. Free trial.

---

### 3. Hero Section - Scrolling Keywords Bar

**Before:**

- Hyper-realistic
- Consistent
- Ready to monetize
- TikTok
- Instagram

**After:**

- AI Influencer Generator
- AI Video Generator
- Create AI Girls
- Hyper-Realistic
- TikTok
- Instagram

---

### 4. New FAQ Questions Added

| Question                                      | Keywords Included                              |
| --------------------------------------------- | ---------------------------------------------- |
| "What is an AI influencer generator?"         | ai influencer generator, create ai influencers |
| "How do I create AI influencers with RYLA?"   | create ai influencers, AI generator            |
| "Can I create AI girls for content creation?" | AI girls, create AI girls                      |
| "Does RYLA work as an AI video generator?"    | AI video generator, AI videos                  |
| "Can I use RYLA for subscription platforms?"  | (replaces OnlyFans mention)                    |

---

### 5. Structured Data (JSON-LD) - For Search Engines

Updated schema descriptions with keywords:

- "AI influencer generator"
- "Create AI influencers"
- "AI girl generation"
- "AI video generator"
- "OnlyFans content creation" (metadata only)

---

## OnlyFans Keyword Policy

| Location               | OnlyFans Visible?                     |
| ---------------------- | ------------------------------------- |
| Meta keywords          | ✅ Yes (SEO only)                     |
| Meta description       | ✅ Yes (SEO only)                     |
| Structured data        | ✅ Yes (SEO only)                     |
| Page content (visible) | ❌ No                                 |
| FAQs                   | ❌ No (uses "subscription platforms") |

---

## Files Changed

```
apps/landing/app/layout.tsx              - Meta tags & descriptions
apps/landing/components/sections/HeroSection.tsx  - Velocity scroll bar
apps/landing/components/seo/StructuredData.tsx    - JSON-LD schemas
apps/landing/data/faqs.ts                - FAQ content
```

---

## Action Required

- [ ] Marketing review of new title
- [ ] Marketing review of new meta description
- [ ] Marketing review of new FAQ questions
- [ ] Confirm OnlyFans policy (meta only, not visible)
- [ ] Approve for deployment

---

## Notes for Marketing

1. **Title change** - Shorter, more keyword-focused. Good for search rankings.
2. **OnlyFans** - Kept in metadata for SEO but not shown on page (brand safety).
3. **AI Girls** - Added as key term, visible in hero scroll and FAQs.
4. **Video Generator** - Emphasized as standalone keyword to capture video-focused searches.
