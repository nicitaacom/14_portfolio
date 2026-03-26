import type { TTrackedProject } from "@/interfaces/TTrackedProject"

export const trackedProjects: TTrackedProject[] = [
  {
    slug: "project-riz-admin-dashboard",
    name: "Riz Admin Dashboard",
    shortName: "Riz",
    group: "work",
  },
  {
    slug: "project-26-hot-delivery",
    name: "Hot Delivery",
    shortName: "Hot Delivery",
    group: "projects",
  },
  {
    slug: "project-23-store",
    name: "23 Store",
    shortName: "23 Store",
    group: "projects",
  },
  {
    slug: "project-22-aer",
    name: "AER",
    shortName: "AER",
    group: "projects",
  },
  {
    slug: "project-24-dashboard-mui",
    name: "Dashboard MUI",
    shortName: "MUI",
    group: "projects",
  },
  {
    slug: "project-16-gericht-restaurant",
    name: "Gericht Restaurant",
    shortName: "Gericht",
    group: "projects",
  },
  {
    slug: "project-15-hoobank",
    name: "HooBank",
    shortName: "HooBank",
    group: "projects",
  },
]

export const trackedProjectsMap = trackedProjects.reduce<Record<string, TTrackedProject>>((acc, item) => {
  acc[item.slug] = item
  return acc
}, {})
