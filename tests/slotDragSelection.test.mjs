import assert from "node:assert/strict"
import test from "node:test"

import { isDragSelectableSlot, mergeDragSelection, selectableStartsInDrag } from "../app/[locale]/(site)/admin-dashboard/utils/slotDragSelection.ts"

const slots = [
  { startsAt: "12:00", occupancy: "free", eligibility: "past" },
  { startsAt: "12:30", occupancy: "free", eligibility: "too_soon" },
  { startsAt: "13:00", occupancy: "booked", eligibility: "eligible" },
  { startsAt: "13:30", occupancy: "blocked", eligibility: "eligible" },
  { startsAt: "14:00", occupancy: "free", eligibility: "eligible" },
  { startsAt: "14:30", occupancy: "free", eligibility: "eligible" },
]

test("a drag selects every changeable start between the press and the release", () => {
  assert.deepEqual(selectableStartsInDrag(slots, 1, 5), ["12:30", "13:30", "14:00", "14:30"])
  assert.deepEqual(selectableStartsInDrag(slots, 5, 1), ["12:30", "13:30", "14:00", "14:30"])
  assert.deepEqual(selectableStartsInDrag(slots, 4, 4), ["14:00"])
})

test("a drag skips booked and past starts, including when the gesture ends on one", () => {
  assert.equal(isDragSelectableSlot(slots[0]), false)
  assert.equal(isDragSelectableSlot(slots[2]), false)
  assert.equal(isDragSelectableSlot(slots[1]), true)
  assert.equal(isDragSelectableSlot(slots[3]), true)
  assert.deepEqual(selectableStartsInDrag(slots, 0, 2), ["12:30"])
  assert.deepEqual(selectableStartsInDrag(slots, 3, 99), ["13:30", "14:00", "14:30"])
  assert.deepEqual(selectableStartsInDrag([], 0, 1), [])
})

test("a drag adds to the current selection without duplicating starts", () => {
  assert.deepEqual(mergeDragSelection(["14:00", "18:00"], ["13:30", "14:00", "14:30"]), ["14:00", "18:00", "13:30", "14:30"])
})
