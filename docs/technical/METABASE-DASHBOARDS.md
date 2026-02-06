# Metabase Dashboards for RYLA (IN-041)

Comprehensive BI dashboards mapped to RYLA's A-E business metrics framework.
Covers 30 of 38 database tables across 10 focused dashboards.

## Design Principles (from Metabase best practices)

1. **Trends over scalars** — KPIs show % change from previous period, not just raw numbers
2. **Top-left = most important** — importance degrades top-to-bottom, left-to-right
3. **Line charts for time series** — bar/row charts for categorical comparisons
4. **Pie/donut only for 2-3 categories** — bar charts for 4+
5. **Precise titles** — "Daily signups (last 30d)" not "Users"
6. **Focused dashboards** — each answers one business question; link between them
7. **30-day default window** — fast loading; users can expand via filters
8. **Negative space** — don't fill every gap; group related cards with text separators
9. **Green = growth, red = alert** — semantic colors for trend arrows
10. **Tables for detail** — with conditional formatting and sorting

## Dashboard Architecture

| # | Dashboard | Metric | Cadence | Tables Used | Cards |
|---|-----------|--------|---------|-------------|-------|
| 1 | **Executive Overview** | A, B, C, D | Daily | users, characters, generation_jobs, subscriptions, user_credits | 8 |
| 2 | **Activation & Onboarding** | A | Daily | users, characters, generation_jobs, images | 6 |
| 3 | **User Growth & Retention** | A, B | Weekly | users, generation_jobs | 6 |
| 4 | **Character Creation** | A | Daily | characters, lora_models, influencer_requests | 7 |
| 5 | **Content Generation** | C | Daily | generation_jobs, images, posts | 8 |
| 6 | **Credits & Economy** | C, D | Weekly | user_credits, credit_transactions | 6 |
| 7 | **Subscriptions & Revenue** | D | Weekly | subscriptions, cards | 7 |
| 8 | **Funnel Analytics** | A, D | Daily | funnel_sessions, funnel_options | 5 |
| 9 | **Content Library** | C | Monthly | templates, template_usage, prompts, prompt_usage, gallery_favorites | 6 |
| 10 | **Operations & Quality** | Ops | Daily | bug_reports, generation_jobs, lora_models, admin_audit_log, feature_flags, notifications | 7 |
| | **Total** | | | **30 / 38 tables** | **66 cards** |

---

## Dashboard 1: Executive Overview

**Purpose**: Single page that answers "how are we doing?" across all business metrics.
**Audience**: Founders, product leads. **Cadence**: Daily check-in.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Total Users | trend | COUNT users, grouped by week |
| Row 1, Col 2 | Active Characters | trend | COUNT characters WHERE status=ready, grouped by week |
| Row 1, Col 3 | Generations (30d) | trend | COUNT generation_jobs last 30d, grouped by week |
| Row 2, Col 1 | Paid Subscribers | trend | COUNT subscriptions WHERE status=active AND tier != free, grouped by week |
| Row 2, Col 2 | MRR Proxy | trend | SUM(tier prices) for active subs, grouped by week |
| Row 2, Col 3 | Generation Success Rate | trend | completed / (completed + failed) last 30d, grouped by week |
| Row 3 | Daily Signups (30d) | line | Daily COUNT users last 30d |
| Row 3 | Daily Generations (30d) | line | Daily COUNT generation_jobs last 30d |

**Business justification**: Every stakeholder needs a single page covering all A-E metrics. This is the "car dashboard" — glance at it daily to know if things are on track. Trend arrows (green/red) immediately surface regressions.

---

## Dashboard 2: Activation & Onboarding

**Purpose**: Track the journey from signup to first value delivery.
**Audience**: Product team. **Cadence**: Daily.
**Key target**: 93% of users are first-timers — if they don't activate, they churn forever.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Activation Rate | scalar | Users with ≥1 character / total users (%) |
| Row 1, Col 2 | Avg Hours to First Character | scalar | AVG hours between signup and first character creation |
| Row 1, Col 3 | Avg Hours to First Generation | scalar | AVG hours between signup and first gen job |
| Row 2 | Activation Funnel | bar | Step counts: Signup → Character → Generation → Post |
| Row 3, Col 1 | Users with 0 Characters | scalar | COUNT users with no characters |
| Row 3, Col 2 | Draft Characters (abandoned wizards) | scalar | COUNT characters WHERE status=draft AND age > 24h |

