# RYLA Open Graph Image Generation Prompt

## Image Specifications

- **Dimensions**: 1200x630 pixels (standard OG image ratio 1.91:1)
- **Format**: PNG with transparency support
- **File Name**: `og-image.png`
- **Location**: `/public/og-image.png` in each app (landing, funnel, web)

## Design Prompt for AI Image Generator

```
Create a professional, modern Open Graph social sharing image for RYLA.ai, an AI influencer creation platform.

COMPOSITION:
- Landscape orientation, 1200x630 pixels
- Dark background (#0A0A0B) with subtle gradient overlay
- Purple-to-pink gradient accent (from #9333EA to #EC4899) flowing diagonally from top-left to bottom-right
- Clean, spacious layout with generous whitespace

VISUAL ELEMENTS:
- Center-left: A stylized, futuristic AI avatar/influencer silhouette or holographic representation
- The avatar should appear hyper-realistic but with subtle digital/neural network overlay effects
- Small floating UI elements suggesting AI generation: sparkles, neural network nodes, or digital particles
- Bottom-right corner: RYLA logo (white text "RYLA" with purple gradient accent on the "R" or "A")

TYPOGRAPHY:
- Main headline (top-center, large, bold): "Create Hyper-Realistic AI Influencers"
- Subheadline (below main, medium weight): "That Earn 24/7"
- Use modern sans-serif font (DM Sans style), white text (#FFFFFF)
- Text should have subtle glow effect matching the purple-pink gradient

COLOR PALETTE:
- Background: Deep black (#0A0A0B)
- Primary gradient: Purple (#9333EA) to Pink (#EC4899)
- Text: Pure white (#FFFFFF)
- Accents: Subtle purple glow (#A855F7 at 30% opacity)

STYLE:
- Modern, premium, tech-forward aesthetic
- Clean and minimal, not cluttered
- Professional enough for social media sharing
- Slight futuristic/cyber aesthetic without being too sci-fi
- High contrast for readability when shared on social platforms
- No text should be too close to edges (safe margins: 60px all sides)

MOOD:
- Innovative, cutting-edge
- Professional yet approachable
- Premium quality
- Forward-thinking technology

TECHNICAL REQUIREMENTS:
- High resolution, sharp text
- Optimized for web (under 500KB if possible)
- Text must be readable at small sizes (when shared on mobile)
- Gradient should be smooth and professional
- No watermarks or placeholder text
```

## Alternative Shorter Prompt (for DALL-E, Midjourney, etc.)

```
A 1200x630px Open Graph social media image for RYLA.ai AI influencer platform. Dark background (#0A0A0B) with purple-to-pink gradient (#9333EA to #EC4899) flowing diagonally. Center-left features a futuristic hyper-realistic AI avatar silhouette with subtle neural network overlay effects. White bold text at top: "Create Hyper-Realistic AI Influencers That Earn 24/7". RYLA logo bottom-right. Modern, clean, premium tech aesthetic. High contrast, professional, optimized for social sharing.
```

## Design Variations to Consider

### Option 1: Avatar-Focused

- Prominent AI influencer avatar in center
- Gradient background with subtle patterns
- Text overlay on gradient

### Option 2: Product Showcase

- Split layout: AI-generated content examples on left, text on right
- Grid of influencer images (blurred/silhouetted for privacy)
- Purple-pink gradient divider

### Option 3: Minimal Text-Heavy

- Large, bold typography as primary element
- Subtle gradient background
- Small AI icon/avatar as accent
- Maximum readability

## Implementation Notes

1. **Generate the image** using the prompt above with your preferred AI image generator (DALL-E, Midjourney, Stable Diffusion, etc.)
2. **Save as** `og-image.png` at 1200x630px
3. **Place in**:
   - `apps/landing/public/og-image.png`
   - `apps/funnel/public/og-image.png` (or use CDN)
   - `apps/web/public/og-image.png`
4. **Optimize** the image (TinyPNG, ImageOptim, or similar) to reduce file size while maintaining quality
5. **Test** using:
   - [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/)
   - [Twitter Card Validator](https://cards-dev.twitter.com/validator)
   - [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/)

## Brand Consistency Checklist

- ✅ Uses brand colors (purple #9333EA, pink #EC4899)
- ✅ Dark background (#0A0A0B) matches site design
- ✅ Includes key value proposition text
- ✅ Professional, premium aesthetic
- ✅ Readable at small sizes
- ✅ No outdated design elements
- ✅ Matches landing page visual style
