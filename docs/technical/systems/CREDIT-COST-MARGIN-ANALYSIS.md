# Credit System - Cost & Margin Analysis

> **Goal**: Price credits to achieve sustainable margins while offering competitive value.
> **Standard**: **1 Credit = $0.001 USD** (Retail Value).

---

## 1. The Standard: 1 Credit = $0.001

We have standardized the credit unit to a simple monetary equivalent:

- **1,000 Credits = $1.00**
- **100 Credits = $0.10**
- **10 Credits = $0.01**

This makes it incredibly easy for users to understand value ("I have $30 worth of credits") and for us to price granular features (like fast images) without using fractional credits.

---

## 2. Infrastructure Costs (Reality)

### GPU Hourly Rates (RunPod)

- **RTX 4090**: $0.69/hr = **$0.000192/sec**

### Feature Costs (Measured)

| Operation                   | Time | GPU Cost    |
| --------------------------- | ---- | ----------- |
| **Studio Fast (1 img)**     | ~6s  | **$0.0012** |
| **Studio Standard (1 img)** | ~15s | **$0.0030** |
| **Base Images (3 imgs)**    | ~30s | **$0.0060** |
| **Profile Set (8 imgs)**    | ~60s | **$0.0115** |
| **Fal Flux Dev (External)** | API  | **$0.0250** |
| **Fal Schnell (External)**  | API  | **$0.0030** |

---

## 3. Pricing & Margin Analysis

We strive for a **5x Margin** on self-hosted features (high volume) and a **2x-3x Margin** on external API features (pass-through costs).

| Feature                   | Actual Cost | Credit Price    | Retail Price | Margin   |
| :------------------------ | :---------- | :-------------- | :----------- | :------- |
| **Studio Fast**           | $0.0012     | **5 Credits**   | $0.005       | **4.2x** |
| **Studio Standard**       | $0.0030     | **15 Credits**  | $0.015       | **5.0x** |
| **Studio Batch (4)**      | $0.0050     | **20 Credits**  | $0.020       | **4.0x** |
| **Inpaint**               | $0.0020     | **10 Credits**  | $0.010       | **5.0x** |
| **Upscale**               | $0.0020     | **10 Credits**  | $0.010       | **5.0x** |
| **Character Base (3)**    | $0.0060     | **30 Credits**  | $0.030       | **5.0x** |
| **Profile Set (Fast)**    | $0.0115     | **50 Credits**  | $0.050       | **4.3x** |
| **Profile Set (Quality)** | $0.0170     | **100 Credits** | $0.100       | **5.9x** |
| **Fal Flux Schnell**      | $0.0030     | **10 Credits**  | $0.010       | **3.3x** |
| **Fal Flux Dev**          | $0.0250     | **50 Credits**  | $0.050       | **2.0x** |
| **Fal Pro/Ultra**         | ~$0.0600    | **150 Credits** | $0.150       | **2.5x** |

_Note: External models (Fal) have lower margins to remain competitive with direct API pricing, while self-hosted models drive the meaningful revenue._

---

## 4. Subscription Plans

Subscriptions offer "Wholesale" purchasing power compared to one-time packages.

| Plan          | Price  | Monthly Credits | Effective Value     |
| :------------ | :----- | :-------------- | :------------------ |
| **Free**      | $0     | **500**         | $0.50 (Trial)       |
| **Starter**   | $29/mo | **30,000**      | $30.00 (100% Value) |
| **Pro**       | $49/mo | **60,000**      | $60.00 (122% Value) |
| **Unlimited** | $99/mo | **∞**           | N/A                 |

**Pro Plan Advantage:**
The Pro plan offers **60,000 credits** for $49.

- If bought as packages: $50 gets you 50,000 credits.
- Subscription bonus: **+20% extra credits** (10,000 free credits).

---

## 5. Credit Packages (One-Time)

Packages are priced to be fair but encourage subscriptions.

| Package     | Price  | Credits     | Cost/Credit | Buying Power (Flux Dev) |
| :---------- | :----- | :---------- | :---------- | :---------------------- |
| **Refill**  | $9.99  | **8,000**   | $0.00125    | 160 images              |
| **Popular** | $24.99 | **22,000**  | $0.00114    | 440 images              |
| **Studio**  | $49.99 | **50,000**  | $0.00100    | 1,000 images            |
| **Whale**   | $99.99 | **110,000** | $0.00091    | 2,200 images            |

---

## Summary

This pricing model solves the "Sticker Shock" of the previous model by ensuring:

1.  **Alignment:** 1 Credit is always ~$0.001. A 50-credit image clearly costs 5 cents.
2.  **Competitiveness:** We are no longer charging $12.00 for a Flux Dev image (previously 1200 credits), but a fair $0.05.
3.  **Profitability:** We maintain strong 4-5x margins on our core self-hosted features.
