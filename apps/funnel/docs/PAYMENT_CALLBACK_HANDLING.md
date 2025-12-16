# Payment Callback and Error Handling

## Overview

The payment flow now properly handles Finby payment redirects and errors, ensuring users are navigated to the correct step based on payment outcome.

## Payment Callback Flow

### 1. Payment Setup
When a user initiates payment:
- Payment URL is generated with callback URLs pointing to `/payment-callback`
- ReturnUrl, CancelUrl, and ErrorUrl all point to the same callback page
- NotificationUrl points to `/api/finby/notification` for webhook notifications

### 2. Payment Processing
Two methods track payment status:
- **Polling**: Background polling checks payment status every 2 seconds
- **Callback**: If user is redirected by Finby, the callback page processes the result

### 3. Callback Handling (`/payment-callback`)

The callback page receives Finby redirects with these URL parameters:
- `Reference`: Payment reference ID
- `ResultCode`: Payment result code
- `PaymentRequestId`: Finby payment request ID (optional)

**Result Code Handling:**
- **Success (0 or 3)**: Navigate to "All Spots Reserved" step
- **Cancel (1005)**: Return to Payment step with cancel message
- **Error (>= 1000, != 1005)**: Return to Payment step with specific error message
- **Pending/Other**: Return to Payment step with processing message

### 4. Error Handling

**Payment Step Error Handling:**
- On payment failure, user **stays on Payment step** (does not navigate away)
- Error message is displayed via toast notification
- User can retry payment immediately

**Callback Error Handling:**
- Error messages are stored in `localStorage` as `finby_payment_error`
- PaymentFormStep checks for errors on mount and displays them
- User is returned to Payment step to retry

## Test Payment Mode

### Enabling Test Mode

Add to `.env.local`:
```bash
FINBY_TEST_MODE=true
```

### Test Cards

Use these test card numbers with Finby:

| Card Number | Result |
|------------|--------|
| `4200 0000 0000 0000` | ✅ Payment successful |
| `4200 0000 0000 1234` | ✅ Payment successful |
| `4200 0000 0000 5555` | ✅ Payment successful |
| `4200 0000 0000 0001` | ❌ Card expired |
| `4200 0000 0000 0002` | ❌ Card limit exceeded |
| `4200 0000 0000 0003` | ❌ Failed 3DS authentication |
| `4200 0000 0000 0004` | ❌ Insufficient funds |
| `4200 0000 0000 0005` | ❌ Invalid CVV |
| `4200 0000 0000 0006` | ❌ Invalid expiry date |
| `4200 0000 0000 0007` | ❌ Too many invalid tries |
| Any other number | ❌ Invalid card number |

**Note**: You can use any CVV and any future expiry date with test cards.

## Flow Diagram

```
User clicks "Complete Payment"
    ↓
Payment URL generated with callback URLs
    ↓
Finby popup opens
    ↓
User completes/cancels/fails payment
    ↓
┌─────────────────────────────────────┐
│  Two parallel paths:                │
│  1. Polling (background)           │
│  2. Finby redirect (callback page)  │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Success (ResultCode 0 or 3)        │
│  → Navigate to "All Spots Reserved" │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Cancel (ResultCode 1005)           │
│  → Return to Payment step           │
│  → Show cancel message              │
└─────────────────────────────────────┘
    ↓
┌─────────────────────────────────────┐
│  Error (ResultCode >= 1000)         │
│  → Return to Payment step           │
│  → Show error message               │
│  → User can retry                   │
└─────────────────────────────────────┘
```

## Step Persistence

The payment flow now saves and restores the user's step position:

1. **Before Payment**: Current step is saved to `localStorage` as `finby_payment_previous_step`
2. **On Success**: Previous step is cleared, user navigates to "All Spots Reserved" step
3. **On Error/Cancel**: Previous step is restored, user returns to where they were before payment
4. **Expiration**: Saved step data expires after 30 minutes to prevent stale data

This ensures users don't lose their progress if payment fails or is cancelled.

## Key Features

✅ **Error Recovery**: Users stay on Payment step on error and can retry
✅ **Success Navigation**: Successful payments navigate to "All Spots Reserved" step
✅ **Step Restoration**: On error/cancel, users return to their previous step
✅ **Dual Tracking**: Both polling and callback handle payment status
✅ **Test Mode**: Environment variable enables test payment mode
✅ **User-Friendly**: Clear error messages guide users to retry

## Environment Variables

```bash
# Test Payment Mode (optional)
FINBY_TEST_MODE=false  # Set to "true" to enable test mode logging

# Site URL (required for callback URLs)
NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai
```

