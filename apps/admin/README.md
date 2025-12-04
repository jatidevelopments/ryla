# Admin App

Administrative dashboard.

## Purpose
- User management
- System configuration
- Analytics dashboards
- Audit logs

## Tech Stack
- Next.js / React
- TypeScript
- TailwindCSS

## Structure
```
apps/admin/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # Admin-specific components
│   └── styles/        # Admin-specific styles
└── project.json       # Nx project config
```

## Access
- Requires admin role
- Separate from main web app
- Can be internal-only

## Commands
```bash
nx serve admin        # Development server
nx build admin        # Production build
nx test admin         # Run tests
nx lint admin         # Lint code
```

