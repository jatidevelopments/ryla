# EP-019 (P9) — Report a Bug: Deployment

Working in **PHASE P9 (Deployment)** on **EP-019, ST-001-ST-004**.

## Deployment Checklist

### Pre-Deployment
- [ ] All tests passing (unit, integration, E2E)
- [ ] Code review completed
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Database migration tested
- [ ] Environment variables documented
- [ ] S3 bucket configured
- [ ] Analytics configured
- [ ] Feature flag created (if needed)

### Database
- [ ] Migration file created
- [ ] Migration tested in staging
- [ ] Rollback plan documented
- [ ] Backup taken (if production)

### Backend
- [ ] API changes deployed
- [ ] tRPC router registered
- [ ] Environment variables set
- [ ] S3 credentials configured
- [ ] Error logging configured

### Frontend
- [ ] UI changes deployed
- [ ] Console log buffer initialized
- [ ] Bottom nav updated
- [ ] Modal components deployed
- [ ] Analytics events configured

### Infrastructure
- [ ] S3 bucket exists and accessible
- [ ] Bucket permissions correct
- [ ] CORS configured (if needed)
- [ ] Storage costs monitored

---

## Environment Variables

### Backend (apps/api)

```bash
# S3/MinIO Configuration (existing)
AWS_S3_ACCESS_KEY=...
AWS_S3_SECRET_KEY=...
AWS_S3_BUCKET_NAME=...
AWS_S3_ENDPOINT=... # For MinIO
AWS_S3_REGION=...

# Database (existing)
DATABASE_URL=...

# Analytics (existing)
POSTHOG_API_KEY=...
```

### Frontend (apps/web)

```bash
# Analytics (existing)
NEXT_PUBLIC_POSTHOG_KEY=...
NEXT_PUBLIC_POSTHOG_HOST=...

# API (existing)
NEXT_PUBLIC_API_URL=...
```

**No new environment variables required** - uses existing infrastructure.

---

## Database Migration

### Migration File

**File**: `drizzle/migrations/XXXX-bug-reports.sql`

```sql
-- Create bug_report_status enum
CREATE TYPE bug_report_status AS ENUM ('open', 'in_progress', 'resolved', 'closed');

-- Create bug_reports table
CREATE TABLE bug_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  email TEXT,
  description TEXT NOT NULL,
  screenshot_url TEXT,
  console_logs JSONB,
  browser_metadata JSONB NOT NULL,
  status bug_report_status NOT NULL DEFAULT 'open',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX bug_reports_user_id_idx ON bug_reports(user_id);
CREATE INDEX bug_reports_status_idx ON bug_reports(status);
CREATE INDEX bug_reports_created_at_idx ON bug_reports(created_at);
```

### Migration Steps

1. **Test in staging:**
   ```bash
   pnpm drizzle-kit push
   # or
   pnpm drizzle-kit migrate
   ```

2. **Verify migration:**
   - Check table created
   - Check indexes created
   - Check enum created
   - Test insert/select

3. **Deploy to production:**
   ```bash
   pnpm drizzle-kit push
   # or
   pnpm drizzle-kit migrate
   ```

### Rollback

If migration needs to be rolled back:

```sql
-- Drop table
DROP TABLE IF EXISTS bug_reports;

-- Drop enum
DROP TYPE IF EXISTS bug_report_status;
```

**Note**: Only rollback if no data has been created yet.

---

## Deployment Steps

### 1. Backend Deployment

```bash
# Build
pnpm nx build api

# Run migrations (if not auto-run)
pnpm drizzle-kit push

# Deploy (method depends on infrastructure)
# - Vercel: Automatic on push
# - Docker: Build and push image
# - Manual: Copy files and restart service
```

### 2. Frontend Deployment

```bash
# Build
pnpm nx build web

# Deploy (method depends on infrastructure)
# - Vercel: Automatic on push
# - Docker: Build and push image
# - Manual: Copy files and restart service
```

### 3. Verification

1. **Check backend:**
   - API health check
   - tRPC router accessible
   - Database connection works

2. **Check frontend:**
   - Page loads
   - Bottom nav visible
   - Modal opens
   - Screenshot capture works
   - Submission works

3. **Check storage:**
   - S3 bucket accessible
   - Screenshot uploads work
   - URLs accessible

4. **Check analytics:**
   - Events fire
   - Events appear in dashboard

---

## Post-Deployment Monitoring

### Metrics to Monitor

1. **Bug Report Submissions**
   - Count per day
   - Success rate
   - Error rate

2. **Screenshot Capture**
   - Success rate
   - Average capture time
   - Average file size
   - Failure reasons

3. **Console Log Capture**
   - Success rate
   - Average log count
   - Failure reasons

4. **Storage Usage**
   - Screenshot storage size
   - Storage costs
   - Growth rate

5. **Performance**
   - Average submission time
   - API response time
   - Frontend load time

### Error Monitoring

- Screenshot capture failures
- Console log capture failures
- Submission failures
- Storage upload failures
- Database errors

### Alerts

Set up alerts for:
- High error rate (>5%)
- Storage quota approaching
- Performance degradation
- Critical failures

---

## Feature Flag (Optional)

If using feature flags:

```typescript
// Feature flag: bug_report_enabled
const isBugReportEnabled = getFeatureFlag('bug_report_enabled');

if (isBugReportEnabled) {
  // Show "Report Bug" in bottom nav
}
```

**Benefits:**
- Gradual rollout
- Easy rollback
- A/B testing

---

## Rollback Procedure

### If Critical Issues Found

1. **Disable feature:**
   - Remove bottom nav item (quick fix)
   - Or use feature flag

2. **Revert code:**
   ```bash
   git revert <commit-hash>
   git push
   ```

3. **Revert database (if needed):**
   ```sql
   DROP TABLE IF EXISTS bug_reports;
   DROP TYPE IF EXISTS bug_report_status;
   ```

4. **Redeploy:**
   - Backend
   - Frontend

5. **Verify rollback:**
   - Feature no longer visible
   - No errors in logs
   - System stable

---

## Documentation Updates

### Internal Documentation
- [ ] Update architecture docs
- [ ] Update API docs
- [ ] Update deployment guide
- [ ] Update runbook (if applicable)

### User Documentation (if applicable)
- [ ] Update user guide
- [ ] Update FAQ
- [ ] Update support docs

---

## Communication

### Team Notification
- [ ] Notify team of deployment
- [ ] Share feature details
- [ ] Share monitoring dashboard
- [ ] Share rollback plan

### User Notification (if applicable)
- [ ] Announce feature (if user-facing)
- [ ] Update changelog
- [ ] Update release notes

---

## Success Criteria

### Deployment Success
- [ ] Feature deployed without errors
- [ ] All tests passing
- [ ] No critical bugs
- [ ] Performance acceptable
- [ ] Monitoring set up

### Feature Success (Post-Deployment)
- [ ] Users can submit bug reports
- [ ] Screenshots captured successfully (>90%)
- [ ] Console logs captured successfully (>95%)
- [ ] Submissions successful (>98%)
- [ ] No critical errors

---

## Next Steps

1. Complete deployment
2. Monitor metrics
3. Fix any issues
4. Proceed to P10 (Validation)

