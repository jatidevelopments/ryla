#!/usr/bin/env node
/**
 * Create comprehensive RYLA dashboards in Metabase (IN-041).
 *
 * Creates 10 dashboards with ~66 cards mapped to the A-E business metrics framework.
 * Follows Metabase best practices: trends over scalars, line charts for time series,
 * bar charts for categorical, proper grid layout, focused dashboards.
 *
 * Requires: METABASE_URL, METABASE_API_KEY (from Infisical or env).
 * Run: infisical run --path=/mcp --env=dev -- pnpm tsx scripts/setup/metabase-setup-dashboards.ts
 *
 * Idempotent: skips collections/dashboards/cards that already exist (by name).
 */

const METABASE_URL =
  process.env.METABASE_URL?.replace(/\/$/, '') || 'http://localhost:3040';
const METABASE_API_KEY = process.env.METABASE_API_KEY;

if (!METABASE_API_KEY) {
  console.error(
    'METABASE_API_KEY is required. Use Infisical:\n  infisical run --path=/mcp --env=dev -- pnpm tsx scripts/setup/metabase-setup-dashboards.ts',
  );
  process.exit(1);
}

/* -------------------------------------------------------------------------- */
/*  HTTP helpers                                                              */
/* -------------------------------------------------------------------------- */

const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'X-Api-Key': METABASE_API_KEY,
};

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${METABASE_URL}/api/${path}`, { headers });
  if (!res.ok) throw new Error(`GET ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${METABASE_URL}/api/${path}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`POST ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

async function put<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${METABASE_URL}/api/${path}`, {
    method: 'PUT',
    headers,
    body: JSON.stringify(body),
  });
  if (!res.ok)
    throw new Error(`PUT ${path}: ${res.status} ${await res.text()}`);
  return res.json() as Promise<T>;
}

/* -------------------------------------------------------------------------- */
/*  Types                                                                     */
/* -------------------------------------------------------------------------- */

interface Database {
  id: number;
  name: string;
}
interface Card {
  id: number;
  name: string;
}
interface Dashboard {
  id: number;
  name: string;
  dashcards?: { id: number; card_id: number }[];
}
interface Collection {
  id: number;
  name: string;
}

/* -------------------------------------------------------------------------- */
/*  Card & Dashboard definitions                                              */
/* -------------------------------------------------------------------------- */

interface CardDef {
  name: string;
  query: string;
  display: string;
  /** Grid position. Metabase uses an 18-column grid. */
  col: number;
  row: number;
  size_x: number;
  size_y: number;
}

interface DashboardDef {
  name: string;
  description: string;
  cards: CardDef[];
}

