# UI Component Library

Shared UI components used across web and admin apps.

## Import
```typescript
import { Button, Card, ... } from '@ryla/ui';
```

## Structure
```
libs/ui/src/
├── components/    # Reusable components
├── layouts/       # Layout components
├── hooks/         # Custom React hooks
├── styles/        # Shared styles
└── index.ts       # Public exports
```

## Design System
- Mobile first
- >98% browser compatibility
- Consistent theming
- Accessible (WCAG 2.1 AA)

## Storybook
```bash
nx storybook ui    # Run Storybook
```

