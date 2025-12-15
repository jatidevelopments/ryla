# RYLA Landing Page Structure

## Overview

This document defines the section-by-section structure of the RYLA landing page, including exact content, components, and assets needed for each section. Content is sourced from Version 3 (Funnel-Based Copy).

---

## Page Flow Summary

```
1. Navigation (fixed)
2. Hero Section (100vh)
3. Platform Logos Marquee
4. Stats Section
5. How It Works
6. Feature Showcase
7. Templates Gallery
8. Community & Courses
9. Testimonials
10. Pricing
11. Final CTA
12. Footer
```

---

## 1. Navigation

### Layout

```
[ Logo ]                                    [ CTA Button ]
```

### Content

| Element     | Value                            |
| ----------- | -------------------------------- |
| Logo        | "RYLA" or RYLA logo mark         |
| CTA Button  | "Create AI Influencer NOW"       |
| Style       | Primary button (gradient)        |

### Behavior

- Position: Fixed at top
- Initial: Transparent background
- On scroll (>100px): Dark background with backdrop blur
- Z-index: 50

### Component

```tsx
<Navigation>
  <Logo />
  <Button variant="primary">Create AI Influencer NOW</Button>
</Navigation>
```

---

## 2. Hero Section

### Layout

```
[Gradient Background Glow - subtle parallax]

            [Badge: "Start Building Your AI Influencer Empire"]
            
                     [H1 Headline]
                     [Subheadline]
                     
            [Primary CTA]    [Secondary CTA]
            
                [Trust Text + Logo Row]
```

### Content

| Element      | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Badge        | "Start Building Your AI Influencer Empire"               |
| Headline     | "Create Most Realistic AI Influencer That Earns Money for You 24/7" |
| Subheadline  | "Create hyper-realistic AI influencers with perfect character consistency. Generate images, videos, and content for TikTok, Instagram, Fanvue, OnlyFans, and other monetization platforms." |
| Primary CTA  | "CREATE YOUR AI INFLUENCER NOW"                          |
| Secondary CTA| "See How It Works"                                       |
| Trust Text   | "Join thousands creating passive income with AI influencers" |
| Trust Logos  | TikTok, Instagram, Fanvue, OnlyFans icons                |

### Animations

- Background: Subtle gradient glow with parallax (0.3 speed)
- Badge: Fade in (delay 0ms)
- Headline: Fade in up (delay 100ms)
- Subheadline: Fade in up (delay 200ms)
- CTAs: Fade in up (delay 300ms)
- Trust row: Fade in up (delay 400ms)

### Component

```tsx
<HeroSection>
  <GradientBackground parallax={0.3} />
  <Badge>Start Building Your AI Influencer Empire</Badge>
  <Heading level={1}>Create Most Realistic AI Influencer...</Heading>
  <Text size="lg">Create hyper-realistic AI influencers...</Text>
  <ButtonGroup>
    <Button variant="primary">CREATE YOUR AI INFLUENCER NOW</Button>
    <Button variant="secondary">See How It Works</Button>
  </ButtonGroup>
  <TrustBar>
    <Text size="sm">Join thousands creating passive income...</Text>
    <LogoRow logos={['tiktok', 'instagram', 'fanvue', 'onlyfans']} />
  </TrustBar>
</HeroSection>
```

---

## 3. Platform Logos Marquee

### Layout

```
[Continuous scrolling logo row with fade edges]
  TikTok  Instagram  Fanvue  OnlyFans  TikTok  Instagram ...
```

### Content

| Element     | Value                                    |
| ----------- | ---------------------------------------- |
| Logos       | TikTok, Instagram, Fanvue, OnlyFans      |
| Label       | (optional) "Works with"                  |

### Animation

- Continuous horizontal marquee
- Speed: 40px/second
- Pause on hover (optional)
- Fade edges (gradient mask)

### Component

```tsx
<Marquee speed={40} pauseOnHover>
  <PlatformLogo name="tiktok" />
  <PlatformLogo name="instagram" />
  <PlatformLogo name="fanvue" />
  <PlatformLogo name="onlyfans" />
</Marquee>
```

---

## 4. Stats Section

### Layout

```
      [ Stat 1 ]        [ Stat 2 ]        [ Stat 3 ]
      "10,000+"         "1M+"             "$500K+"
      Creators          Images Generated   Earnings Paid
```

### Content

| Stat    | Number      | Label              |
| ------- | ----------- | ------------------ |
| Stat 1  | 10,000+     | Creators           |
| Stat 2  | 1,000,000+  | Images Generated   |
| Stat 3  | $500,000+   | Earnings Paid      |

### Animation

- Numbers: Count-up animation (2000ms, ease-out)
- Trigger: On scroll into view (once)
- Stagger: 100ms between each stat

