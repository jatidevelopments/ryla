# Finby Payment Gateway Setup

## Configuration Summary

The Finby payment gateway has been configured with the following settings:

### Credentials
- **Project ID**: `4107517694`
- **Secret Key**: `nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD`

### Redirect URLs
- **Success Return URL**: `https://goviral.ryla.ai`
- **Cancel Return URL**: `https://goviral.ryla.ai`
- **Error Return URL**: `https://goviral.ryla.ai`

### Notifications
- **Notification URL**: `https://devapi.mydreamcompanion.com/finby/notification`
- **Notification Type**: Api version 3

## Environment Variables

### Local Development (.env.local)

Create a `.env.local` file in the project root with the following variables:

```bash
# Finby Payment Gateway Configuration
FINBY_PROJECT_ID=4107517694
FINBY_SECRET_KEY=nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai

# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://devapi.mydreamcompanion.com

# Finby Payment Redirect
NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/

# Test Payment Mode (optional)
# Set to "true" to enable test payment mode (logs test mode indicator)
FINBY_TEST_MODE=false
```

**Note**: The `.env.local` file is gitignored and should not be committed to version control.

**Funnel Payment Protection**: Payment references are automatically prefixed with `RYLAFL-` to ensure refunds only work for payments created through this funnel. The refund endpoint will reject any refund requests for references that don't start with this prefix.

### Fly.io Configuration

Set the following secrets in Fly.io using the `fly secrets set` command:

```bash
# Finby credentials (for backend API)
fly secrets set FINBY_PROJECT_ID=4107517694
fly secrets set FINBY_SECRET_KEY=nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD

# Site configuration
fly secrets set NEXT_PUBLIC_SITE_URL=https://goviral.ryla.ai

# API configuration
fly secrets set NEXT_PUBLIC_API_BASE_URL=https://devapi.mydreamcompanion.com

# Finby payment redirect
fly secrets set NEXT_PUBLIC_FINBY_PAYMENT_REDIRECT=/

# PostHog Analytics (optional)
fly secrets set NEXT_PUBLIC_POSTHOG_KEY=your_posthog_project_api_key
fly secrets set NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com

# Test payment mode (optional)
fly secrets set FINBY_TEST_MODE=false
```

### Backend API Configuration

The Finby credentials need to be configured on the backend API at `https://devapi.mydreamcompanion.com`. The backend uses these credentials to:
- Generate payment gateway URLs with signatures
- Verify payment notifications from Finby
- Check payment status

Ensure the backend has access to:
- `FINBY_PROJECT_ID`: `4107517694`
- `FINBY_SECRET_KEY`: `nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD`

## Merchant Portal Access

- **URL**: https://merchantportal.finby.eu
- **Email**: janistirtey1@gmail.com
- **Password**: (stored securely, not in this file)

## Verification

To verify the configuration:

1. Check that redirect URLs are set correctly in the Finby merchant portal
2. Test a payment flow to ensure redirects work
3. Verify that notifications are being received at the backend endpoint
4. Check that payment status checks are working

## Test Payment Mode

To enable test payment mode for development/testing:

1. Set `FINBY_TEST_MODE=true` in your `.env.local` file
2. Use Finby test card numbers:
   - **Success**: `4200 0000 0000 0000`, `4200 0000 0000 1234`, `4200 0000 0000 5555`
   - **Card Expired**: `4200 0000 0000 0001`
   - **Card Limit Exceeded**: `4200 0000 0000 0002`
   - **Failed 3DS**: `4200 0000 0000 0003`
   - **Insufficient Funds**: `4200 0000 0000 0004`
   - **Invalid CVV**: `4200 0000 0000 0005`
   - **Invalid Expiry**: `4200 0000 0000 0006`
   - **Too Many Tries**: `4200 0000 0000 0007`
   - Any other card number will fail with "invalid card number"

3. You can use any CVV and any future expiry date with test cards

**Note**: Test mode only adds logging. The same Finby API endpoint is used for both test and production. Test cards work automatically when using test credentials in the Finby merchant portal.

## Payment Callback Handling

The payment flow handles Finby redirects through `/payment-callback`:

- **Success (ResultCode 0 or 3)**: User is redirected to "All Spots Reserved" step
- **Cancel (ResultCode 1005)**: User returns to Payment step with cancel message
- **Error (ResultCode >= 1000)**: User returns to Payment step with error message

The callback page processes redirects and navigates to the appropriate step. Payment status is also polled in the background for real-time updates.

## Troubleshooting

If payments are not working:

1. Verify the Project ID and Secret Key are correct
2. Check that redirect URLs are accessible
3. Ensure the notification URL is reachable from Finby's servers
4. Verify the backend API has the correct credentials configured
5. Check Finby merchant portal for any error messages or transaction logs
6. Check browser console for payment callback errors
7. Verify `/payment-callback` page is accessible

