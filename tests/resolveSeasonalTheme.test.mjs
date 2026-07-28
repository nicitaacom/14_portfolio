import assert from "node:assert/strict"
import test from "node:test"

import { resolveSeasonalTheme } from "../app/utils/resolveSeasonalTheme.ts"

test("uses Crazy Mechanics only in June and July", () => {
  assert.equal(resolveSeasonalTheme(5), "default")
  assert.equal(resolveSeasonalTheme(6), "crazy-mechanics")
  assert.equal(resolveSeasonalTheme(7), "crazy-mechanics")
  assert.equal(resolveSeasonalTheme(8), "default")
})

test("uses Halloween only in November", () => {
  assert.equal(resolveSeasonalTheme(10), "default")
  assert.equal(resolveSeasonalTheme(11), "halloween")
})

test("uses New Year in December and January", () => {
  assert.equal(resolveSeasonalTheme(12), "new-year")
  assert.equal(resolveSeasonalTheme(1), "new-year")
  assert.equal(resolveSeasonalTheme(2), "default")
})

test("falls back to default for an unknown month", () => {
  assert.equal(resolveSeasonalTheme(0), "default")
  assert.equal(resolveSeasonalTheme(13), "default")
  assert.equal(resolveSeasonalTheme(1.5), "default")
  assert.equal(resolveSeasonalTheme(Number.NaN), "default")
})

test("ignores invalid months in the configured schedule", () => {
  const schedule = {
    "crazy-mechanics": [6, 7, 13],
    halloween: [11],
    "new-year": [12, 1],
  }

  assert.equal(resolveSeasonalTheme(7, schedule), "crazy-mechanics")
  assert.equal(resolveSeasonalTheme(13, schedule), "default")
})

test("falls back to default when multiple themes share a month", () => {
  const schedule = {
    "crazy-mechanics": [6, 7],
    halloween: [10, 11],
    "new-year": [10, 12, 1],
  }

  assert.equal(resolveSeasonalTheme(10, schedule), "default")
  assert.equal(resolveSeasonalTheme(11, schedule), "halloween")
  assert.equal(resolveSeasonalTheme(12, schedule), "new-year")
})