### Component

```tsx
<StatsSection>
  <FadeInUp>
    <StatCard>
      <CountUp value={10000} suffix="+" />
      <StatLabel>Creators</StatLabel>
    </StatCard>
    <StatCard>
      <CountUp value={1000000} suffix="+" />
      <StatLabel>Images Generated</StatLabel>
    </StatCard>
    <StatCard>
      <CountUp value={500000} prefix="$" suffix="+" />
      <StatLabel>Earnings Paid</StatLabel>
    </StatCard>
  </FadeInUp>
</StatsSection>
```

---

## 5. How It Works

### Layout

```
                    [Section Title]
                    [Section Subtitle]
                    
  [1]      [2]      [3]      [4]      [5]      [6]      [7]
  Step     Step     Step     Step     Step     Step     Step
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "How It Works"                                           |
| Subtitle   | "Create your AI influencer and start earning in minutes" |

### Steps

| # | Title                    | Description                                              |
| - | ------------------------ | -------------------------------------------------------- |
| 1 | Start the Funnel         | Customize your character: age, eye color, hair style, body type, voice |
| 2 | Select Your Face         | Select from 3 face images and choose the perfect base    |
| 3 | Generate Images          | Generate 7-10 images, review, select, or regenerate      |
| 4 | Create Content           | Use predefined viral-ready prompts and scenes             |
| 5 | Post to Platforms        | Directly connect to Fanvue, OnlyFans, TikTok, Instagram  |
| 6 | Schedule & Monitor       | Schedule posts and see live statistics and earnings      |
| 7 | Community & Courses      | Access exclusive community and expert courses            |

### Animation

- Section title: Fade in up
- Steps: Stagger fade in (100ms delay each)

### Component

```tsx
<HowItWorksSection>
  <FadeInUp>
    <SectionHeader>
      <Heading level={2}>How It Works</Heading>
      <Text>Create your AI influencer and start earning in minutes</Text>
    </SectionHeader>
  </FadeInUp>
  <StepsGrid stagger={100}>
    {steps.map((step, index) => (
      <Step key={index} number={index + 1}>
        <StepBadge>{index + 1}</StepBadge>
        <StepTitle>{step.title}</StepTitle>
        <StepDescription>{step.description}</StepDescription>
      </Step>
    ))}
  </StepsGrid>
</HowItWorksSection>
```

---

## 6. Feature Showcase

### Layout

```
                    [Section Title]
                    [Section Subtitle]
                    
  [Card 1]              [Card 2]              [Card 3]
  Image                 Image                 Image
  Title                 Title                 Title
  Description           Description           Description
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "With Ryla.ai You Will Be Able To"                       |
| Subtitle   | "Everything you need to create, monetize, and grow"      |

### Feature Cards

| # | Title                         | Description                                              | Image           |
| - | ----------------------------- | -------------------------------------------------------- | --------------- |
| 1 | Hyper Realistic Skin          | Indistinguishable from real skin - Experience hyper-realistic quality | skin-comparison |
| 2 | Perfect Hands                 | Perfect fingers and hands on every generated image       | hands-comparison|
| 3 | 100% Character Consistency    | Same character across all scenes with perfect consistency| consistency-demo|

### Animation

- Cards: Stagger fade in (100ms delay each)
- Card hover: Border glow, slight lift

### Component

```tsx
<FeatureShowcase>
  <FadeInUp>
    <SectionHeader>
      <Heading level={2}>With Ryla.ai You Will Be Able To</Heading>
      <Text>Everything you need to create, monetize, and grow</Text>
    </SectionHeader>
  </FadeInUp>
  <FeatureGrid stagger={100}>
    <FeatureCard>
      <FeatureImage src="/images/skin-comparison.webp" alt="Hyper Realistic Skin" />
      <FeatureTitle>Hyper Realistic Skin</FeatureTitle>
      <FeatureDescription>Indistinguishable from real skin...</FeatureDescription>
    </FeatureCard>
    {/* ... more cards */}
  </FeatureGrid>
</FeatureShowcase>
```

---

## 7. Templates Gallery

### Layout

```
                    [Section Title]
                    
  [Tab: Fitness] [Tab: Fashion] [Tab: Travel] [Tab: Gaming] [Tab: NSFW+]
  
  [Horizontal scrolling gallery of template cards]
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "Choose Your Niche"                                      |

### Categories

- Fitness
- Fashion
- Travel
- Gaming
- ASMR
- NSFW+

### Animation

- Horizontal scroll carousel
- Tab switch: Fade transition
- Cards: Fade in on scroll

### Component

```tsx
<TemplatesGallery>
  <FadeInUp>
    <Heading level={2}>Choose Your Niche</Heading>
  </FadeInUp>
  <Tabs>
    {categories.map(cat => (
      <Tab key={cat}>{cat}</Tab>
    ))}
  </Tabs>
  <HorizontalScroll>
    {templates.map(template => (
      <TemplateCard key={template.id}>
        <TemplateImage src={template.image} />
        <TemplateBadge>{template.category}</TemplateBadge>
        <TemplateTitle>{template.name}</TemplateTitle>
      </TemplateCard>
    ))}
  </HorizontalScroll>