**Business justification**: Activation (A) is priority #1. If users don't create a character and generate content fast, they churn. This dashboard reveals exactly where users get stuck in the onboarding funnel, and how quickly we deliver first value.

---

## Dashboard 3: User Growth & Retention

**Purpose**: Measure growth velocity and stickiness.
**Audience**: Product + marketing. **Cadence**: Weekly review.
**Key target**: D7 retention >15%.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Weekly Signups | trend | COUNT users per week |
| Row 1, Col 2 | Email Verification Rate | trend | verified / total users (%) per week |
| Row 1, Col 3 | WAU (Weekly Active Users) | trend | DISTINCT users with ≥1 gen job in last 7d, per week |
| Row 2 | Signups Over Time (90d) | line | Daily COUNT users last 90d |
| Row 3, Col 1 | D7 Retention Proxy | line | Users who generated on day 7+ after signup / cohort size, by signup week |
| Row 3, Col 2 | D30 Retention Proxy | line | Users who generated on day 30+ after signup / cohort size, by signup week |

**Business justification**: Retention (B) determines LTV. Our product hypothesis sets D7 >15% as the success criterion. Without this dashboard we literally cannot measure our most critical success metric. WAU tracks core engagement velocity.

---

## Dashboard 4: Character Creation

**Purpose**: Monitor the core product entity and creation pipeline.
**Audience**: Product + engineering. **Cadence**: Daily.
**Key target**: >2 characters per user.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Characters per User (avg) | trend | AVG characters per user, grouped by week |
| Row 1, Col 2 | Character Success Rate | trend | ready / (ready + failed) %, grouped by week |
| Row 1, Col 3 | LoRA Training Success Rate | trend | ready / (ready + failed) lora_models %, grouped by week |
| Row 2, Col 1 | Characters by Status | bar | COUNT by status (draft, generating, ready, failed, training, hd_ready) |
| Row 2, Col 2 | LoRA Models by Training Model | bar | COUNT by training_model (flux, wan, qwen) |
| Row 3 | Character Creation Over Time (30d) | line | Daily COUNT characters last 30d |
| Row 4 | Influencer Requests by Status | table | COUNT by status (pending, approved, rejected, in_review) |

**Business justification**: Characters are the core product entity. Our hypothesis targets >2 characters/user. Character creation failures directly cause churn — a failed wizard = a lost user. LoRA training is a paid Tier 2 feature; failures mean lost revenue and broken trust. Influencer requests track compliance workload.

---

## Dashboard 5: Content Generation

**Purpose**: Monitor the AI generation pipeline — the North Star.
**Audience**: Engineering + product. **Cadence**: Daily.
**Key target**: Generation success rate >95%.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Generation Success Rate (7d) | trend | completed / (completed+failed) last 7d, grouped by day |
| Row 1, Col 2 | Total Generations (7d) | trend | COUNT generation_jobs last 7d, grouped by day |
| Row 1, Col 3 | NSFW Adoption Rate | scalar | COUNT images WHERE nsfw=true / total images (%) |
| Row 2, Col 1 | Jobs by Type | bar | COUNT by type (base_image, character_sheet, image_generation, etc.) last 30d |
| Row 2, Col 2 | Jobs by Provider | bar | COUNT by external_provider (replicate, fal, runpod, modal) last 30d |
| Row 3 | Generation Volume (daily, 30d) | line | Daily COUNT generation_jobs last 30d |
| Row 4, Col 1 | Failed Jobs (last 7d) | table | Recent failures with error, type, provider |
| Row 4, Col 2 | Avg Completion Time by Type (30d) | bar | AVG(completed_at - started_at) grouped by type |

