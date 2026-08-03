/**
 * The pure logic behind the key check — no network, safe to run anywhere.
 *
 * These live in `node --test` rather than vitest because this project has no test runner installed and
 * is not getting one. `tests/resolveSeasonalTheme.test.mjs` set that pattern already.
 */
import assert from "node:assert/strict"
import { describe, it } from "node:test"

import { daysSince, REALERT_AFTER_DAYS, runKeyChecks, shouldSendKeyAlert } from "../app/utils/checkKeys.ts"

function isoDaysAgo(days) {
  return new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString()
}

describe("shouldSendKeyAlert", () => {
  it("sends when nothing was ever reported", () => {
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], null), true)
  })

  it("stays quiet for the same one name reported yesterday", () => {
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], { names: ["RESEND_SECRET"], sentAt: isoDaysAgo(1) }), false)
  })

  it("stays quiet when the same set comes back in a different order", () => {
    const lastAlert = { names: ["RESEND_SECRET", "TELEGRAM_BOT_TOKEN"], sentAt: isoDaysAgo(2) }
    assert.equal(shouldSendKeyAlert(["TELEGRAM_BOT_TOKEN", "RESEND_SECRET"], lastAlert), false)
  })

  it("sends the moment a new name joins the same failure", () => {
    const lastAlert = { names: ["RESEND_SECRET"], sentAt: isoDaysAgo(1) }
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET", "TELEGRAM_BOT_TOKEN"], lastAlert), true)
  })

  it("sends when a name drops out, because the picture changed", () => {
    const lastAlert = { names: ["RESEND_SECRET", "TELEGRAM_BOT_TOKEN"], sentAt: isoDaysAgo(1) }
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], lastAlert), true)
  })

  it("stays quiet on the last day before the reminder is due", () => {
    const lastAlert = { names: ["RESEND_SECRET"], sentAt: isoDaysAgo(REALERT_AFTER_DAYS - 1) }
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], lastAlert), false)
  })

  it("reminds once REALERT_AFTER_DAYS has passed on an unfixed name", () => {
    const lastAlert = { names: ["RESEND_SECRET"], sentAt: isoDaysAgo(REALERT_AFTER_DAYS + 1) }
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], lastAlert), true)
  })

  it("sends when the stored timestamp is not a date, rather than staying quiet forever", () => {
    assert.equal(shouldSendKeyAlert(["RESEND_SECRET"], { names: ["RESEND_SECRET"], sentAt: "not-a-date" }), true)
  })
})

describe("daysSince", () => {
  it("answers null for an absent or unreadable timestamp", () => {
    assert.equal(daysSince(null), null)
    assert.equal(daysSince(undefined), null)
    assert.equal(daysSince(""), null)
    assert.equal(daysSince("whenever"), null)
  })

  it("counts whole and part days", () => {
    assert.ok(Math.abs(daysSince(isoDaysAgo(3)) - 3) < 0.01)
    assert.ok(Math.abs(daysSince(isoDaysAgo(0.5)) - 0.5) < 0.01)
  })
})

describe("runKeyChecks presence", () => {
  it("fails an empty name before sending any request", async () => {
    process.env.MADE_UP_KEY_NAME = ""
    const report = await runKeyChecks([{ name: "MADE_UP_KEY_NAME", tier: "skip" }])

    assert.equal(report.ok, false)
    assert.deepEqual(report.failures, [{ name: "MADE_UP_KEY_NAME", reason: "missing - declared, value is empty" }])
  })

  it("passes a present name whose tier asks for nothing more", async () => {
    process.env.MADE_UP_KEY_NAME = "anything"
    const report = await runKeyChecks([{ name: "MADE_UP_KEY_NAME", tier: "skip" }])

    assert.equal(report.ok, true)
    assert.equal(report.skipCount, 1)
  })

  it("lets an empty value pass while its optionalWhen partner holds one", async () => {
    process.env.MADE_UP_HOST = ""
    process.env.MADE_UP_FALLBACK = "https://example.test"
    const report = await runKeyChecks([{ name: "MADE_UP_HOST", tier: "skip", optionalWhen: "MADE_UP_FALLBACK" }])

    assert.equal(report.ok, true)
  })

  it("fails when both halves of an optionalWhen pair are empty", async () => {
    process.env.MADE_UP_HOST = ""
    process.env.MADE_UP_FALLBACK = ""
    const report = await runKeyChecks([{ name: "MADE_UP_HOST", tier: "skip", optionalWhen: "MADE_UP_FALLBACK" }])

    assert.equal(report.ok, false)
    assert.ok(report.failures[0].reason.includes("MADE_UP_FALLBACK"))
  })

  it("never runs the check when the value is empty", async () => {
    process.env.MADE_UP_KEY_NAME = ""
    let checkRan = false
    await runKeyChecks([
      {
        name: "MADE_UP_KEY_NAME",
        tier: "live",
        check: () => {
          checkRan = true
          return null
        },
      },
    ])

    assert.equal(checkRan, false)
  })

  it("reports failures in registry order, not in the order they finished", async () => {
    process.env.MADE_UP_FIRST = ""
    process.env.MADE_UP_SECOND = ""
    const report = await runKeyChecks([
      { name: "MADE_UP_FIRST", tier: "skip" },
      { name: "MADE_UP_SECOND", tier: "skip" },
    ])

    assert.deepEqual(
      report.failures.map(failure => failure.name),
      ["MADE_UP_FIRST", "MADE_UP_SECOND"],
    )
  })
})
