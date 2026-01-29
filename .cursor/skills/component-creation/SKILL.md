---
name: component-creation
description: Creates React components following RYLA patterns and file organization. Use when creating components, building UI, implementing features, or when the user mentions components, UI, or React.
---

# Component Creation

Creates React components following RYLA patterns, file organization, and best practices.

## Quick Start

When creating a component:

1. **Determine Type** - Page, Feature, or UI component
2. **Choose Location** - Page-specific or shared
3. **Create File** - Follow naming conventions
4. **Implement Component** - Server Component by default
5. **Extract if Needed** - Extract when > 150 lines

## Component Types

### Page Component

**Location**: `apps/web/app/[route]/page.tsx`

**Responsibilities:**
- Data fetching (Server Component or useEffect)
- Layout composition
- Error boundaries
- NO business logic

**Example:**

```tsx
// app/characters/page.tsx
import { getCharacters } from '@ryla/data';
import { CharacterList } from './components/CharacterList';

export default async function CharactersPage() {
  // Fetch data on server
  const characters = await getCharacters();
  
  return (
    <div>
      <h1>Characters</h1>
      <CharacterList characters={characters} />
    </div>
  );
}
```

### Feature Component

**Location**: `apps/web/components/[feature]/` or `app/[route]/components/`

**Responsibilities:**
- Orchestrates UI + logic
- 100-200 lines target
- Can be Server or Client Component

**Example:**

```tsx
// components/character-wizard/CharacterWizard.tsx
'use client';

import { useState } from 'react';
import { WizardSteps } from './components/WizardSteps';
import { useCharacterWizard } from './hooks/useCharacterWizard';

export function CharacterWizard() {
  const { currentStep, nextStep, prevStep, wizardState } = useCharacterWizard();
  
  return (
    <div>
      <WizardSteps currentStep={currentStep} />
      {/* Wizard content */}
    </div>
  );
}
```

### UI Component

**Location**: `libs/ui/src/components/` or `components/ui/`

**Responsibilities:**
- Pure presentation
- Props in, JSX out
- < 80 lines target
- Reusable across apps

**Example:**

```tsx
// libs/ui/src/components/ryla-button.tsx
import { Button } from '@radix-ui/react-button';

export interface RylaButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export function RylaButton({ 
  children, 
  variant = 'primary',
  onClick 
}: RylaButtonProps) {
  return (
    <Button variant={variant} onClick={onClick}>
      {children}
    </Button>
  );
}
```

## Server vs Client Components

### Server Component (Default)

**Use when:**
- Fetching data
- Accessing backend resources
- No interactivity needed
- Better performance

```tsx
// ✅ Good: Server Component (default)
// app/characters/page.tsx
import { getCharacters } from '@ryla/data';

export default async function CharactersPage() {
  const characters = await getCharacters();
  return <CharacterList characters={characters} />;
}
```

### Client Component

**Use when:**
- Need interactivity (onClick, onChange)
- Using hooks (useState, useEffect)
- Browser APIs (localStorage, window)
- Event listeners

```tsx
// ✅ Good: Client Component for interactivity
'use client';

import { useState } from 'react';

export function CharacterCard({ character }: { character: Character }) {
  const [isFavorite, setIsFavorite] = useState(false);
  
  return (
    <div>
      <button onClick={() => setIsFavorite(!isFavorite)}>
        {isFavorite ? '❤️' : '🤍'}
      </button>
    </div>
  );
}
```

## File Organization

### Page with Components

```
app/characters/
├── page.tsx              # Main page (< 150 lines)
├── components/
│   ├── CharacterList.tsx
│   ├── CharacterCard.tsx
│   └── index.ts          # Barrel export
├── hooks/
│   ├── useCharacterFilters.ts
│   └── index.ts
└── constants.ts
```

### Shared Feature Component

```
components/character-wizard/
├── CharacterWizard.tsx    # Main component (< 150 lines)
├── components/
│   ├── WizardSteps.tsx
│   ├── WizardContent.tsx
│   └── index.ts
├── hooks/
│   ├── useCharacterWizard.ts
│   └── index.ts
└── index.ts               # Barrel export
```

### Shared UI Component

```
libs/ui/src/components/
├── ryla-button.tsx
├── ryla-card.tsx
└── index.ts               # Barrel export
```

## Component Structure

### Basic Template

