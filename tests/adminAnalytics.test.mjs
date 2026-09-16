import assert from "node:assert/strict"
import test from "node:test"
import {
  createAnalyticsPeriod,
  createProjectClicksAggregator,
  createUTMAnalyticsAggregator,
  getAnalyticsBucketKeys,
  readAnalyticsPages,
} from "../app/libs/adminAnalytics.ts"
import { AdminAnalyticsAccessError, withAdminAnalyticsAccess } from "../app/libs/adminAnalyticsAccess.ts"
import { ProjectClicksSDK } from "../app/classes/ProjectClicksSDK/ProjectClicksSDK.ts"

const asOf = new Date("2026-09-15T12:30:00.000Z")
const projects = [
  { slug: "first", name: "First project", group: "projects" },
  { slug: "second", name: "Second project", group: "work" },
  { slug: "zero", name: "No clicks", group: "projects" },
]

function visit(id, createdAt, userId = "visitor", overrides = {}) {
  return { id: String(id), created_at: createdAt, user_id: userId, source: "search", medium: "organic", campaign: null, ...overrides }
}

function click(id, timestamp, projectSlug = "first", linkType = "demo") {
  return { id, created_at: timestamp, project_slug: projectSlug, link_type: linkType }
}

test("UTC periods use exactly seven days, thirty days, or twelve calendar months", () => {
  for (const [range, start, length, unit] of [
    ["1w", "2026-09-09T00:00:00.000Z", 7, "day"],
    ["1m", "2026-08-17T00:00:00.000Z", 30, "day"],
    ["monthly", "2026-08-17T00:00:00.000Z", 30, "day"],
    ["1y", "2025-10-01T00:00:00.000Z", 12, "month"],
    ["yearly", "2025-10-01T00:00:00.000Z", 12, "month"],
  ]) {
    const period = createAnalyticsPeriod(range, asOf)
    assert.deepEqual(period, { start, end: asOf.toISOString(), bucketUnit: unit, timezone: "UTC" })
    assert.equal(getAnalyticsBucketKeys(period).length, length)
  }
})

test("periods include zero buckets at midnight, leap days, and year boundaries", () => {
  const midnight = createAnalyticsPeriod("1w", new Date("2024-03-01T00:00:00Z"))
  const keys = getAnalyticsBucketKeys(midnight)
  assert.equal(keys.length, 7)
  assert.ok(keys.includes("2024-02-29"))
  assert.equal(keys.at(-1), "2024-03-01")

  const january = createAnalyticsPeriod("yearly", new Date("2026-01-01T00:00:00Z"))
  assert.equal(january.start, "2025-02-01T00:00:00.000Z")
  assert.equal(getAnalyticsBucketKeys(january).at(-1), "2026-01")
  assert.equal(getAnalyticsBucketKeys(january).length, 12)
})

test("traffic aggregation includes the start, excludes asOf and future data, and fills inactive days", () => {
  const period = createAnalyticsPeriod("1m", asOf)
  const aggregator = createUTMAnalyticsAggregator(period, "1m")
  aggregator.addPage([
    visit(1, period.start),
    visit(2, "2026-08-16T23:59:59.999Z"),
    visit(3, period.end),
    visit(4, "2027-01-01T00:00:00Z"),
  ])
  const result = aggregator.result()
  assert.equal(result.totalVisits, 1)
  assert.equal(result.uniqueUsers, 1)
  assert.equal(result.chartData.length, 30)
  assert.equal(result.chartData.filter(bucket => bucket.visits === 0).length, 29)
  assert.equal(result.chartData.reduce((total, bucket) => total + bucket.visits, 0), 1)
  assert.equal(result.totalVisits / result.chartData.length, 1 / 30)
  assert.deepEqual(result.period, period)
})

test("traffic unique visitors and all attribution totals combine across pages", () => {
  const aggregator = createUTMAnalyticsAggregator(createAnalyticsPeriod("1y", asOf), "1y")
  aggregator.addPage([visit(1, "2026-03-15T12:00:00Z"), visit(2, "2026-04-15T12:00:00Z")])
  aggregator.addPage([visit(3, "2026-09-15T12:00:00Z", "another", { source: null, medium: null, campaign: "launch" })])
  const result = aggregator.result()
  assert.equal(result.totalVisits, 3)
  assert.equal(result.uniqueUsers, 2)
  assert.equal(result.chartData.length, 12)
  assert.equal(result.chartData.at(-1).date, "2026-09")
  for (const breakdown of [result.sourceStats, result.mediumStats, result.campaignStats]) {
    assert.equal(breakdown.reduce((sum, row) => sum + row.count, 0), 3)
  }
  assert.deepEqual(result.sourceStats, [{ name: "search", count: 2 }, { name: "direct", count: 1 }])
})

test("project totals, destination subtotals, and the selected chart use one period", () => {
  const period = createAnalyticsPeriod("monthly", asOf)
  const aggregator = createProjectClicksAggregator(period, projects, "first")
  aggregator.addPage([
    click(1, period.start),
    click(2, "2026-09-15T12:00:00Z", "first", "github"),
    click(3, "2026-09-14T12:00:00Z", "second", "figma"),
    click(4, "2026-09-14T12:00:00Z", "unknown", "youtube"),
    click(5, period.end),
  ])
  const result = aggregator.result()
  const selected = result.overview.find(project => project.project_slug === "first")
  assert.equal(selected.total_clicks, 2)
  assert.equal(result.overview.reduce((sum, project) => sum + project.total_clicks, 0), 3)
  assert.equal(result.timeline.reduce((sum, bucket) => sum + bucket.total_clicks, 0), selected.total_clicks)
  for (const project of result.overview) {
    assert.equal(project.total_clicks, project.demo_clicks + project.github_clicks + project.figma_clicks + project.youtube_clicks)
  }
  assert.equal(result.timeline.length, 30)
  assert.equal(result.overview.find(project => project.project_slug === "zero").total_clicks, 0)
})

