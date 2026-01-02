# EP-019 (P8) — Report a Bug: Integration

Working in **PHASE P8 (Integration)** on **EP-019, ST-001-ST-004**.

## Integration Checklist

### Data Layer Integration
- [ ] Database migration applied successfully
- [ ] Schema types exported correctly
- [ ] Repository methods work with database
- [ ] Foreign key constraints work
- [ ] Indexes created and working

### Business Layer Integration
- [ ] Service uses repository correctly
- [ ] Screenshot upload to S3 works
- [ ] Error handling works end-to-end
- [ ] Service methods return correct types

### API Layer Integration
- [ ] tRPC router registered in app router
- [ ] Input validation works
- [ ] Error responses formatted correctly
- [ ] Authentication context works (optional user)
- [ ] Size limits enforced

### Frontend Integration
- [ ] Console log buffer initialized on app startup
- [ ] Bottom nav component updated
- [ ] Modal opens from bottom nav
- [ ] Screenshot capture works
- [ ] Console log capture works
- [ ] Form submission works
- [ ] Success/error states work
- [ ] Analytics events fire

### Storage Integration
- [ ] S3/MinIO bucket accessible
- [ ] Screenshot uploads work
- [ ] Screenshot URLs accessible
- [ ] Storage errors handled gracefully

### Analytics Integration
- [ ] PostHog events fire correctly
- [ ] Event properties correct
- [ ] User ID included when available
- [ ] Events appear in PostHog dashboard

---

## Integration Testing

### End-to-End Flow

1. **User clicks "Report Bug"**
   - Bottom nav item visible ✓
   - Modal opens ✓
   - Screenshot captured ✓
   - Console logs captured ✓

2. **User fills form**
   - Description validation works ✓
   - Email validation works ✓
   - Checkboxes work ✓
   - Submit button enables/disables ✓

3. **User submits**
   - API call made ✓
   - Screenshot uploaded to S3 ✓
   - Bug report created in database ✓
   - Success message shown ✓
   - Modal closes ✓

4. **Analytics**
   - Events fire correctly ✓
   - Properties correct ✓

---

## Integration Issues & Fixes

### Issue: Screenshot Upload Fails

**Symptoms:**
- Bug report created but screenshot_url is null
- Error in console about S3 upload

**Fix:**
- Verify S3 credentials
- Check bucket permissions
- Verify file size limits
- Add retry logic if needed

### Issue: Console Log Buffer Not Initialized

**Symptoms:**
- No console logs captured
- Empty log array in bug report

**Fix:**
- Verify `initConsoleLogBuffer()` called in root layout
- Check import path
- Verify buffer starts before any logs

### Issue: Modal Doesn't Open

**Symptoms:**
- Click on "Report Bug" does nothing
- Modal state not updating

**Fix:**
- Check state management
- Verify event handler attached
- Check for JavaScript errors
- Verify modal component imported

### Issue: tRPC Router Not Found

**Symptoms:**
- 404 error on API call
- Router not registered

**Fix:**
- Verify router exported from routers/index.ts
- Verify router added to appRouter
- Check route path matches client call
- Restart dev server

### Issue: Database Migration Fails

**Symptoms:**
- Migration error on run
- Table not created

**Fix:**
- Check SQL syntax
- Verify database connection
- Check for existing table
- Verify enum types supported

---

## Performance Integration

### Screenshot Capture Performance
- [ ] Capture time acceptable (< 2s)
- [ ] File size reasonable (< 500KB)
- [ ] Memory usage acceptable
- [ ] No UI freezing

### Console Log Buffer Performance
- [ ] Buffer size limited (200 entries)
- [ ] Filtering doesn't slow down
- [ ] Memory usage acceptable
- [ ] No performance degradation over time

### Submission Performance
- [ ] Submission time acceptable (< 5s)
- [ ] Screenshot upload time acceptable
- [ ] Database write time acceptable
- [ ] No UI freezing during submission

---

## Security Integration

### Sensitive Data Filtering
- [ ] JWT tokens filtered from logs
- [ ] API keys filtered from logs
- [ ] Passwords filtered from logs
- [ ] Email addresses in suspicious context filtered

### Input Validation
- [ ] Description length validated (frontend + backend)
- [ ] Email format validated (frontend + backend)
- [ ] Screenshot size limited (frontend + backend)
- [ ] Console logs size limited (frontend + backend)
- [ ] SQL injection prevented (Drizzle)

### Authentication
- [ ] Anonymous submissions work
- [ ] Authenticated submissions include user_id
- [ ] User can only see their own bug reports (if list endpoint added)

---

## Monitoring Integration

### Error Tracking
- [ ] Screenshot capture errors logged
- [ ] Console log capture errors logged
- [ ] Submission errors logged
- [ ] Storage errors logged
- [ ] Database errors logged

### Metrics
- [ ] Bug report submission rate tracked
- [ ] Screenshot capture success rate tracked
- [ ] Console log capture success rate tracked
- [ ] Average submission time tracked
- [ ] Error rate tracked

---

## Documentation Integration

### Code Documentation
- [ ] Functions documented
- [ ] Types documented
- [ ] Complex logic commented
- [ ] README updated if needed

### User Documentation
- [ ] Feature documented (if user-facing docs exist)
- [ ] Support team notified (if applicable)

---

## Deployment Readiness

### Pre-Deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] No linting errors
- [ ] Database migration ready
- [ ] Environment variables set
- [ ] S3 bucket configured
- [ ] Analytics configured

### Deployment Steps
1. Run database migration
2. Deploy backend changes
3. Deploy frontend changes
4. Verify feature works in production
5. Monitor for errors

---

## Rollback Plan

### If Issues Found
1. **Database**: Migration can be rolled back (if reversible)
2. **Backend**: Revert API changes
3. **Frontend**: Revert UI changes
4. **Feature Flag**: Consider feature flag for gradual rollout

### Rollback Steps
1. Revert code changes
2. Rollback database migration (if needed)
3. Redeploy
4. Verify rollback successful

---

## Next Steps

1. Complete integration testing
2. Fix any integration issues
3. Verify performance
4. Verify security
5. Complete deployment readiness
6. Proceed to P9 (Deployment)