**Business justification**: Core Value (C) — the North Star metric. Success rate must be >95% per MVP criteria. Provider comparison helps optimize cost and reliability. NSFW adoption at 72% validates our primary ICP ("NSFW Natalie"). Failed jobs table enables quick triage.

---

## Dashboard 6: Credits & Economy

**Purpose**: Understand credit flow and identify upgrade opportunities.
**Audience**: Product + business. **Cadence**: Weekly.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Avg Credit Balance | trend | AVG balance from user_credits, grouped by week |
| Row 1, Col 2 | Daily Credit Burn | trend | SUM(negative amount) per day from credit_transactions, grouped by week |
| Row 1, Col 3 | Users at Low Balance (<10) | trend | COUNT where balance < 10, grouped by week |
| Row 2, Col 1 | Credit Spend by Type | bar | SUM(ABS amount) by type from credit_transactions last 30d |
| Row 2, Col 2 | Credit Transactions Over Time (30d) | line | Daily COUNT credit_transactions last 30d |
| Row 3 | Refund & Admin Adjustments (30d) | table | credit_transactions WHERE type IN (refund, admin_adjustment) last 30d |

**Business justification**: Credits are the conversion lever (D). Understanding spend patterns reveals what users value most. Low-balance users are prime upgrade candidates — this is the trigger for paywall visibility. Refund volume indicates quality cost.

---

## Dashboard 7: Subscriptions & Revenue

**Purpose**: Track revenue, tier distribution, and churn signals.
**Audience**: Founders + business. **Cadence**: Weekly.
**Key insight**: Validates the $29/$49/$99 pricing hypothesis.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Active Paid Subscribers | trend | COUNT WHERE status=active AND tier != free, grouped by week |
| Row 1, Col 2 | MRR Proxy ($) | trend | SUM(tier prices) for active subs, grouped by week |
| Row 1, Col 3 | Pending Cancellations | trend | COUNT WHERE cancel_at_period_end=true, grouped by week |
| Row 2, Col 1 | Subscriptions by Tier | bar | COUNT by tier for status=active |
| Row 2, Col 2 | Subscription Status Breakdown | bar | COUNT by status (active, cancelled, expired, past_due) |
| Row 3 | New Subscriptions Over Time (30d) | line | Daily COUNT subscriptions created last 30d |
| Row 4 | Free vs Paid User Split | pie | Users with paid sub vs without |

**Business justification**: Conversion (D) and revenue. MRR is the most important business metric for sustainability. Churn rate and pending cancellations give lead time to intervene (retention campaigns, feature improvements). Free-to-paid split directly validates pricing hypothesis.

---

## Dashboard 8: Funnel Analytics

**Purpose**: Measure acquisition funnel (goviral.ryla.ai) effectiveness.
**Audience**: Marketing + product. **Cadence**: Daily.
**Key insight**: 81% drop-off at payment was identified in user research.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Funnel Sessions (30d) | trend | COUNT funnel_sessions last 30d, grouped by week |
| Row 1, Col 2 | Email Capture Rate | trend | Sessions with email / total (%), grouped by week |
| Row 1, Col 3 | Waitlist Signups | trend | COUNT WHERE on_waitlist=true, grouped by week |
| Row 2 | Sessions by Step Reached | bar | COUNT grouped by current_step |
| Row 3 | Most Selected Options | table | Top option_key + option_value combinations by count |

**Business justification**: The funnel is our primary acquisition channel. 81% drop-off at payment was identified in research — we need real-time visibility to validate whether UX changes improve conversion. Step distribution reveals exactly where users abandon. Option analysis shows what users want before they even sign up, informing product decisions.

---

## Dashboard 9: Content Library

**Purpose**: Understand which templates and prompts resonate with users.
**Audience**: Content + product. **Cadence**: Monthly review.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Top 10 Templates by Usage | row | Top 10 templates ORDER BY usage_count DESC |
| Row 1, Col 2 | Top 10 Prompts by Usage | row | Top 10 prompts ORDER BY usage_count DESC |
| Row 2, Col 1 | Template Success Rate (avg) | trend | AVG success_rate from templates, grouped by month |
| Row 2, Col 2 | Curated vs User Templates | pie | COUNT by is_curated (true/false) |
| Row 3, Col 1 | Gallery Favorites by Type | bar | COUNT by item_type (pose, style, scene, lighting, outfit, object) |
| Row 3, Col 2 | Template Sets by Content Type | bar | COUNT by content_type (image, video, lip_sync, audio, mixed) |