</TemplatesGallery>
```

---

## 8. Community & Courses

### Layout

```
                    [Section Title]
                    [Section Subtitle]
                    
  [Community Card]                    [Courses Card]
  Icon                                Icon
  Title                               Title
  Benefits list                       Courses list
  CTA                                 CTA
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "Join the RYLA Community & Learn from Experts"           |
| Subtitle   | "Access exclusive courses, connect with creators, and learn proven strategies" |

### Cards

**Community Card**
- Title: "Creator Community"
- Benefits:
  - Connect with thousands of successful AI influencer creators
  - Share strategies, tips, and success stories
  - Get feedback on your content and niche
  - Network with like-minded creators
- CTA: "Join Community"

**Courses Card**
- Title: "Expert Courses"
- Courses:
  - Finding the Right Niche
  - How to Monetize
  - Content Strategy
  - Platform Optimization
  - Growth Hacking
- CTA: "Access Courses"

### Animation

- Cards: Fade in staggered (100ms)

### Component

```tsx
<CommunitySection>
  <FadeInUp>
    <SectionHeader>
      <Heading level={2}>Join the RYLA Community & Learn from Experts</Heading>
      <Text>Access exclusive courses, connect with creators...</Text>
    </SectionHeader>
  </FadeInUp>
  <TwoColumnGrid stagger={100}>
    <CommunityCard>
      <Icon name="community" />
      <CardTitle>Creator Community</CardTitle>
      <BenefitsList>...</BenefitsList>
      <Button variant="secondary">Join Community</Button>
    </CommunityCard>
    <CoursesCard>
      <Icon name="courses" />
      <CardTitle>Expert Courses</CardTitle>
      <CoursesList>...</CoursesList>
      <Button variant="secondary">Access Courses</Button>
    </CoursesCard>
  </TwoColumnGrid>
</CommunitySection>
```

---

## 9. Testimonials

### Layout

```
                    [Section Title]
                    
  [Horizontal scrolling testimonial cards]
  [Card] [Card] [Card] [Card] [Card]
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "What Creators Are Saying"                               |

### Testimonial Structure

Each testimonial card includes:
- Avatar (48px, rounded)
- Name
- Role/Earnings
- Quote

### Sample Testimonials

| Name        | Role              | Quote                                                    |
| ----------- | ----------------- | -------------------------------------------------------- |
| Sarah M.    | $5K/month creator | "RYLA made it so easy to start earning. The character consistency is unreal." |
| Jake T.     | AI Influencer     | "The quality is incredible. My followers can't tell the difference." |
| Maria L.    | Content Creator   | "From zero to $10K in 3 months. The courses helped me find my niche." |
| Alex R.     | Agency Owner      | "We manage 15 AI influencers with RYLA. The platform is unmatched." |

### Animation

- Horizontal scroll carousel
- Cards: Fade in on scroll

### Component

```tsx
<TestimonialsSection>
  <FadeInUp>
    <Heading level={2}>What Creators Are Saying</Heading>
  </FadeInUp>
  <HorizontalScroll>
    {testimonials.map(t => (
      <TestimonialCard key={t.id}>
        <Avatar src={t.avatar} />
        <Name>{t.name}</Name>
        <Role>{t.role}</Role>
        <Quote>"{t.quote}"</Quote>
      </TestimonialCard>
    ))}
  </HorizontalScroll>
</TestimonialsSection>
```

---

## 10. Pricing

### Layout

```
                    [Section Title]
                    [Section Subtitle]
                    [Monthly/Annual Toggle]
                    
  [Starter]             [Pro - Popular]           [Studio]
  $29/mo                $79/mo                    $299/mo
  Features              Features                  Features
  CTA                   CTA                       CTA
