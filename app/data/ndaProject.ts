export interface NdaAchievement {
  text: string
}

export interface NdaAchievementGroup {
  title: string
  achievements: NdaAchievement[]
}

export const ndaAchievementGroups: NdaAchievementGroup[] = [
  {
    title: "Security, AWS & platform",
    achievements: [
      {
        text: "Implemented OAuth with google for security and preventing multi-accounting",
      },
      {
        text: "Used AWS as SES EventBridge CloudWatch Lambda",
      },
      {
        text: "Created documentation using github gist",
      },
      {
        text: "Created something similar to GHL on its minimals",
      },
      {
        text: "Created 2 Lambda functions and used CloudWatch SDK",
      },
    ],
  },
  {
    title: "Performance & developer experience",
    achievements: [
      {
        text: "Optimized fetching time from 10s down to 382ms (https://i.imgur.com/kPMhBxM.png) and even further 206ms (https://i.imgur.com/xSX1x0t.png) when keeping security",
      },
      {
        text: "Optimized get (Redis) fetching time 52s -> 882ms - proof - https://youtu.be/rmVZaB8GHSg",
      },
      {
        text: "cut encryption/decryption wait 10s → 7.5s (https://i.imgur.com/DdTlctk.png) — 100 users × 5 ops/day × 2.5s saved = ~1,200 collective hours saved over 10 years",
      },
      {
        text: "Created SDK within the project that improved developers experience make code more organized",
      },
    ],
  },
  {
    title: "Lead generation, calling & analytics",
    achievements: [
      {
        text: "Built lead scraper averaging 200 leads/hour — expected: 100/hr, actual: 200/hr (peaks at 240/hr) so that business get leads using puppeteer - proof - https://i.imgur.com/fhswf1R.jpeg",
      },
      {
        text: 'Built email verifier replacing Lumirid — before: ~80% "Risky" false flags, after: accurate delivery to verified mailboxes at $0 tooling cost',
      },
      {
        text: "Created GSM so that employees can call from laptop instead of phone using Kotlin",
      },
      {
        text: "shipped dialer for VAs enabling 480 calls/day — before: manual phone (1x speed), after: 3x faster + auto number formatting - https://imgur.com/gsm-1KEMXVT",
      },
      {
        text: "Eliminated GSM phone costs — before: ~$400/mo hardware/plan, after: $15/mo SIM-only via laptop",
      },
      {
        text: "Created a dialer so VAs can all people using twilio API",
      },
      {
        text: "Created stats so user can see detailed statistics with animated carts (data visualisation)  outcome: full data visibility, zero support tickets about missing metrics",
      },
      {
        text: "scaled infra to 2 VPS — trigger: organic demand growth, zero downtime during transition",
      },
    ],
  },
  {
    title: "Compliance, notifications & support",
    achievements: [
      {
        text: "replaced GHL $150/m (SES upcharge x10 price)  with AWS SES — after: $1 per 10,000 emails sent, ~98%+ cost reduction - proof - https://i.imgur.com/ooqfc29.jpeg",
      },
      {
        text: "[LEGAL] built bulk UK TPS/DNC validator to stay within UK laws processing up to 12,000 numbers/day — gov website: manual 1-by-1, actual: 3 numbers/2s via 2-chunk parallel processing - proof - https://i.imgur.com/yl06UPn.jpeg",
      },
      {
        text: "cut compliance check time to ~10 mins per 1,000 numbers — before: manual gov site lookup (hours), after: automated batch (minutes)",
      },
      {
        text: "identified avg 12.5% opted-out numbers per dataset — on 10k volume: ~1,250 non-compliant calls blocked before dialing",
      },
      {
        text: "shipped 2-chunk parallel processing in ~2 days solo — expected: 1.5x speed gain, actual: 2x throughput increase",
      },
      {
        text: "implemented notification system (per-day, per-hour windows, multi-channel: Discord/Telegram/SMS) — before: no notifications at all, after: per-employee/VA configurable notification environments",
      },
      {
        text: "shipped full email UI solo in 6 weeks — expected: basic inbox, actual: production-grade client with keyboard shortcuts, sorting, threading, scheduled follow-ups",
      },
      {
        text: "built follow-up sequencing: 1 parent + up to 9 follow-ups — Gmail: single scheduled send with no structure, actual: fully visible sequence with parent-child hierarchy",
      },
      {
        text: 'achieved near "golden ratio" on /emails and /dnc UX balance - reduced avg mouse travel path on /dnc by moving input section to top and on /emails by implementing keyboard hotkeys',
      },
      {
        text: "shipped full support ticket system in ~7 days — leveraged 5x prior builds, actual: enterprise-scale UI with sub-domain support panel, rate limit controls, drag & drop, Turnstile spam protection",
      },
      {
        text: "achieved ~8s avg response time from support via instant notifications — before: no notifications, after: real-time alerts direct to support telegram or discord or SMS - proof - https://i.imgur.com/9CUr0DP.jpeg",
      },
      {
        text: "implemented Cloudflare Turnstile proactively — no spam incidents at current scale, architecture ready for high-volume abuse without rework",
      },
    ],
  },
  {
    title: "Email infrastructure & AI",
    achievements: [
      {
        text: "built blasting mode removing artificial send caps — before: ~200/day (spam block mindset), after: up to SES limit (~50k) at max safe frequency of 1 email/6s",
      },
      {
        text: "Implemented custom unsubscribe subdomain (unsubscribe.yourdomain.com) via Vercel + AWS + Cloudflare — outcome: all links in email stay on sender's domain, reducing spam score triggers from third-party URLs",
      },
      {
        text: "Built verification envs system (Redis + Supabase shared pool + CSV) with dual encryption — 3 days solo",
      },
      {
        text: "Created feature where AI manages emails (OpenAI/Claude/Grok) auto-sorting inbox via Lambda — eliminated manual ~5,500 manual sortings/year ~22 hours/year saved - eliminates $9k-$20k/year in manual triage costs at scale e.g hotels or HRs (based on 30-40% of inbox manager salary) - proof - imgur.com/t1UdCFQ.jpeg - proof replies - https://imgur.com/ai-reply-decisions-upXsYXS",
      },
      {
        text: "Built email account stats dashboard tracking 20,000+ sent emails across 12+ domains — real-time animated charts, per-account/outreached/unsubscribed breakdown, goal tracking with % completion",
      },
      {
        text: "implemented Email Goals system with configurable daily targets",
      },
      {
        text: "Shipped Metric Performance per metric (reply rate, bounce rate, sent count) — gives per-niche A/B visibility without third-party analytics tools",
      },
      {
        text: "built cron-based domain warmup system with AI reply simulation (OpenAI) and SES sending — automates domain reputation building without manual inbox activity",
      },
      {
        text: "Built Stripe webhook → Supabase sync for plan management — stripe as source of truth, DB auto-updates on stripe plan change, saved time on admin-plan dashboard needed, animated usage progress bars per plan tier (Free/Basic/Pro)",
      },
      {
        text: "built guest access system for VA/apprentice onboarding — scoped permissions per email account, no full credential sharing required",
      },
      {
        text: "increased performance from 208s to 2s by using API routes instead of server actions - in general speed up performance by x3-x5  https://i.imgur.com/cBOFSz5.jpeg to https://i.imgur.com/OOYVKCX.jpeg",
      },
    ],
  },
  {
    title: "Delivery & developer tooling",
    achievements: [
      {
        text: "Created setup for github actions (CI) - not CD please stop this was not CD there - and so it just builds on github actions and VPS just pulls docker image - so VPS is not under heavy load because of build so API requests not fail and keep speed so users more happy (yes Buffer?)",
      },
      {
        text: "Re-created publish buffer functionality in 8 hours (MVP) - this is my record",
      },
      {
        text: "Created support-outreach-tool-sdk and it's basically DB callers and state setters that would allow to supportSDK.sendMessage - supportSDK.createTicket stuff like that",
      },
    ],
  },
]
