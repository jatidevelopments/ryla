# Finby Subscription Implementation Notes

## Current Status

Based on the Finby API documentation (https://doc.finby.eu/aapi), we've implemented:

1. ✅ **OAuth Authentication** - Using ProjectID/SecretKey to get access tokens
2. ✅ **REST API Integration** - Using `https://aapi.finby.eu` endpoint
3. ⚠️ **Subscription Support** - Implementation ready, but needs verification

## Implementation Details

### OAuth Flow
- Endpoint: `https://aapi.finby.eu/api/oauth2/token`
- Authentication: Basic auth with `ProjectID:SecretKey` (Base64 encoded)
- Token expires in 30 minutes
- Token is cached and auto-refreshed

### Payment Initiation
- Endpoint: `https://aapi.finby.eu/api/Payments/InitiatePayment`
- Uses Bearer token from OAuth
- Request format based on Finby REST API documentation

### Subscription Handling

**Important Note**: The Finby REST API documentation doesn't explicitly show subscription endpoints. We have two approaches:

#### Approach 1: Native Subscriptions (If Supported)
- Use subscription-specific endpoint if available
- Finby handles recurring billing automatically
- Webhooks notify us of renewals

#### Approach 2: Manual Recurring Payments (Fallback)
- Treat subscriptions as one-time monthly payments
- We track subscription status in our database
- User pays again each month (or we send renewal reminders)
- This is what we're currently using as fallback

## Testing Required

To verify subscription support:

1. **Test OAuth Token Generation**
   ```bash
   curl -X POST https://aapi.finby.eu/api/oauth2/token \
     -H "Authorization: Basic $(echo -n 'PROJECT_ID:SECRET_KEY' | base64)" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "grant_type=client_credentials"
   ```
   Use Infisical `/apps/api` or `/shared` for `FINBY_PROJECT_ID` and `FINBY_SECRET_KEY`.

2. **Test Payment Initiation**
   - Try creating a subscription checkout session
   - Check if Finby returns a subscription ID
   - Verify webhook receives subscription events

3. **Check Finby Dashboard**
   - Look for subscription management features
   - Check if there are subscription-specific settings
   - Verify webhook events for subscriptions

## Next Steps

1. **Test the Implementation**
   - Try subscribing to a plan
   - Check logs for API responses
   - Verify OAuth token generation works

2. **Contact Finby Support** (If Needed)
   - Ask about subscription/recurring payment support
   - Request API documentation for subscriptions
   - Verify if additional setup is required

3. **Fallback Plan**
   - If native subscriptions aren't supported, use manual renewals
   - Implement renewal reminder system
   - Track subscription status in our database

## Environment Variables

Use Infisical for credentials (never commit secrets):

- `FINBY_PROJECT_ID` – from Infisical `/apps/api` or `/shared`
- `FINBY_SECRET_KEY` – from Infisical `/apps/api` or `/shared`

The implementation will:
- Use OAuth with these credentials for REST API
- Use v3 popup API for one-time credit purchases
- Attempt to use REST API for subscriptions

## References

- Finby API Docs: https://doc.finby.eu/aapi
- OAuth Endpoint: https://aapi.finby.eu/api/oauth2/token
- Payment Initiation: https://aapi.finby.eu/api/Payments/InitiatePayment