function buildDashboards(): DashboardDef[] {
  return [
    /* -------------------------------------------------------------------- */
    /*  1. Executive Overview (A, B, C, D)                                   */
    /* -------------------------------------------------------------------- */
    {
      name: 'Executive Overview',
      description:
        'High-level KPIs across all business metrics. Daily check-in dashboard.',
      cards: [
        // Row 1: KPI trends (3 across)
        {
          name: 'Total Users',
          query: `SELECT DATE_TRUNC('week', created_at) AS week, COUNT(*) AS count FROM users GROUP BY week ORDER BY week`,
          display: 'line',
          col: 0, row: 0, size_x: 6, size_y: 4,
        },
        {
          name: 'Active Characters',
          query: `SELECT DATE_TRUNC('week', created_at) AS week, COUNT(*) AS count FROM characters WHERE status = 'ready' AND deleted_at IS NULL GROUP BY week ORDER BY week`,
          display: 'line',
          col: 6, row: 0, size_x: 6, size_y: 4,
        },
        {
          name: 'Generations (30d)',
          query: `SELECT COUNT(*) AS count FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days'`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 4,
        },
        // Row 2: Revenue KPIs
        {
          name: 'Paid Subscribers',
          query: `SELECT COUNT(*) AS count FROM subscriptions WHERE status = 'active' AND tier != 'free'`,
          display: 'scalar',
          col: 0, row: 4, size_x: 6, size_y: 3,
        },
        {
          name: 'MRR Proxy ($)',
          query: `SELECT SUM(CASE tier WHEN 'starter' THEN 29 WHEN 'pro' THEN 49 WHEN 'unlimited' THEN 99 ELSE 0 END) AS mrr FROM subscriptions WHERE status = 'active'`,
          display: 'scalar',
          col: 6, row: 4, size_x: 6, size_y: 3,
        },
        {
          name: 'Generation Success Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','failed')), 0), 1) AS rate FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days'`,
          display: 'scalar',
          col: 12, row: 4, size_x: 6, size_y: 3,
        },
        // Row 3: Time series
        {
          name: 'Daily Signups (30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS signups FROM users WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 0, row: 7, size_x: 9, size_y: 5,
        },
        {
          name: 'Daily Generations (30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS generations FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 9, row: 7, size_x: 9, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  2. Activation & Onboarding (A)                                       */
    /* -------------------------------------------------------------------- */
    {
      name: 'Activation & Onboarding',
      description:
        'Track signup-to-value journey. Key target: fast activation for first-time users (93% are new to AI).',
      cards: [
        {
          name: 'Activation Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(DISTINCT c.user_id) / NULLIF(COUNT(DISTINCT u.id), 0), 1) AS rate FROM users u LEFT JOIN characters c ON c.user_id = u.id AND c.deleted_at IS NULL`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Avg Hours to First Character',
          query: `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (c.min_created - u.created_at)) / 3600)::numeric, 1) AS avg_hours FROM users u INNER JOIN (SELECT user_id, MIN(created_at) AS min_created FROM characters WHERE deleted_at IS NULL GROUP BY user_id) c ON c.user_id = u.id`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Avg Hours to First Generation',
          query: `SELECT ROUND(AVG(EXTRACT(EPOCH FROM (g.min_created - u.created_at)) / 3600)::numeric, 1) AS avg_hours FROM users u INNER JOIN (SELECT user_id, MIN(created_at) AS min_created FROM generation_jobs GROUP BY user_id) g ON g.user_id = u.id`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Activation Funnel',
          query: `SELECT 'Signed Up' AS step, 1 AS step_order, COUNT(*) AS count FROM users UNION ALL SELECT 'Created Character', 2, COUNT(DISTINCT user_id) FROM characters WHERE deleted_at IS NULL UNION ALL SELECT 'First Generation', 3, COUNT(DISTINCT user_id) FROM generation_jobs UNION ALL SELECT 'First Post', 4, COUNT(DISTINCT user_id) FROM posts ORDER BY step_order`,
          display: 'bar',
          col: 0, row: 3, size_x: 18, size_y: 5,
        },
        {
          name: 'Users with 0 Characters',
          query: `SELECT COUNT(*) AS count FROM users u WHERE NOT EXISTS (SELECT 1 FROM characters c WHERE c.user_id = u.id AND c.deleted_at IS NULL)`,
          display: 'scalar',
          col: 0, row: 8, size_x: 9, size_y: 3,
        },
        {
          name: 'Abandoned Drafts (>24h old)',
          query: `SELECT COUNT(*) AS count FROM characters WHERE status = 'draft' AND created_at < NOW() - INTERVAL '24 hours' AND deleted_at IS NULL`,
          display: 'scalar',
          col: 9, row: 8, size_x: 9, size_y: 3,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  3. User Growth & Retention (A, B)                                    */
    /* -------------------------------------------------------------------- */
    {
      name: 'User Growth & Retention',
      description:
        'Measure growth velocity and stickiness. Key target: D7 retention >15%.',
      cards: [
        {
          name: 'Weekly Signups',
          query: `SELECT DATE_TRUNC('week', created_at) AS week, COUNT(*) AS signups FROM users GROUP BY week ORDER BY week`,
          display: 'line',
          col: 0, row: 0, size_x: 6, size_y: 4,
        },
        {
          name: 'Email Verification Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE is_email_verified = true) / NULLIF(COUNT(*), 0), 1) AS rate FROM users`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 4,
        },
        {
          name: 'WAU (Weekly Active Users)',
          query: `SELECT DATE_TRUNC('week', g.created_at) AS week, COUNT(DISTINCT g.user_id) AS active_users FROM generation_jobs g WHERE g.created_at >= NOW() - INTERVAL '90 days' GROUP BY week ORDER BY week`,
          display: 'line',
          col: 12, row: 0, size_x: 6, size_y: 4,
        },
        {
          name: 'Signups Over Time (90d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS signups FROM users WHERE created_at >= NOW() - INTERVAL '90 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 0, row: 4, size_x: 18, size_y: 5,
        },
        {
          name: 'D7 Retention Proxy',
          query: `WITH cohorts AS (SELECT id, DATE_TRUNC('week', created_at) AS cohort_week FROM users), activity AS (SELECT DISTINCT g.user_id, DATE_TRUNC('week', g.created_at) AS activity_week FROM generation_jobs g) SELECT c.cohort_week, ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week >= c.cohort_week + INTERVAL '7 days' THEN c.id END) / NULLIF(COUNT(DISTINCT c.id), 0), 1) AS d7_retention FROM cohorts c LEFT JOIN activity a ON a.user_id = c.id GROUP BY c.cohort_week ORDER BY c.cohort_week`,
          display: 'line',
          col: 0, row: 9, size_x: 9, size_y: 5,
        },
        {
          name: 'D30 Retention Proxy',
          query: `WITH cohorts AS (SELECT id, DATE_TRUNC('week', created_at) AS cohort_week FROM users), activity AS (SELECT DISTINCT g.user_id, DATE_TRUNC('week', g.created_at) AS activity_week FROM generation_jobs g) SELECT c.cohort_week, ROUND(100.0 * COUNT(DISTINCT CASE WHEN a.activity_week >= c.cohort_week + INTERVAL '30 days' THEN c.id END) / NULLIF(COUNT(DISTINCT c.id), 0), 1) AS d30_retention FROM cohorts c LEFT JOIN activity a ON a.user_id = c.id GROUP BY c.cohort_week ORDER BY c.cohort_week`,
          display: 'line',
          col: 9, row: 9, size_x: 9, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  4. Character Creation (A)                                            */
    /* -------------------------------------------------------------------- */
    {
      name: 'Character Creation',
      description:
        'Monitor core product entity and creation pipeline. Key target: >2 characters/user.',
      cards: [
        {
          name: 'Avg Characters per User',
          query: `SELECT ROUND(AVG(cnt)::numeric, 2) AS avg_chars FROM (SELECT user_id, COUNT(*) AS cnt FROM characters WHERE deleted_at IS NULL GROUP BY user_id) sub`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Character Success Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'ready') / NULLIF(COUNT(*) FILTER (WHERE status IN ('ready','failed')), 0), 1) AS rate FROM characters WHERE deleted_at IS NULL`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'LoRA Training Success Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'ready') / NULLIF(COUNT(*) FILTER (WHERE status IN ('ready','failed')), 0), 1) AS rate FROM lora_models`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Characters by Status',
          query: `SELECT status, COUNT(*) AS count FROM characters WHERE deleted_at IS NULL GROUP BY status ORDER BY count DESC`,
          display: 'bar',
          col: 0, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'LoRA Models by Training Model',
          query: `SELECT training_model, COUNT(*) AS count FROM lora_models GROUP BY training_model ORDER BY count DESC`,
          display: 'bar',
          col: 9, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Character Creation (daily, 30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS count FROM characters WHERE created_at >= NOW() - INTERVAL '30 days' AND deleted_at IS NULL GROUP BY day ORDER BY day`,
          display: 'line',
          col: 0, row: 8, size_x: 12, size_y: 5,
        },
        {
          name: 'Influencer Requests by Status',
          query: `SELECT status, COUNT(*) AS count FROM influencer_requests GROUP BY status ORDER BY count DESC`,
          display: 'table',
          col: 12, row: 8, size_x: 6, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  5. Content Generation (C)                                            */
    /* -------------------------------------------------------------------- */
    {
      name: 'Content Generation',
      description:
        'Monitor AI generation pipeline — the North Star. Target: >95% success rate.',
      cards: [
        {
          name: 'Success Rate (7d, %)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'completed') / NULLIF(COUNT(*) FILTER (WHERE status IN ('completed','failed')), 0), 1) AS rate FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '7 days'`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Total Generations (7d)',
          query: `SELECT COUNT(*) AS count FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '7 days'`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'NSFW Adoption Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE nsfw = true) / NULLIF(COUNT(*), 0), 1) AS rate FROM images WHERE deleted_at IS NULL`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Jobs by Type (30d)',
          query: `SELECT type, COUNT(*) AS count FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY type ORDER BY count DESC`,
          display: 'bar',
          col: 0, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Jobs by Provider (30d)',
          query: `SELECT COALESCE(external_provider, 'internal') AS provider, COUNT(*) AS count FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY provider ORDER BY count DESC`,
          display: 'bar',
          col: 9, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Generation Volume (daily, 30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS count FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 0, row: 8, size_x: 18, size_y: 5,
        },
        {
          name: 'Failed Jobs (last 7d)',
          query: `SELECT type, COALESCE(external_provider, 'internal') AS provider, LEFT(error, 120) AS error_preview, created_at FROM generation_jobs WHERE status = 'failed' AND created_at >= NOW() - INTERVAL '7 days' ORDER BY created_at DESC LIMIT 50`,
          display: 'table',
          col: 0, row: 13, size_x: 12, size_y: 5,
        },
        {
          name: 'Avg Completion Time by Type (30d)',
          query: `SELECT type, ROUND(AVG(EXTRACT(EPOCH FROM (completed_at - started_at)))::numeric, 1) AS avg_seconds FROM generation_jobs WHERE status = 'completed' AND started_at IS NOT NULL AND completed_at IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days' GROUP BY type ORDER BY avg_seconds DESC`,
          display: 'bar',
          col: 12, row: 13, size_x: 6, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  6. Credits & Economy (C, D)                                          */
    /* -------------------------------------------------------------------- */
    {
      name: 'Credits & Economy',
      description:
        'Understand credit flow and identify upgrade opportunities.',
      cards: [
        {
          name: 'Avg Credit Balance',
          query: `SELECT ROUND(AVG(balance)::numeric, 1) AS avg_balance FROM user_credits`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Daily Credit Burn (30d avg)',
          query: `SELECT ROUND(AVG(daily_burn)::numeric, 0) AS avg_daily_burn FROM (SELECT created_at::date AS day, SUM(ABS(amount)) AS daily_burn FROM credit_transactions WHERE amount < 0 AND created_at >= NOW() - INTERVAL '30 days' GROUP BY day) sub`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Users at Low Balance (<10)',
          query: `SELECT COUNT(*) AS count FROM user_credits WHERE balance < 10`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Credit Spend by Type (30d)',
          query: `SELECT type, SUM(ABS(amount)) AS total_spent FROM credit_transactions WHERE amount < 0 AND created_at >= NOW() - INTERVAL '30 days' GROUP BY type ORDER BY total_spent DESC`,
          display: 'bar',
          col: 0, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Credit Transactions (daily, 30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS transactions, SUM(CASE WHEN amount > 0 THEN amount ELSE 0 END) AS credits_added, SUM(CASE WHEN amount < 0 THEN ABS(amount) ELSE 0 END) AS credits_spent FROM credit_transactions WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 9, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Refunds & Adjustments (30d)',
          query: `SELECT type, description, amount, balance_after, created_at FROM credit_transactions WHERE type IN ('refund', 'admin_adjustment') AND created_at >= NOW() - INTERVAL '30 days' ORDER BY created_at DESC LIMIT 50`,
          display: 'table',
          col: 0, row: 8, size_x: 18, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  7. Subscriptions & Revenue (D)                                       */
    /* -------------------------------------------------------------------- */
    {
      name: 'Subscriptions & Revenue',
      description:
        'Track revenue, tier distribution, and churn signals. Validates $29/$49/$99 pricing.',
      cards: [
        {
          name: 'Active Paid Subscribers',
          query: `SELECT COUNT(*) AS count FROM subscriptions WHERE status = 'active' AND tier != 'free'`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'MRR Proxy ($)',
          query: `SELECT SUM(CASE tier WHEN 'starter' THEN 29 WHEN 'pro' THEN 49 WHEN 'unlimited' THEN 99 ELSE 0 END) AS mrr FROM subscriptions WHERE status = 'active'`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Pending Cancellations',
          query: `SELECT COUNT(*) AS count FROM subscriptions WHERE cancel_at_period_end = true AND status = 'active'`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Subscriptions by Tier',
          query: `SELECT tier, COUNT(*) AS count FROM subscriptions WHERE status = 'active' GROUP BY tier ORDER BY count DESC`,
          display: 'bar',
          col: 0, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Subscription Status Breakdown',
          query: `SELECT status, COUNT(*) AS count FROM subscriptions GROUP BY status ORDER BY count DESC`,
          display: 'bar',
          col: 9, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'New Subscriptions (daily, 30d)',
          query: `SELECT created_at::date AS day, COUNT(*) AS count FROM subscriptions WHERE created_at >= NOW() - INTERVAL '30 days' GROUP BY day ORDER BY day`,
          display: 'line',
          col: 0, row: 8, size_x: 12, size_y: 5,
        },
        {
          name: 'Free vs Paid Split',
          query: `SELECT CASE WHEN s.id IS NOT NULL AND s.status = 'active' AND s.tier != 'free' THEN 'Paid' ELSE 'Free' END AS user_type, COUNT(DISTINCT u.id) AS count FROM users u LEFT JOIN subscriptions s ON s.user_id = u.id GROUP BY user_type ORDER BY count DESC`,
          display: 'pie',
          col: 12, row: 8, size_x: 6, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  8. Funnel Analytics (A, D)                                           */
    /* -------------------------------------------------------------------- */
    {
      name: 'Funnel Analytics',
      description:
        'Acquisition funnel (goviral.ryla.ai) effectiveness. 81% payment drop-off identified in research.',
      cards: [
        {
          name: 'Funnel Sessions (30d)',
          query: `SELECT COUNT(*) AS count FROM funnel_sessions WHERE created_at >= NOW() - INTERVAL '30 days'`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Email Capture Rate (%)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE email IS NOT NULL) / NULLIF(COUNT(*), 0), 1) AS rate FROM funnel_sessions WHERE created_at >= NOW() - INTERVAL '30 days'`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Waitlist Signups (30d)',
          query: `SELECT COUNT(*) AS count FROM funnel_sessions WHERE on_waitlist = true AND created_at >= NOW() - INTERVAL '30 days'`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Sessions by Step Reached',
          query: `SELECT current_step AS step, COUNT(*) AS sessions FROM funnel_sessions WHERE current_step IS NOT NULL AND created_at >= NOW() - INTERVAL '30 days' GROUP BY current_step ORDER BY current_step`,
          display: 'bar',
          col: 0, row: 3, size_x: 9, size_y: 6,
        },
        {
          name: 'Most Selected Options (30d)',
          query: `SELECT fo.option_key, fo.option_value::text AS value, COUNT(*) AS times_selected FROM funnel_options fo INNER JOIN funnel_sessions fs ON fs.session_id = fo.session_id WHERE fs.created_at >= NOW() - INTERVAL '30 days' GROUP BY fo.option_key, fo.option_value ORDER BY times_selected DESC LIMIT 30`,
          display: 'table',
          col: 9, row: 3, size_x: 9, size_y: 6,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  9. Content Library (C)                                               */
    /* -------------------------------------------------------------------- */
    {
      name: 'Content Library',
      description:
        'Which templates and prompts resonate with users. Monthly review cadence.',
      cards: [
        {
          name: 'Top 10 Templates by Usage',
          query: `SELECT name, usage_count, likes_count, COALESCE(success_rate, 0) AS success_pct FROM templates ORDER BY usage_count DESC LIMIT 10`,
          display: 'table',
          col: 0, row: 0, size_x: 9, size_y: 6,
        },
        {
          name: 'Top 10 Prompts by Usage',
          query: `SELECT name, category, usage_count, success_count, favorite_count FROM prompts WHERE deleted_at IS NULL AND is_active = true ORDER BY usage_count DESC LIMIT 10`,
          display: 'table',
          col: 9, row: 0, size_x: 9, size_y: 6,
        },
        {
          name: 'Template Avg Success Rate (%)',
          query: `SELECT ROUND(AVG(success_rate)::numeric, 1) AS avg_success FROM templates WHERE success_rate IS NOT NULL`,
          display: 'scalar',
          col: 0, row: 6, size_x: 6, size_y: 3,
        },
        {
          name: 'Curated vs User Templates',
          query: `SELECT CASE WHEN is_curated THEN 'Curated' ELSE 'User-created' END AS type, COUNT(*) AS count FROM templates GROUP BY is_curated`,
          display: 'pie',
          col: 6, row: 6, size_x: 6, size_y: 5,
        },
        {
          name: 'Gallery Favorites by Type',
          query: `SELECT item_type, COUNT(*) AS count FROM gallery_favorites GROUP BY item_type ORDER BY count DESC`,
          display: 'bar',
          col: 0, row: 9, size_x: 9, size_y: 5,
        },
        {
          name: 'Template Sets by Content Type',
          query: `SELECT content_type, COUNT(*) AS count FROM template_sets GROUP BY content_type ORDER BY count DESC`,
          display: 'bar',
          col: 9, row: 9, size_x: 9, size_y: 5,
        },
      ],
    },

    /* -------------------------------------------------------------------- */
    /*  10. Operations & Quality                                             */
    /* -------------------------------------------------------------------- */
    {
      name: 'Operations & Quality',
      description:
        'Surface infrastructure problems before user-facing impact. Engineering daily check-in.',
      cards: [
        {
          name: 'Open Bug Reports',
          query: `SELECT COUNT(*) AS count FROM bug_reports WHERE status = 'open'`,
          display: 'scalar',
          col: 0, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Generation Failure Rate (7d, %)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / NULLIF(COUNT(*), 0), 1) AS rate FROM generation_jobs WHERE created_at >= NOW() - INTERVAL '7 days'`,
          display: 'scalar',
          col: 6, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'LoRA Failure Rate (7d, %)',
          query: `SELECT ROUND(100.0 * COUNT(*) FILTER (WHERE status = 'failed') / NULLIF(COUNT(*), 0), 1) AS rate FROM lora_models WHERE created_at >= NOW() - INTERVAL '7 days'`,
          display: 'scalar',
          col: 12, row: 0, size_x: 6, size_y: 3,
        },
        {
          name: 'Top Failure Errors (7d)',
          query: `SELECT LEFT(error, 100) AS error_message, COUNT(*) AS occurrences FROM generation_jobs WHERE status = 'failed' AND created_at >= NOW() - INTERVAL '7 days' AND error IS NOT NULL GROUP BY LEFT(error, 100) ORDER BY occurrences DESC LIMIT 15`,
          display: 'table',
          col: 0, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Bug Reports by Status',
          query: `SELECT status, COUNT(*) AS count FROM bug_reports GROUP BY status ORDER BY count DESC`,
          display: 'bar',
          col: 9, row: 3, size_x: 9, size_y: 5,
        },
        {
          name: 'Active Feature Flags',
          query: `SELECT name, type, enabled, description FROM feature_flags WHERE enabled = true ORDER BY name`,
          display: 'table',
          col: 0, row: 8, size_x: 9, size_y: 5,
        },
        {
          name: 'Recent Admin Actions (24h)',
          query: `SELECT al.action, al.entity_type, al.entity_id, au.name AS admin, al.created_at FROM admin_audit_log al LEFT JOIN admin_users au ON au.id = al.admin_id WHERE al.created_at >= NOW() - INTERVAL '24 hours' ORDER BY al.created_at DESC LIMIT 20`,
          display: 'table',
          col: 9, row: 8, size_x: 9, size_y: 5,
        },
      ],
    },
  ];
}

/* -------------------------------------------------------------------------- */
/*  Main orchestrator                                                         */
/* -------------------------------------------------------------------------- */

async function main() {
  console.log('[Metabase] Using', METABASE_URL);

  // 1. Resolve database
  const dbRes = await get<{ data?: Database[] } | Database[]>('database');
  const dbs = Array.isArray(dbRes) ? dbRes : (dbRes.data ?? []);
  const db =
    dbs.find(
      (d) =>
        d.name?.toLowerCase().includes('postgres') ||
        d.name?.toLowerCase().includes('ryla'),
    ) || dbs[0];
  if (!db) {
    console.error(
      '[Metabase] No database found. Add Postgres as a data source in Metabase first.',
    );
    process.exit(1);
  }
  console.log('[Metabase] Using database:', db.name, '(id:', db.id + ')');

  // 2. Resolve or create RYLA collection
  const collRes = await get<{ data?: Collection[] } | Collection[]>(
    'collection',
  );
  const collections = Array.isArray(collRes) ? collRes : (collRes.data ?? []);
  let rylaCollection = collections.find((c) => c.name === 'RYLA');
  if (!rylaCollection) {
    rylaCollection = await post<Collection>('collection', {
      name: 'RYLA',
      parent_id: null,
    });
    console.log(
      '[Metabase] Created collection: RYLA (id:',
      rylaCollection.id + ')',
    );
  } else {
    console.log(
      '[Metabase] Using collection: RYLA (id:',
      rylaCollection.id + ')',
    );
  }
  const collectionId = rylaCollection.id;

  // 2b. Resolve or create "Questions" sub-collection (cards go here, dashboards stay at root)
  let questionsCollection: Collection | undefined;
  try {
    const childRes = await get<{ data?: Collection[] } | Collection[]>(
      `collection/${collectionId}/items?models=collection`,
    );
    const children = Array.isArray(childRes)
      ? childRes
      : (childRes.data ?? []);
    questionsCollection = children.find((c) => c.name === 'Questions');
  } catch {
    // ignore
  }
  if (!questionsCollection) {
    questionsCollection = await post<Collection>('collection', {
      name: 'Questions',
      parent_id: collectionId,
    });
    console.log(
      '[Metabase] Created sub-collection: Questions (id:',
      questionsCollection.id + ')',
    );
  } else {
    console.log(
      '[Metabase] Using sub-collection: Questions (id:',
      questionsCollection.id + ')',
    );
  }
  const questionsCollectionId = questionsCollection.id;

  // 3. Build native query helper
  const native = (query: string) => ({
    type: 'native' as const,
    native: { query },
    database: db.id,
  });

  // 4. Get existing dashboards
  const dashRes = await get<{ data?: Dashboard[] } | Dashboard[]>('dashboard');
  const existingDashboards = Array.isArray(dashRes)
    ? dashRes
    : (dashRes.data ?? []);

  // 5. Get existing cards in Questions sub-collection
  let existingCards: Card[] = [];
  try {
    const itemRes = await get<{ data?: Card[] } | Card[]>(
      `collection/${questionsCollectionId}/items?models=card`,
    );
    existingCards = Array.isArray(itemRes)
      ? itemRes
      : (itemRes.data ?? []);
  } catch {
    // Collection might be empty — that's fine
  }

  // 6. Process each dashboard
  const dashboardDefs = buildDashboards();
  let totalCardsCreated = 0;
  let totalDashboardsCreated = 0;

  for (const dashDef of dashboardDefs) {
    console.log(`\n[Metabase] === ${dashDef.name} ===`);

    // Check if dashboard exists and has cards
    const existing = existingDashboards.find((d) => d.name === dashDef.name);
    if (existing) {
      // Fetch full dashboard to check dashcards
      const fullDash = await get<Dashboard>(`dashboard/${existing.id}`);
      if (fullDash.dashcards && fullDash.dashcards.length > 0) {
        console.log(
          `[Metabase] Dashboard "${dashDef.name}" exists with ${fullDash.dashcards.length} cards. Skipping.`,
        );
        continue;
      }
      console.log(
        `[Metabase] Dashboard "${dashDef.name}" exists but empty. Adding cards...`,
      );
    }

    // Create cards
    const cardIds: number[] = [];
    for (const cardDef of dashDef.cards) {
      // Check if card already exists
      const existingCard = existingCards.find((c) => c.name === cardDef.name);
      if (existingCard) {
        cardIds.push(existingCard.id);
        console.log(`[Metabase]   Card exists: ${cardDef.name}`);
        continue;
      }

      try {
        const card = await post<Card>('card', {
          name: cardDef.name,
          collection_id: questionsCollectionId,
          dataset_query: native(cardDef.query),
          display: cardDef.display,
          visualization_settings: {},
        });
        cardIds.push(card.id);
        existingCards.push(card); // Track for deduplication
        totalCardsCreated++;
        console.log(`[Metabase]   Created card: ${cardDef.name}`);
      } catch (err) {
        console.error(
          `[Metabase]   ERROR creating card "${cardDef.name}":`,
          err instanceof Error ? err.message : err,
        );
      }
    }

    // Create or use existing dashboard
    let dashboard: Dashboard;
    if (existing) {
      dashboard = existing;
    } else {
      dashboard = await post<Dashboard>('dashboard', {
        name: dashDef.name,
        collection_id: collectionId,
        description: dashDef.description,
      });
      totalDashboardsCreated++;
      console.log(
        `[Metabase]   Created dashboard: ${dashDef.name} (id: ${dashboard.id})`,
      );
    }

    // Assign cards to dashboard
    if (cardIds.length > 0) {
      const dashcards = dashDef.cards.map((cardDef, i) => ({
        id: -(i + 1),
        card_id: cardIds[i],
        row: cardDef.row,
        col: cardDef.col,
        size_x: cardDef.size_x,
        size_y: cardDef.size_y,
        visualization_settings: {},
        parameter_mappings: [],
      })).filter((dc) => dc.card_id != null);

      try {
        await put(`dashboard/${dashboard.id}`, {
          name: dashboard.name,
          description: dashDef.description,
          collection_id: collectionId,
          dashcards,
        });
        console.log(
          `[Metabase]   Added ${dashcards.length} cards to "${dashDef.name}"`,
        );
      } catch (err) {
        console.error(
          `[Metabase]   ERROR adding cards to "${dashDef.name}":`,
          err instanceof Error ? err.message : err,
        );
      }
    }
  }

  console.log('\n[Metabase] =============================================');
  console.log(`[Metabase] Done. Created ${totalDashboardsCreated} dashboards, ${totalCardsCreated} cards.`);
  console.log(`[Metabase] Open ${METABASE_URL} → RYLA collection to view.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
