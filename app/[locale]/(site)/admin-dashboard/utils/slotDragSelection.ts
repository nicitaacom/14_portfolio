export type DragSlot = {
  startsAt: string
  occupancy: "free" | "booked" | "blocked"
  eligibility: "eligible" | "too_soon" | "past"
}

/** Booked and past starts stay out of a drag range. */
export function isDragSelectableSlot(slot: Pick<DragSlot, "eligibility" | "occupancy">) {
  return slot.eligibility !== "past" && slot.occupancy !== "booked"
}

/** Inclusive range in rendered order. The grid is chronological, so this is every start between the two times. */
export function selectableStartsInDrag(slots: readonly DragSlot[], fromIndex: number, toIndex: number) {
  if (!Number.isInteger(fromIndex) || !Number.isInteger(toIndex) || slots.length === 0) return []
  const start = Math.max(0, Math.min(fromIndex, toIndex))
  const end = Math.min(slots.length - 1, Math.max(fromIndex, toIndex))
  if (start > end) return []

  const startsAt: string[] = []
  for (let index = start; index <= end; index += 1) {
    const slot = slots[index]
    if (isDragSelectableSlot(slot)) startsAt.push(slot.startsAt)
  }
  return startsAt
}

/** A drag adds the range. Starts already selected stay selected, in their existing order. */
export function mergeDragSelection(selected: readonly string[], dragged: readonly string[]) {
  return [...new Set([...selected, ...dragged])]
}