```

### Content

| Element    | Value                                                    |
| ---------- | -------------------------------------------------------- |
| Title      | "Choose Your Plan"                                       |
| Subtitle   | "Start earning with your AI influencer today"            |

### Pricing Tiers

**Starter - $29/month**
- 1 AI Influencer Persona
- 100 posts per month
- 3 platform connections
- Basic analytics
- Email support
- Community access
- Basic courses

**Pro - $79/month (Most Popular)**
- 5 AI Influencer Personas
- 500 posts per month
- Unlimited platform connections
- Advanced analytics
- Live statistics & earnings tracking
- Priority support
- Full NSFW support
- Post scheduling
- Full community access
- All courses included

**Studio - $299/month**
- Unlimited AI Influencer Personas
- Unlimited posts
- Unlimited platform connections
- Enterprise analytics
- Real-time earnings dashboard
- Dedicated support
- Team collaboration
- 1-on-1 strategy sessions

### Animation

- Cards: Stagger fade in (100ms)
- Popular card: Purple gradient border

### Component

```tsx
<PricingSection>
  <FadeInUp>
    <SectionHeader>
      <Heading level={2}>Choose Your Plan</Heading>
      <Text>Start earning with your AI influencer today</Text>
      <Toggle options={['Monthly', 'Annual']} />
    </SectionHeader>
  </FadeInUp>
  <PricingGrid stagger={100}>
    <PricingCard tier="starter">...</PricingCard>
    <PricingCard tier="pro" highlighted>...</PricingCard>
    <PricingCard tier="studio">...</PricingCard>
  </PricingGrid>
</PricingSection>
```

---

## 11. Final CTA

### Layout

```
[Gradient Background Glow]

            [Headline]
            [Description]
            
            [Primary CTA]
            
            [Platform Logo Grid]
```

### Content

| Element      | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Headline     | "Create Most Realistic AI Influencer That Earns Money for You 24/7" |
| Description  | "Join thousands creating passive income with AI influencers. Build your AI influencer empire today." |
| CTA          | "CREATE YOUR AI INFLUENCER NOW"                          |
| Logos        | TikTok, Instagram, Fanvue, OnlyFans                      |

### Animation

- Background: Gradient glow
- Content: Fade in up (staggered)

### Component

```tsx
<FinalCTA>
  <GradientBackground />
  <FadeInUp>
    <Heading level={2}>Create Most Realistic AI Influencer...</Heading>
    <Text>Join thousands creating passive income...</Text>
    <Button variant="primary" size="lg">CREATE YOUR AI INFLUENCER NOW</Button>
    <LogoGrid logos={['tiktok', 'instagram', 'fanvue', 'onlyfans']} />
  </FadeInUp>
</FinalCTA>
```

---

## 12. Footer

### Layout

```
[Logo]                          [Links Column 1]  [Links Column 2]
[Tagline]                       Product           Company
                                Features          About
                                Pricing           Contact
                                Templates         Support

[Copyright]                     [Privacy] [Terms] [Social Icons]
```

### Content

| Element      | Value                                                    |
| ------------ | -------------------------------------------------------- |
| Logo         | RYLA                                                     |
| Tagline      | "Create. Generate. Monetize."                            |
| Copyright    | "© 2025 RYLA.ai. All rights reserved."                   |

### Links

**Product**
- Features
- Pricing
- Templates
- Community
- Courses

**Company**
- About
- Contact
- Support
- Privacy Policy
- Terms of Service

**Social**
- Twitter/X
- Instagram
- Discord

### Component

```tsx
<Footer>
  <FooterBrand>
    <Logo />
    <Tagline>Create. Generate. Monetize.</Tagline>
  </FooterBrand>
  <FooterLinks>
    <LinkColumn title="Product">...</LinkColumn>
    <LinkColumn title="Company">...</LinkColumn>
  </FooterLinks>
  <FooterBottom>
    <Copyright>© 2025 RYLA.ai. All rights reserved.</Copyright>
    <SocialLinks>...</SocialLinks>
  </FooterBottom>
</Footer>
```

---

## Assets Required

### Images

| Asset                    | Path                           | Size       |
| ------------------------ | ------------------------------ | ---------- |
| RYLA Logo                | /images/logo.svg               | Vector     |
| Skin comparison          | /images/skin-comparison.webp   | 800x600    |
| Hands comparison         | /images/hands-comparison.webp  | 800x600    |
| Consistency demo         | /images/consistency-demo.webp  | 1200x400   |
| Template previews        | /images/templates/*.webp       | 400x600    |
| Avatar placeholders      | /images/avatars/*.webp         | 96x96      |

### Icons

| Icon           | Usage                        |
| -------------- | ---------------------------- |
| TikTok         | Platform logos               |
| Instagram      | Platform logos               |
| Fanvue         | Platform logos               |
| OnlyFans       | Platform logos               |
| Community      | Community section            |
| Courses        | Courses section              |
| Check          | Feature lists                |
| Arrow Right    | CTAs, links                  |

### Fonts

- DM Sans (Google Fonts)
- JetBrains Mono (Google Fonts)

---

## Responsive Breakpoints

| Breakpoint | Layout Changes                                           |
| ---------- | -------------------------------------------------------- |
| < 640px    | Single column, stacked layout, smaller text              |
| 640-1024px | 2-column grids, reduced padding                          |
| > 1024px   | Full 3-column grids, max-width container                 |

