import { GroupedAchievements } from "@/components/Modals/ModalMoreInfo"

export const project23Achievements: GroupedAchievements = {
  "♿ a11y": {
    "Advanced light / dark mode with changing icons color + skeleton + custom icons design": undefined,
  },
  "🌐 i18n": {
    "Created translation for website - so now it's available on EN, RU, FI and SE": undefined,
    "Created i18n with AI - so when somebody adds product in English it translates it into 4 languages (used Lambda for this in order to optimize UX)":
      undefined,
  },
  "🔴 Real-time": {
    "Created custom chat with USER / SUPPORT / ADMIN roles handling up to 200,000 messages/day and 100 concurrent connections via Pusher.js + Telegram API":
      undefined,
  },
  "💳 Payments": {
    "Created Web3 payment with MetaMask API + Stripe SDK + PayPal": undefined,
    "Implemented CoinMarketCap API to convert crypto-currency to USD": undefined,
  },
  "⚡ Performance": {
    "Improved Lighthouse mobile score 35 → 85 in under 20 hours — SSG/ISR + added metadata":
      "https://i.imgur.com/Sj9hEBE.png",
    "Scaled to 77 users/day - 222 unique visitors per 7 days": "https://youtu.be/4TiYacof9M8",
  },
  "🧩 Backend": {
    "Created frontend with React using Next.js framework and backend with Supabase and API routes":
      "https://github.com/nicitaacom/23_store/tree/development/app/api",
    "Migrated full codebase from Vite to Next": undefined,
    "Fixed issue that come with scale - bots - implemented Turnstile and Redis rate limiting": undefined,
    "Created ISR for dynamic routes for SSG pages - so page renders faster on ticket/[ticketId] route": undefined,
    "Created setup for backend with Supabase - emails / SMTP / SQL tables / RLS / auth redirect URL":
      "https://github.com/nicitaacom/23_store/blob/development/dev_readme.md",
    "Created advanced auth with login / register / OAuth2 / recover + role-based auth + input validation": undefined,
    "Created CMS so user can add / edit / delete some product to sell": undefined,
    "Improved API routes using best practices + code comments + docs - so code become much clear and maintainable":
      "https://github.com/nicitaacom/23_store/blob/development/app/api/dev_readme.md",
    "Created custom email when user gets check after purchasing or confirm email using Resend SDK": undefined,
    "Created custom email when user ask for better prices": undefined,
  },
  "🛠️ DevOps": {
    "Manually e2e tested and used Cypress for tests": undefined,
    "Used Storybook to illustrate how component looks like (but I think locator.js is better)": undefined,
    "Wrote clean code because of eslint": undefined,
  },
  "📄 Documentation": {
    "Documented project with dev_readme files": undefined,
  },
  "🤖 AI": {
    "Created AI sales assistant to help user shop - AI can generate images and add products to cart": undefined,
    "Fixed a ton of bugs and edge cases and UI issues (300+ small bugs and issues fixed - with AI)": undefined,
  },
}
