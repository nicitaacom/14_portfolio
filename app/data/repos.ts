import type { TPublicRepo, TRepo, TTrackedRepo } from "@/interfaces/TRepo"

const repos: TRepo[] = [
  {
    id: 1,
    description: "influencers",
    url: "https://github.com/nicitaacom/MyFirstSite",
    group: "hidden",
  },
  {
    id: 2,
    description: "spaklevka",
    url: "https://github.com/nicitaacom/MySecondSite",
    group: "hidden",
  },
  {
    id: 3,
    description: "bootstrap net ninja",
    url: "https://github.com/nicitaacom/MyThirdSite",
    group: "hidden",
  },
  {
    id: 4,
    description: "go trip",
    url: "https://github.com/nicitaacom/MyFourthSite",
    group: "hidden",
  },
  {
    id: 5,
    description: "netflix clone",
    url: "https://github.com/nicitaacom/MyFifthSite",
    group: "hidden",
  },
  {
    id: 6,
    description: "invoriem",
    url: "https://github.com/nicitaacom/MySixthSite",
    group: "hidden",
  },
  {
    id: 7,
    description: "navbars forms",
    url: "https://github.com/nicitaacom/MySeventhSite",
    group: "hidden",
  },
  {
    id: 8,
    description: "accordeon pop-up",
    url: "https://github.com/nicitaacom/MyEighthSite",
    group: "hidden",
  },
  {
    id: 9,
    description: "project",
    url: "https://github.com/nicitaacom/MyNinethSite",
    group: "hidden",
  },
  {
    id: 10,
    description: "product",
    url: "https://github.com/nicitaacom/MyTenthSite",
    group: "hidden",
  },
  {
    id: 11,
    description: "githubApi",
    url: "https://github.com/nicitaacom/MyEleventhSite",
    group: "hidden",
  },
  {
    id: 12,
    description: "shopping cart",
    url: "https://github.com/nicitaacom/MyTwelvthSite",
    group: "hidden",
  },
  {
    id: 13,
    description: "to-do",
    url: "https://github.com/nicitaacom/MyThirteenthSite",
    group: "hidden",
  },
  {
    id: 14,
    description: "portfolio",
    url: "https://github.com/nicitaacom/14_portfolio",
    stack: "Next.js, TypeScript, Tailwind",
    slug: "14-portfolio",
    name: "Portfolio",
    shortName: "Portfolio",
    group: "hidden",
  },
  {
    id: 15,
    description: "HooBank",
    url: "https://github.com/nicitaacom/15_HooBank",
    stack: "React, Vite, TypeScript, Tailwind",
    slug: "project-15-hoobank",
    name: "HooBank",
    shortName: "HooBank",
    group: "projects",
  },
  {
    id: 16,
    description: "gericht-restaurant",
    url: "https://github.com/nicitaacom/16_gericht-restaurant",
    stack: "React, Vite, TypeScript, Tailwind, CSS",
    slug: "project-16-gericht-restaurant",
    name: "Gericht Restaurant",
    shortName: "Gericht",
    group: "projects",
  },
  {
    id: 17,
    description: "messenger clone",
    url: "https://github.com/nicitaacomcom/17_messenger-clone",
    stack: "Next, TypeScript, Tailwind, Prisma, Pusher",
    slug: "project-17-messenger-clone",
    name: "Messenger Clone",
    shortName: "Messenger",
    group: "projects",
  },
  {
    id: 18,
    description: "utilities",
    url: "https://github.com/nicitaacom/18_utilities",
    group: "hidden",
  },
  {
    id: 19,
    description: "spotify clone",
    url: "https://github.com/nicitaacom/19_spotify-clone",
    stack: "Next, TypeScript, Tailwind, Supabase, Zustand, Stripe",
    slug: "project-19-spotify-clone",
    name: "Spotify Clone",
    shortName: "Spotify",
    group: "projects",
  },
  {
    id: 20,
    description: "flowmazon clone",
    url: "https://github.com/nicitaacom/20_flowmazon-clone",
    stack: "Next, TypeScript, Tailwind, daisyUI",
    slug: "project-20-flowmazon-clone",
    name: "Flowmazon Clone",
    shortName: "Flowmazon",
    group: "projects",
  },
  {
    id: 21,
    description: "auth-form (FullStack)",
    url: "https://github.com/nicitaacom/21_auth-form",
    group: "hidden",
  },
  {
    id: 22,
    description: "aer",
    url: "https://github.com/nicitaacom/22_aer",
    stack: "T3 Next App, TypeScript, Tailwind, CSS",
    slug: "project-22-aer",
    name: "AER",
    shortName: "AER",
    group: "projects",
  },
  {
    id: 23,
    description: "23_store",
    url: "https://github.com/nicitaacom/23_store",
    stack: "Next, TypeScript, Tailwind, Zustand, Stripe, Telegram API",
    slug: "project-23-store",
    name: "23 Store",
    shortName: "23 Store",
    group: "projects",
  },
  {
    id: 24,
    description: "dashboard MUI",
    url: "https://github.com/nicitaacom/24_dashboard-mui",
    stack: "React, Vite, TypeScript, MUI",
    slug: "project-24-dashboard-mui",
    name: "Dashboard MUI",
    shortName: "MUI",
    group: "projects",
  },
  {
    id: 25,
    description: "bottle-energy",
    stack: "unknown",
    slug: "bottle-energy",
    name: "Bottle energy",
    group: "hidden",
  },
  {
    id: 26,
    description: "hot delivery",
    url: "https://hot-de.delivery/",
    stack: "Next, TypeScript, Tailwind, Supabase, OpenAI, AWS, GCP",
    slug: "project-26-hot-delivery",
    name: "Hot Delivery",
    shortName: "Hot Delivery",
    group: "projects",
  },
  {
    id: 27,
    description: "find team",
    url: "https://www.google.com/search?sca_esv=8d36031256b28c5e&sca_upv=1&sxsrf=ADLYWIJ67tpxRTKEYP9GaVnpZo2be_3N3Q:1726807004449&q=closed+source&source=lnms&fbs=AEQNm0Aa4sjWe7Rqy32pFwRj0UkWd8nbOJfsBGGB5IQQO6L3J_86uWOeqwdnV0yaSF-x2jqw-AzvpDFRWNmLZKilfTrfn09q0QL89IE2BK9wqCaoIVFOCV1aoDeP5tw4R7IXvsEru5h7CjL6p8iEdExKawty8Ih9BaQ4THdbQdc9OzGogmA3n2ZhZZDIZC9rq5LYItoW5Tge&sa=X&ved=2ahUKEwjc7uGw2dCIAxW00AIHHclmGuIQ0pQJegQIDRAB&biw=1920&bih=958&dpr=1",
    group: "hidden",
  },
  {
    id: 28,
    description: "notion clone",
    url: "https://github.com/nicitaacom/28_notion-clone",
    stack: "Next, TypeScript, RadixUI, Convex, Blocknote",
    slug: "project-28-notion-clone",
    name: "Notion Clone",
    shortName: "Notion",
    group: "projects",
  },
  {
    id: 29,
    description: "AI companion",
    url: "https://github.com/nicitaacom/29_ai-companion",
    stack: "Next, TypeScript, Tailwind",
    slug: "project-29-ai-companion",
    name: "AI Companion",
    shortName: "AI Companion",
    group: "projects",
  },
  // closed source - no public url, so the navbar ticker skips these
  {
    id: 30,
    description: "riz admin dashboard",
    stack: "Next, TypeScript, Tailwind, MongoDB",
    slug: "project-riz-admin-dashboard",
    name: "Riz Admin Dashboard",
    shortName: "Riz",
    group: "work",
  },
  {
    id: 31,
    description: "nda outreach platform",
    stack:
      "Next, TypeScript, Tailwind, Supabase, Redis, AWS, Stripe, Twilio, Cloudflare, Docker, Coolify VPS, eslint, husky",
    slug: "project-nda-outreach-platform",
    name: "NDA",
    shortName: "NDA",
    group: "work",
  },
  {
    id: 32,
    description: "nexgem automation platform",
    stack: "Next, TypeScript, Tailwind",
    slug: "project-nexgem-automation-platform",
    name: "Nexgem",
    shortName: "Nexgem",
    group: "work",
  },
]

function isTrackedRepo(repo: TRepo): repo is TTrackedRepo {
  return Boolean(
    repo.slug && repo.name && repo.shortName && repo.stack && (repo.group === "work" || repo.group === "projects"),
  )
}

function isPublicRepo(repo: TRepo): repo is TPublicRepo {
  return Boolean(repo.url)
}

/** Repos the navbar ticker links to - every entry is guaranteed to own a url. */
export const publicRepos: TPublicRepo[] = repos.filter(isPublicRepo)

export const publicReposMap = publicRepos.reduce<Record<number, TPublicRepo>>((acc, repo) => {
  acc[repo.id] = repo
  return acc
}, {})

/** Repos that render a project card - work oldest id first, then projects newest id first. */
export const trackedProjects: TTrackedRepo[] = repos
  .filter(isTrackedRepo)
  .sort((a, b) =>
    a.group !== b.group ? (a.group === "work" ? -1 : 1) : a.group === "work" ? a.id - b.id : b.id - a.id,
  )

export const trackedProjectsMap = trackedProjects.reduce<Record<string, TTrackedRepo>>((acc, project) => {
  acc[project.slug] = project
  return acc
}, {})

export { repos }
