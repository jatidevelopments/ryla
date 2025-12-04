# Web App

Main web application.

## Purpose
- User-facing web interface
- Public pages (landing, pricing)
- Authenticated user experience

## Tech Stack
- Next.js / React
- TypeScript
- TailwindCSS

## Structure
```
apps/web/
├── src/
│   ├── app/           # Next.js app router
│   ├── components/    # App-specific components
│   └── styles/        # App-specific styles
├── public/            # Static assets
└── project.json       # Nx project config
```

## Commands
```bash
nx serve web          # Development server
nx build web          # Production build
nx test web           # Run tests
nx lint web           # Lint code
```