```tsx
// ComponentName.tsx
import { type ComponentProps } from 'react';

export interface ComponentNameProps {
  // Props definition
  title: string;
  description?: string;
  onAction?: () => void;
}

export function ComponentName({
  title,
  description,
  onAction,
}: ComponentNameProps) {
  return (
    <div>
      <h2>{title}</h2>
      {description && <p>{description}</p>}
      {onAction && (
        <button onClick={onAction}>Action</button>
      )}
    </div>
  );
}
```

## Component Guidelines

### Size & Responsibility

| Metric | Good | Bad |
|--------|------|-----|
| Lines | < 150 (prefer < 100) | > 200 |
| Responsibilities | Single, clear purpose | Multiple concerns |
| Props | ≤ 5 props | > 7 props |
| Nesting depth | Max 2 levels | Deeply nested |

### Good Component Checklist

```
✅ Single responsibility
✅ Typed props interface (exported)
✅ Handlers named handle* (handleClick, handleSubmit)
✅ Loading/error states handled
✅ No inline styles (use Tailwind)
✅ Accessible (aria labels, keyboard nav)
```

## Patterns

### Composition

```tsx
// ✅ Good: Composition over inheritance
export function Card({ children }: { children: React.ReactNode }) {
  return <div className="card">{children}</div>;
}

export function CardHeader({ children }: { children: React.ReactNode }) {
  return <div className="card-header">{children}</div>;
}

// Usage
<Card>
  <CardHeader>Title</CardHeader>
  <p>Content</p>
</Card>
```

### Custom Hooks

```tsx
// ✅ Good: Extract logic to hook
function useCharacterGeneration(id: string) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const generate = useCallback(async () => {
    setStatus('loading');
    // ... generation logic
    setStatus('success');
  }, [id]);
  
  return { status, generate, isLoading: status === 'loading' };
}

export function CharacterGenerator({ id }: { id: string }) {
  const { generate, isLoading } = useCharacterGeneration(id);
  return <button onClick={generate} disabled={isLoading}>Generate</button>;
}
```

### Data Fetching

```tsx
// ✅ Good: Server Component for data fetching
export default async function CharactersPage() {
  const characters = await getCharacters();
  return <CharacterList characters={characters} />;
}

// ✅ Good: Client Component with React Query
'use client';
import { trpc } from '@/trpc/client';

export function CharacterList() {
  const { data: characters } = trpc.character.list.useQuery();
  return <div>{/* render */}</div>;
}
```

## Styling

### Tailwind CSS

```tsx
// ✅ Good: Use Tailwind classes
<div className="flex items-center gap-4 p-6 bg-white rounded-lg shadow">
  <h2 className="text-2xl font-bold">Title</h2>
</div>

// ❌ Bad: Inline styles
<div style={{ display: 'flex', padding: '24px' }}>
```

### Responsive Design

```tsx
// ✅ Good: Mobile-first responsive
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Content */}
</div>
```

## Accessibility

### ARIA Labels

```tsx
// ✅ Good: Accessible button
<button
  aria-label="Add to favorites"
  onClick={handleFavorite}
>
  ❤️
</button>
```

### Keyboard Navigation

```tsx
// ✅ Good: Keyboard support
<button
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>
```

## Error Handling

```tsx
// ✅ Good: Error boundary
'use client';
import { ErrorBoundary } from 'react-error-boundary';

export function ComponentWithErrorBoundary() {
  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <ComponentThatMayError />
    </ErrorBoundary>
  );
}
```

## Testing

```tsx
// ComponentName.spec.tsx
import { render, screen } from '@testing-library/react';
import { ComponentName } from './ComponentName';

describe('ComponentName', () => {
  it('should render title', () => {
    render(<ComponentName title="Test" />);
    expect(screen.getByText('Test')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Start with Server Component** - Only add 'use client' when needed
2. **Extract Early** - Extract when component exceeds 150 lines
3. **Single Responsibility** - One component, one purpose
4. **Type Props** - Always type component props
5. **Use Composition** - Compose smaller components
6. **Handle States** - Loading, error, empty states
7. **Accessible** - ARIA labels, keyboard navigation
8. **Mobile First** - Responsive design from the start

## Related Resources

- **React Patterns**: `.cursor/rules/react-patterns.mdc`
- **File Organization**: `.cursor/rules/file-organization.mdc`
- **Styling**: `.cursor/rules/styling.mdc`
- **Accessibility**: `.cursor/rules/accessibility.mdc`
