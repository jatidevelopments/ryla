# Finby Payment Gateway Setup Instructions

## ✅ Credentials Already Provided

You've provided the following credentials (already configured):

- `FINBY_PROJECT_ID=4107517694`
- `FINBY_SECRET_KEY=nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD`
- `FINBY_REFERENCE_SECRET=8iJ6BaWwT#$7b$@#5Yw4&6fFChx9&P2` (Note: This may not be needed for our implementation)

## 🔍 Credentials You Need to Get from Finby Dashboard

### Step 1: Log into Finby Dashboard

Go to: https://finby.eu/dashboard

### Step 2: Get API v1 Credentials (for Subscriptions)

These are needed for subscription purchases:

1. **FINBY_API_KEY**

   - Location: Finby Dashboard > API Settings > API v1
   - Look for "API Key" or "Access Key"
   - Copy the value

2. **FINBY_MERCHANT_ID**

   - Location: Finby Dashboard > API Settings > API v1
   - Look for "Merchant ID" or "Account ID"
   - Copy the value

3. **FINBY_WEBHOOK_SECRET**
   - Location: Finby Dashboard > Webhooks > Settings
   - Create a webhook endpoint if you haven't already
   - Set webhook URL to: `https://app.ryla.ai/api/finby/webhook` (production) or `http://localhost:3000/api/finby/webhook` (development)
   - Copy the webhook secret

### Step 3: Verify API v3 Credentials

Your API v3 credentials are already set:

- ✅ `FINBY_PROJECT_ID=4107517694`
- ✅ `FINBY_SECRET_KEY=nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD`

Verify these match what's in your Finby Dashboard > API Settings > API v3

## 📝 Complete Environment File Template

Once you have the API v1 credentials, add them to `apps/web/.env.local`:

```bash
# API v1 (Subscriptions)
FINBY_API_KEY=your_api_key_here
FINBY_MERCHANT_ID=your_merchant_id_here
FINBY_WEBHOOK_SECRET=your_webhook_secret_here

# API v3 (One-time payments) - ✅ Already set
FINBY_PROJECT_ID=4107517694
FINBY_SECRET_KEY=nMxn8N6ome6gGR2mpZcc3KdUGCZX5WzD

# Site URL
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Development
# NEXT_PUBLIC_SITE_URL=https://app.ryla.ai  # Production
```

## 🔗 Webhook Configuration

**Important:** Configure the webhook URL in Finby Dashboard:

1. Go to Finby Dashboard > Webhooks
2. Add webhook endpoint:
   - **Development:** `http://localhost:3000/api/finby/webhook`
   - **Production:** `https://app.ryla.ai/api/finby/webhook`
3. Select events to listen for:
   - `payment.succeeded`
   - `payment.failed`
   - `subscription.created`
   - `subscription.updated`
   - `subscription.cancelled`
4. Save the webhook secret and add it to `FINBY_WEBHOOK_SECRET`

## ✅ Quick Checklist

- [ ] Get `FINBY_API_KEY` from Finby Dashboard
- [ ] Get `FINBY_MERCHANT_ID` from Finby Dashboard
- [ ] Configure webhook URL in Finby Dashboard
- [ ] Get `FINBY_WEBHOOK_SECRET` from Finby Dashboard
- [ ] Add all credentials to `apps/web/.env.local`
- [ ] Verify `FINBY_PROJECT_ID` and `FINBY_SECRET_KEY` match dashboard
- [ ] Test payment flow in development

## 🧪 Testing

After setting up credentials:

1. Start the web app: `pnpm nx serve web`
2. Navigate to `/buy-credits` or `/pricing`
3. Try purchasing credits or subscribing
4. Check webhook logs in Finby Dashboard
5. Verify credits are granted in the app

## 📞 Support

If you can't find these credentials:

- Check Finby Dashboard > API Settings
- Contact Finby support: https://finby.eu/support
- Review Finby documentation: https://doc.finby.eu/