**Business justification**: Templates and prompts make generation repeatable and high-quality. Understanding which succeed helps us curate better content, directly improving Core Value (C). Gallery favorites reveal feature preferences for roadmap prioritization. Content type distribution shows where to invest next (video, lip sync, etc.).

---

## Dashboard 10: Operations & Quality

**Purpose**: Surface infrastructure problems before they cause user-facing impact.
**Audience**: Engineering. **Cadence**: Daily.

| Position | Card | Type | Query Summary |
|----------|------|------|---------------|
| Row 1, Col 1 | Open Bug Reports | trend | COUNT WHERE status=open, grouped by week |
| Row 1, Col 2 | Generation Failure Rate (7d) | trend | failed / total jobs last 7d (%), grouped by day |
| Row 1, Col 3 | LoRA Training Failure Rate (7d) | trend | failed / total lora_models last 7d (%) |
| Row 2, Col 1 | Top Failure Errors (7d) | table | Most common error messages from generation_jobs last 7d |
| Row 2, Col 2 | Bug Reports by Status | bar | COUNT by status (open, in_progress, resolved, closed) |
| Row 3, Col 1 | Active Feature Flags | table | LIST of enabled feature_flags |
| Row 3, Col 2 | Recent Admin Actions (24h) | table | Last 20 admin_audit_log entries |

**Business justification**: Operations visibility prevents silent failures. If generation failure rate creeps above 5%, users churn immediately. Bug report backlog indicates support capacity. Feature flags show what's being tested and rolled out. Admin audit log provides operations transparency and security.

---

## Collection Structure

```
RYLA (collection) — clean view, dashboards only
├── 📊 Executive Overview
├── 📊 Activation & Onboarding
├── 📊 User Growth & Retention
├── 📊 Character Creation
├── 📊 Content Generation
├── 📊 Credits & Economy
├── 📊 Subscriptions & Revenue
├── 📊 Funnel Analytics
├── 📊 Content Library
├── 📊 Operations & Quality
└── 📁 Questions (sub-collection) — all 66+ cards/questions stored here
    ├── Total Users
    ├── Active Characters
    ├── ... (all individual SQL cards)
```

Cards are separated from dashboards so the RYLA root stays clean. Dashboards reference cards by ID, so moving cards to a sub-collection doesn't break anything.

## Table Coverage

| Domain | Tables | Covered | Missing (intentional) |
|--------|--------|---------|----------------------|
| User Management | 4 | 3/4 | admin_sessions (low-level) |
| Characters | 4 | 4/4 | — |
| Content Generation | 7 | 6/7 | prompt_favorites (minor) |
| Templates | 8 | 5/8 | template_tags, tag_assignments, set_members (junction tables) |
| Credits & Billing | 4 | 4/4 | — |
| Notifications | 2 | 1/2 | broadcast_notifications (admin-only) |
| Admin Operations | 4 | 3/4 | system_config_history (low-level) |
| Funnel | 2 | 2/2 | — |
| Other | 3 | 2/3 | outfit_presets (minor) |
| **Total** | **38** | **30** | 8 intentionally excluded |

## Running the Setup

```bash
# Ensure Metabase is running
pnpm nx serve metabase

# Run dashboard setup (creates all 10 dashboards)
infisical run --path=/mcp --env=dev -- pnpm tsx scripts/setup/metabase-setup-dashboards.ts
```

## API Key & Infisical

1. **Create API key**: Metabase → Settings → Admin → API Keys
2. **Store in Infisical**:
   ```bash
   infisical secrets set METABASE_URL=http://localhost:3040 --path=/mcp --env=dev
   infisical secrets set METABASE_API_KEY='your-key' --path=/mcp --env=dev
   ```

See [METABASE-SETUP.md](./METABASE-SETUP.md) for full setup guide.
