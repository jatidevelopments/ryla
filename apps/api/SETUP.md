# Local Development Setup - Quick Reference

## ✅ Current Status

**Services Running:**
- ✅ PostgreSQL: `localhost:5432` (user: `admin`, database: `ryla`)
- ✅ Redis: `localhost:6379` (no password)

**Configuration:**
- ✅ Environment file: `apps/api/.env` (created)
- ✅ Database: `ryla` (exists)

## Quick Commands

### Start Backend
```bash
nx serve api
```

### Database Migrations
```bash
# Generate migrations from schemas
pnpm db:generate

# Push schema changes (dev - auto-syncs)
pnpm db:push

# Run migrations (production)
pnpm db:migrate

# Open Drizzle Studio (visual DB browser)
pnpm db:studio
```

### Test Connections
```bash
# Test PostgreSQL
psql -U admin -d ryla -c "SELECT version();"

# Test Redis
redis-cli ping

# Test Backend Health
curl http://localhost:3001/health
curl http://localhost:3001/database-check
```

## Environment Variables

The backend loads environment variables from:
1. `apps/api/.env` (if exists)
2. System environment variables
3. Defaults in `configuration.ts`

**Key Variables:**
- `POSTGRES_HOST=localhost`
- `POSTGRES_PORT=5432`
- `POSTGRES_USER=admin`
- `POSTGRES_DB=ryla`
- `REDIS_HOST=localhost`
- `REDIS_PORT=6379`
- `APP_PORT=3001`

## Troubleshooting

### Backend won't start
- Check `.env` file exists: `cat apps/api/.env`
- Verify services running: `lsof -i :5432` and `lsof -i :6379`
- Check logs: Look for connection errors

### Database connection fails
- Verify database exists: `psql -U admin -l | grep ryla`
- Check user permissions: `psql -U admin -d ryla -c "SELECT current_user;"`
- Update `POSTGRES_PASSWORD` in `.env` if password is set

### Redis connection fails
- Test Redis: `redis-cli ping` (should return `PONG`)
- Check if password required: Update `REDIS_PASSWORD` in `.env`

## Next Steps

1. ✅ Environment configured
2. ⏳ Generate and run migrations: `pnpm db:generate && pnpm db:push`
3. ⏳ Start backend: `nx serve api`
4. ⏳ Test API: Visit `http://localhost:3001/docs` (Swagger UI)

