# CometCard Component

A beautiful animated card wrapper that creates a comet-like glow effect following the user's mouse cursor.

## Features

- **Mouse-following glow effect** - Creates a radial gradient that follows the cursor position
- **Smooth animations** - Opacity transitions for elegant hover states
- **Customizable colors** - Configure comet color to match your design
- **Performance optimized** - Uses CSS transforms and transitions for smooth 60fps animations
- **Accessible** - Wrapper maintains all accessibility features of wrapped components

## Usage

### Basic Usage

```tsx
import { CometCard } from '@ryla/ui';

function MyComponent() {
  return (
    <CometCard>
      <div className="p-6 bg-card rounded-lg">
        <h2>Your content here</h2>
      </div>
    </CometCard>
  );
}
```

### With InfluencerCard

```tsx
import { CometCard } from '@ryla/ui';
import { InfluencerCard } from '@/components/influencer/InfluencerCard';

function DashboardPage() {
  return (
    <div className="grid grid-cols-4 gap-6">
      {influencers.map((influencer) => (
        <InfluencerCard key={influencer.id} influencer={influencer} />
      ))}
    </div>
  );
}
```

### Custom Color

```tsx
<CometCard cometColor="rgba(236, 72, 153, 0.4)">
  <div className="p-6">Pink comet effect</div>
</CometCard>
```

### Disable Comet Effect

```tsx
<CometCard showComet={false}>
  <div className="p-6">No comet effect</div>
</CometCard>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | `React.ReactNode` | Required | Content to wrap with comet effect |
| `className` | `string` | `undefined` | Additional CSS classes for the wrapper |
| `showComet` | `boolean` | `true` | Whether to show the comet effect on hover |
| `cometColor` | `string` | `'rgba(168, 85, 247, 0.4)'` | Color of the comet glow (supports any CSS color) |

## How It Works

1. **Mouse Tracking** - Captures mouse position relative to the card container
2. **Radial Gradient** - Creates a dynamic radial gradient centered on mouse position
3. **Layered Effects** - Uses two layers:
   - Main glow spot (follows cursor closely)
   - Trailing glow (wider radius for ambient effect)
4. **z-index Management** - Content is elevated above effects with `z-20`

## Performance

The component is optimized for performance:

- Uses `transform: translate()` instead of `left`/`top` for smooth GPU-accelerated animations
- Opacity transitions for fade effects
- `pointer-events: none` on effect layers to avoid interaction conflicts
- Memoized mouse move handler with `useCallback`

## Integration with Existing Cards

The CometCard is designed to wrap existing card components without modifying their internal structure:

```tsx
// ✅ Good: Wraps card component
<CometCard>
  <Link href="/profile">
    <div className="card-content">...</div>
  </Link>
</CometCard>

// ✅ Good: With custom styling
<CometCard className="col-span-2">
  <div className="feature-card">...</div>
</CometCard>
```

## Design Inspiration

Inspired by [Aceternity UI's Comet Card](https://ui.aceternity.com/components/comet-card) with optimizations for RYLA's design system and purple theme.

## Examples

### Dashboard Grid

```tsx
<div className="grid grid-cols-4 gap-6">
  {items.map((item) => (
    <CometCard key={item.id}>
      <Card>
        <CardContent>{item.content}</CardContent>
      </Card>
    </CometCard>
  ))}
</div>
```

### Feature Highlights

```tsx
<div className="grid md:grid-cols-3 gap-8">
  <CometCard cometColor="rgba(168, 85, 247, 0.4)">
    <FeatureCard icon="sparkles" title="AI Generation" />
  </CometCard>
  
  <CometCard cometColor="rgba(236, 72, 153, 0.4)">
    <FeatureCard icon="heart" title="Engagement" />
  </CometCard>
  
  <CometCard cometColor="rgba(168, 85, 247, 0.4)">
    <FeatureCard icon="trending" title="Analytics" />
  </CometCard>
</div>
```

## Browser Support

Works in all modern browsers that support:
- CSS `transform`
- CSS `opacity` transitions
- CSS `radial-gradient`
- React hooks (`useState`, `useCallback`, `useRef`)

## Related Components

- `MagicCard` - Similar effect with different visual style
- `RylaCard` - Base card component for RYLA design system
- `Spotlight` - Spotlight effect component
