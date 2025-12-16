# URL-Based Step Navigation

## Overview

The funnel now uses URL parameters as the source of truth for step navigation. The step index is stored in the URL parameter `?step=N` where N is the step index (0-based).

## How It Works

### URL Parameter Format

- **Format**: `?step=34` (step index as number)
- **Example**: `https://goviral.ryla.ai/?step=34` (Payment step)
- **Backward Compatibility**: `?step=payment` still works and maps to Payment step index

### Step Flow

1. **On Page Load**:
   - Reads `step` parameter from URL
   - If present and valid, navigates to that step
   - If missing, uses saved step from localStorage or defaults to step 0
   - Updates URL to include step parameter

2. **On Step Change**:
   - Step changes automatically update the URL parameter
   - URL always reflects the current step
   - Uses `router.replace()` to avoid cluttering browser history

3. **On Payment Callback**:
   - Success: Navigates to `/?step=35` (All Spots Reserved)
   - Error/Cancel: Navigates to `/?step=33` (Subscription, previous step)

## Implementation Details

### URL Sync

The URL is automatically synced with step changes via two mechanisms:

1. **FunnelView (`features/funnel/index.tsx`)**:
   - Watches `stepper.value` changes
   - Updates URL parameter when step changes
   - Reads URL parameter on mount and navigates accordingly

2. **useFunnelForm (`features/funnel/hooks/useFunnelForm.tsx`)**:
   - Reads URL parameter on initialization (prioritizes URL over localStorage)
   - Falls back to localStorage if no URL parameter

### Step Persistence

Steps are persisted in two places:

1. **URL Parameter** (Primary Source of Truth):
   - `?step=34` - Always reflects current step
   - Updated automatically on step changes
   - Used for navigation and restoration

2. **localStorage** (Backup):
   - Stored in `funnel-storage` via Zustand persist
   - Used as fallback if URL parameter is missing
   - Also used for form data persistence

### Payment Callback Handling

When returning from Finby payment:

1. **Success**: 
   - URL: `/?step=35` (All Spots Reserved step)
   - Clears previous step data

2. **Error/Cancel**:
   - URL: `/?step=33` (Subscription step, or previous step)
   - Restores user to step before payment
   - Shows error message

## Benefits

✅ **Shareable URLs**: Users can share direct links to specific steps
✅ **Browser Navigation**: Back/forward buttons work correctly
✅ **Bookmarkable**: Users can bookmark their progress
✅ **Refresh-Safe**: Refreshing page maintains current step
✅ **Payment Callback**: Returning from payment lands on correct step
✅ **URL as Source of Truth**: Step is always reflected in URL

## Examples

### Direct Step Access

```
https://goviral.ryla.ai/?step=0   → Step 0 (Choose Creation Method)
https://goviral.ryla.ai/?step=33  → Step 33 (Subscription)
https://goviral.ryla.ai/?step=34  → Step 34 (Payment)
https://goviral.ryla.ai/?step=35  → Step 35 (All Spots Reserved)
```

### Payment Flow

1. User on Subscription step (33) → URL: `/?step=33`
2. User clicks "Complete Payment" → Step saved, URL: `/?step=34`
3. User redirected to Finby → Payment gateway
4. **On Success**: Callback → URL: `/?step=35` (All Spots Reserved)
5. **On Error**: Callback → URL: `/?step=33` (Subscription, previous step)

## Migration Notes

- Old `?step=payment` parameter is still supported for backward compatibility
- Automatically migrates to step index format (`?step=34`)
- Existing localStorage data is still used as fallback

