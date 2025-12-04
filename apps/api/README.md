# API App

Backend API service.

## Purpose
- REST/GraphQL API endpoints
- Authentication handling
- Business logic orchestration
- Database operations

## Tech Stack
- Node.js
- Express / Fastify / NestJS
- TypeScript
- PostgreSQL

## Structure
```
apps/api/
├── src/
│   ├── controllers/   # Route handlers (uses libs/business)
│   ├── routes/        # Route definitions
│   ├── middleware/    # Express middleware
│   └── main.ts        # Entry point
└── project.json       # Nx project config
```

## Layer Usage
- Controllers call `@ryla/business` services
- Services use `@ryla/data` repositories
- Uses `@ryla/shared` utilities

## Commands
```bash
nx serve api          # Development server
nx build api          # Production build
nx test api           # Run tests
nx lint api           # Lint code
```