test("a selected project without clicks never borrows another project's clicks", () => {
  const aggregator = createProjectClicksAggregator(createAnalyticsPeriod("yearly", asOf), projects, "zero")
  aggregator.addPage([click(1, "2026-01-01T00:00:00Z")])
  const result = aggregator.result()
  assert.equal(result.overview.find(project => project.project_slug === "zero").total_clicks, 0)
  assert.equal(result.timeline.length, 12)
  assert.ok(result.timeline.every(bucket => bucket.total_clicks === 0))
})

test("all-empty datasets retain their full chart periods", () => {
  const period = createAnalyticsPeriod("1m", asOf)
  const traffic = createUTMAnalyticsAggregator(period, "1m").result()
  const links = createProjectClicksAggregator(period, projects, "first").result()
  assert.equal(traffic.totalVisits, 0)
  assert.equal(traffic.chartData.length, 30)
  assert.equal(links.timeline.length, 30)
  assert.ok(links.overview.every(project => project.total_clicks === 0))
})

test("pagination aggregates 2,001 rows even when the server caps pages below the requested size", async () => {
  const rows = Array.from({ length: 2001 }, (_, index) => ({ id: index + 1 }))
  const collected = []
  const cursors = []
  await readAnalyticsPages(async afterId => {
    cursors.push(afterId)
    return rows.filter(row => afterId === null || row.id > afterId).slice(0, 73)
  }, page => collected.push(...page))
  assert.deepEqual(collected, rows)
  assert.equal(cursors.at(-1), 2001)
})

test("pagination supports UUID cursors, an empty first page, and rejects repeated cursors", async () => {
  let consumed = false
  await readAnalyticsPages(async () => [], () => { consumed = true })
  assert.equal(consumed, false)

  const ids = ["00000000-0000-0000-0000-000000000001", "00000000-0000-0000-0000-000000000002"]
  const cursors = []
  await readAnalyticsPages(async afterId => {
    cursors.push(afterId)
    const next = ids.find(id => afterId === null || id > afterId)
    return next ? [{ id: next }] : []
  }, () => {})
  assert.deepEqual(cursors, [null, ...ids])

  await assert.rejects(readAnalyticsPages(async () => [{ id: 1 }], () => {}), /did not advance/)
})

test("a later-page failure rejects the whole read instead of producing a partial result", async () => {
  let completed = false
  await assert.rejects(async () => {
    await readAnalyticsPages(async afterId => {
      if (afterId !== null) throw new Error("database unavailable")
      return [{ id: 1 }]
    }, () => {})
    completed = true
  }, /database unavailable/)
  assert.equal(completed, false)
})

test("anonymous, non-admin, and failed authentication cannot call the privileged read", async () => {
  for (const auth of [
    { data: { user: null }, error: null },
    { data: { user: { id: "visitor" } }, error: null },
    { data: { user: { id: "admin" } }, error: new Error("expired session") },
  ]) {
    let queried = false
    await assert.rejects(withAdminAnalyticsAccess(async () => auth, "admin", async () => {
      queried = true
    }), AdminAnalyticsAccessError)
    assert.equal(queried, false)
  }
})

test("allowlisted admins can read, using either supported admin-ID environment format", async () => {
  for (const allowed of ["admin,other", '["admin","other"]']) {
    const result = await withAdminAnalyticsAccess(
      async () => ({ data: { user: { id: "admin" } }, error: null }),
      allowed,
      async () => ({ total: 42 }),
    )
    assert.deepEqual(result, { total: 42 })
  }
})

test("the project SDK requests one uncached overview/timeline snapshot and forwards cancellation", async t => {
  const period = createAnalyticsPeriod("monthly", asOf)
  const payload = { overview: [], timeline: [], period }
  const controller = new AbortController()
  t.mock.method(globalThis, "fetch", async (url, options) => {
    const parsed = new URL(url, "https://example.test")
    assert.equal(parsed.searchParams.get("scope"), "all")
    assert.equal(parsed.searchParams.get("projectSlug"), "first")
    assert.equal(options.cache, "no-store")
    assert.equal(options.signal, controller.signal)
    return Response.json(payload)
  })
  assert.deepEqual(await new ProjectClicksSDK().selectProjectClicksDashboard("first", "monthly", controller.signal), payload)
})

test("the project SDK rejects unauthorized and malformed responses instead of reporting zero clicks", async t => {
  const fetch = t.mock.method(globalThis, "fetch", async () => Response.json({ error: "Unauthorized" }, { status: 401 }))
  await assert.rejects(new ProjectClicksSDK().selectProjectClicksDashboard("first", "monthly"), /Unauthorized/)
  fetch.mock.mockImplementation(async () => Response.json({ overview: [], timeline: [] }))
  await assert.rejects(new ProjectClicksSDK().selectProjectClicksDashboard("first", "monthly"), /Invalid project clicks response/)
  fetch.mock.mockImplementation(async () => Response.json({ overview: null, timeline: [], period: createAnalyticsPeriod("monthly", asOf) }))
  await assert.rejects(new ProjectClicksSDK().selectProjectClicksDashboard("first", "monthly"), /Invalid project clicks response/)
  fetch.mock.mockImplementation(async () => Response.json({}))
  await assert.rejects(new ProjectClicksSDK().selectProjectClicksOverview("monthly"), /Invalid project clicks overview response/)
  await assert.rejects(new ProjectClicksSDK().selectProjectClicksTimeline("first", "monthly"), /Invalid project clicks timeline response/)
})
