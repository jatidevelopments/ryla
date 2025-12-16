# Finby Integration Testing Guide

This guide explains how to test the Finby payment integration in your application.

## Quick Test Script

We've created an automated test script to verify the integration:

```bash
# Using tsx (recommended)
npx tsx scripts/test-finby.ts

# Or using ts-node
npx ts-node scripts/test-finby.ts
```

The script will:
- ✅ Check environment variables
- ✅ Test backend API connection
- ✅ Test payment setup endpoint
- ✅ Test payment status endpoint

## Manual Testing Steps

### 1. Prerequisites

Ensure you have:
- ✅ Backend API running and accessible
- ✅ Finby credentials configured in backend
- ✅ `.env.local` file with all required variables
- ✅ Development server running (`npm run dev`)

### 2. Test Payment Flow

1. **Start the application:**
   ```bash
   npm run dev
   ```

2. **Navigate to the payment step:**
   - Go through the funnel steps
   - Or directly navigate to: `http://localhost:3000?step=payment`

3. **Fill in payment form:**
   - Select a product/subscription
   - Enter email address
   - Fill in billing information (if required)

4. **Submit payment:**
   - Click the payment button
   - The Finby popup should open
   - You should see the payment gateway interface

### 3. Test Card Numbers

According to Finby documentation, you can use these test cards when testing with your testing credentials on the mapi endpoint:

**Successful Payment Cards:**
- `4200 0000 0000 0000` - Payment is successful
- `4200 0000 0000 1234` - Payment is successful
- `4200 0000 0000 5555` - Payment is successful

**Failed Payment Cards:**
- `4200 0000 0000 0001` - Payment fails with result: card expired
- `4200 0000 0000 0002` - Payment fails with result: card limit exceeded
- `4200 0000 0000 0003` - Payment fails with result: failed 3DS authentication
- `4200 0000 0000 0004` - Payment fails with result: insufficient funds
- `4200 0000 0000 0005` - Payment fails with result: invalid CVV
- `4200 0000 0000 0006` - Payment fails with result: invalid expiry date
- `4200 0000 0000 0007` - Payment fails with result: too many invalid tries
- Any other card number - Payment fails with result: invalid card number

**Note:** 
- You can enter any CVV code for testing
- The expiry date can be any date in the future
- These test cards only work with testing credentials on the test environment

### 4. Test Scenarios

#### Successful Payment
1. Complete payment with valid test card
2. Verify redirect to success URL
3. Check that payment status is "paid"
4. Verify analytics events are fired (FB Pixel, Google Ads, etc.)

#### Cancelled Payment
1. Start payment process
2. Cancel/close the popup
3. Verify redirect to cancel URL
4. Check that payment status is "cancelled" or "failed"

#### Failed Payment
1. Use an invalid card or insufficient funds
2. Verify redirect to error URL
3. Check that payment status is "failed"
4. Verify error handling works correctly

### 5. Verify Backend Integration

Check that your backend API:
- ✅ Receives payment setup requests
- ✅ Generates payment URLs with correct signatures
- ✅ Receives notifications from Finby
- ✅ Updates payment status correctly

### 6. Check Finby Merchant Portal

1. Log in to https://merchantportal.finby.eu
2. Navigate to **Transactions**
3. Verify test transactions appear
4. Check transaction statuses and details

## Testing Checklist

- [ ] Environment variables are set correctly
- [ ] Backend API is accessible
- [ ] Payment setup endpoint works
- [ ] Payment status endpoint works
- [ ] Finby popup opens correctly
- [ ] Payment form displays correctly
- [ ] Redirect URLs work (success, cancel, error)
- [ ] Notifications are received by backend
- [ ] Analytics events fire correctly
- [ ] Transactions appear in Finby portal

## Common Issues

### Payment Popup Doesn't Open
- Check browser console for errors
- Verify jQuery and Finby popup.js are loaded
- Check that `useFinbyReady` hook returns `isReady: true`
- Verify iframe with ID `TrustPayFrame` exists

### Backend API Errors
- Verify Finby credentials are correct in backend
- Check backend logs for detailed error messages
- Ensure notification URL is accessible from Finby servers
- Verify API endpoints match expected format

### Payment Status Not Updating
- Check polling mechanism is working
- Verify payment reference is correct
- Check backend payment status endpoint
- Review Finby merchant portal for transaction status

## Debugging Tips

1. **Enable Console Logging:**
   - Check browser console for Finby-related errors
   - Look for network requests to Finby endpoints
   - Verify API calls to your backend

2. **Check Network Tab:**
   - Monitor requests to `/finby/setup-payment`
   - Monitor requests to `/finby/payment-status/:reference`
   - Check for CORS or authentication errors

3. **Backend Logs:**
   - Review backend logs for Finby API calls
   - Check for signature generation errors
   - Verify notification handling

4. **Finby Portal:**
   - Check transaction logs in merchant portal
   - Review notification delivery status
   - Verify redirect URL configuration

## Production Testing

Before going live:
1. ✅ Test with real cards in a staging environment
2. ✅ Verify all redirect URLs work correctly
3. ✅ Test notification handling
4. ✅ Verify analytics tracking
5. ✅ Test error scenarios
6. ✅ Load test the payment flow

## Support

If you encounter issues:
1. Check Finby documentation: https://doc.finby.eu
2. Review Finby merchant portal for error messages
3. Contact Finby support through the merchant portal
4. Check backend API logs for detailed errors

