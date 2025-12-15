# Landing Components

This directory contains reusable components specifically designed for landing pages. These components are used across multiple landing page variants and can be easily customized through props.

## Structure

```
landing/
├── hero-section.tsx          # Hero section with CTA and visual elements
├── how-it-works.tsx           # Process explanation section
├── pricing.tsx                # Pricing plans display
├── social-proof.tsx           # Social proof and testimonials
├── problem-promise.tsx        # Problem/solution showcase
├── live-demo.tsx              # Interactive demo section
├── ai-influencer-showcase.tsx # AI influencer gallery
├── templates-gallery.tsx      # Content templates showcase
├── integrations.tsx           # Platform integrations display
├── faq.tsx                    # Frequently asked questions
├── final-cta.tsx              # Final call-to-action section
└── index.ts                   # Exports all components
```

## Usage

Import components from the landing folder:

```typescript
import { HeroSection, SocialProof, Pricing, FAQ } from "@/components/landing";
```

## Component Guidelines

- **Reusability**: All components are designed to be reusable across different landing page variants
- **Customization**: Components accept props for customization when needed
- **Consistency**: Follow the design system and maintain consistent styling
- **Accessibility**: Ensure proper ARIA labels and semantic HTML

## Relationship to Landing Pages

- **Landing Components** (`/components/landing/`): Reusable, generic components
- **Landing Page Sections** (`/components/landing-pages/sections/`): Page-specific or persona-specific sections
- **Landing Page Configs** (`/components/landing-pages/configs/`): Configuration files for landing page variants

## Best Practices

1. **Prefer Landing Components**: Use components from `/components/landing/` when possible
2. **Create Page-Specific Sections**: Only create new sections in `/components/landing-pages/sections/` when you need page-specific or persona-specific functionality
3. **Keep Components Generic**: Landing components should be generic enough to work across different landing pages
4. **Document Customization**: If a component needs props for customization, document them clearly

## Adding New Components

When adding a new reusable landing component:

1. Create the component file in `/components/landing/`
2. Export it from `/components/landing/index.ts`
3. Add it to `LandingPageFactory.tsx` if needed
4. Document the component's props and usage
5. Ensure it follows the design system and accessibility guidelines
