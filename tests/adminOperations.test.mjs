import assert from "node:assert/strict"
import test from "node:test"

import { buildJobSearchStats, jobSearchStats, jobSearchStatsError } from "../app/[locale]/(site)/admin-dashboard/data/jobSearchStats.ts"
import { getBookingTimestamp, splitBookingsByTime } from "../app/[locale]/(site)/admin-dashboard/utils/bookingTime.ts"
import { formatDate, formatDateTime } from "../app/[locale]/(site)/admin-dashboard/utils/adminFormatters.ts"
import { applications } from "../app/data/hours-and-applications.ts"

test("job-search source uses interviews and keeps the first cumulative snapshot out of monthly results", () => {
  assert.equal(jobSearchStatsError, null)
  const baseline = jobSearchStats[0]
  const [baselineYear, baselineMonth] = baseline.month.split("-")
  const baselineSource = applications[baselineMonth + "." + baselineYear]
  assert.equal(baseline.totalApplications, baselineSource.amount_applies)
  assert.equal(baseline.totalInterviews, baselineSource.interviews)
  assert.equal(jobSearchStats[0].applicationsAdded, null)
  assert.equal(jobSearchStats[0].interviewsAdded, null)
  assert.equal(jobSearchStats[0].conversionRate, null)
  for (const snapshot of jobSearchStats) {
    const [year, month] = snapshot.month.split("-")
    const source = applications[month + "." + year]
    assert.equal(snapshot.totalApplications, source.amount_applies)
    assert.equal(snapshot.totalInterviews, source.interviews)
    assert.ok(Number.isFinite(snapshot.totalInterviews))
  }
})

test("job-search snapshots sort chronologically and zero applications do not produce an infinite conversion rate", () => {
  const { data, error } = buildJobSearchStats({
    "02.2026": { amount_applies: 100, interviews: 2 },
    "01.2026": { amount_applies: 100, interviews: 1 },
    "03.2026": { amount_applies: 150, interviews: 3 },
  })
  assert.equal(error, null)
  assert.deepEqual(data.map(month => month.month), ["2026-01", "2026-02", "2026-03"])
  assert.equal(data[1].applicationsAdded, 0)
  assert.equal(data[1].interviewsAdded, 1)
  assert.equal(data[1].conversionRate, null)
  assert.equal(data[2].conversionRate, 2)
})

test("job-search gaps are not presented as single-month growth, including across year boundaries", () => {
  const { data, error } = buildJobSearchStats({
    "11.2025": { amount_applies: 100, interviews: 1 },
    "01.2026": { amount_applies: 300, interviews: 3 },
    "02.2026": { amount_applies: 350, interviews: 4 },
  })
  assert.equal(error, null)
  assert.equal(data[1].totalApplications, 300)
  assert.equal(data[1].applicationsAdded, null)
  assert.equal(data[1].conversionRate, null)
  assert.equal(data[2].applicationsAdded, 50)
  assert.equal(data[2].interviewsAdded, 1)
})

test("job-search invalid months, missing interviews, nonfinite values, and decreasing totals return an error", () => {
  const invalidSources = [
    { "13.2026": { amount_applies: 100, interviews: 1 } },
    { "01.2026": { amount_applies: 100, appointments: 1 } },
    { "01.2026": { amount_applies: Number.NaN, interviews: 1 } },
    { "01.2026": { amount_applies: 100, interviews: -1 } },
    { "01.2026": { amount_applies: 100, interviews: 2 }, "02.2026": { amount_applies: 99, interviews: 3 } },
    { "01.2026": { amount_applies: 100, interviews: 2 }, "02.2026": { amount_applies: 110, interviews: 1 } },
  ]
  for (const source of invalidSources) {
    const result = buildJobSearchStats(source)
    assert.ok(result.error)
    assert.deepEqual(result.data, [])
  }
  assert.deepEqual(buildJobSearchStats({}), { data: [], error: null })
})

function booking(id, date, time) {
  return { id, booking_date: date, booking_time_MSK: time, channel: "google-meets", created_at: "2026-01-01T00:00:00Z" }
}

test("booking grouping uses Moscow time in every browser timezone and sorts upcoming/past correctly", () => {
  const originalTimezone = process.env.TZ
  const bookings = [
    booking("future-later", "2026-09-15", "18:00:00"),
    booking("past-older", "2026-09-14", "23:00:00"),
    booking("boundary", "2026-09-15", "15:00:00"),
    booking("past-recent", "2026-09-15", "14:59:59"),
  ]
  try {
    for (const timezone of ["UTC", "Europe/Berlin", "America/Los_Angeles", "Asia/Tokyo"]) {
      process.env.TZ = timezone
      assert.equal(getBookingTimestamp(bookings[2]), Date.parse("2026-09-15T12:00:00Z"))
      const split = splitBookingsByTime(bookings, Date.parse("2026-09-15T12:00:00Z"))
      assert.deepEqual(split.upcomingBookings.map(item => item.id), ["boundary", "future-later"])
      assert.deepEqual(split.pastBookings.map(item => item.id), ["past-recent", "past-older"])
      assert.equal(formatDate("2026-09-15"), "15 Sept 2026")
    }
  } finally {
    if (originalTimezone === undefined) delete process.env.TZ
    else process.env.TZ = originalTimezone
  }
  assert.equal(bookings[0].id, "future-later", "grouping must not reorder server props")
})

test("Moscow midnight and DST transition days retain the fixed UTC+03:00 offset", () => {
  assert.equal(getBookingTimestamp(booking("midnight", "2026-09-15", "00:30")), Date.parse("2026-09-14T21:30:00Z"))
  assert.equal(getBookingTimestamp(booking("dst", "2026-03-29", "04:00:00")), Date.parse("2026-03-29T01:00:00Z"))
  assert.match(formatDateTime("2026-09-15T12:00:00Z"), /UTC/)
  assert.equal(formatDateTime(null, "No runs"), "No runs")
  assert.equal(formatDateTime("invalid", "No runs"), "No runs")
})
