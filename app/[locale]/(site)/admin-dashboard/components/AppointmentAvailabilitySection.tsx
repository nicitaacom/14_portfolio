"use client"

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react"
import moment from "moment-timezone"

import { formatInstantInZone, type AppointmentSlot } from "@/libs/appointmentSlots"
import { useScopedI18n } from "@/locales/client"
import { adminUi, RefreshButton } from "./AdminUI"

type AdminSlot = Pick<AppointmentSlot, "startsAt" | "bookingDate" | "timeMSK"> & {
  occupancy: "free" | "booked" | "blocked"
  eligibility: "eligible" | "too_soon" | "past"
}

function useAppointmentAvailabilityHandlers({
  byInstant,
  mutatingRef,
  setSelected,
}: {
  byInstant: Map<string, AdminSlot>
  mutatingRef: { current: boolean }
  setSelected: (action: string[] | ((previous: string[]) => string[])) => void
}) {
  const toggleSlot = useCallback((startsAt: string) => {
    const slot = byInstant.get(startsAt)
    if (!slot || slot.eligibility === "past" || slot.occupancy === "booked" || mutatingRef.current) return
    setSelected(previous => previous.includes(startsAt) ? previous.filter(item => item !== startsAt) : [...previous, startsAt])
  }, [byInstant, mutatingRef, setSelected])

  return { toggleSlot }
}

const AvailabilitySlotButton = memo(function AvailabilitySlotButton({
  active,
  date,
  disabled,
  eligibility,
  occupancy,
  onToggle,
  startsAt,
  time,
  waiting,
}: {
  active: boolean
  date: string
  disabled: boolean
  eligibility: AdminSlot["eligibility"]
  occupancy: AdminSlot["occupancy"]
  onToggle: (startsAt: string) => void
  startsAt: string
  time: string
  waiting: boolean
}) {
  const t = useScopedI18n("adminConsole")
  const handleClick = useCallback(() => onToggle(startsAt), [onToggle, startsAt])
  const occupancyText = t(occupancy)
  const eligibilityText = eligibility === "eligible" ? "" : eligibility === "too_soon" ? t("tooSoon") : t("past")
  const cardStyle = occupancy === "blocked"
    ? "!border-[#555555] !bg-[radial-gradient(circle_at_2px_2px,_#333333_0.5px,_#1f1f1f_1.3px,_transparent_1.8px),linear-gradient(145deg,_#292929,_#1d1d1d)] bg-[length:8px_8px,_100%_100%] shadow-[inset_0_2px_5px_#111111,inset_0_-1px_0_#414141]"
    : occupancy === "booked"
      ? "!border-[#686868] !bg-[radial-gradient(circle_at_2px_2px,_#666666_0.5px,_#393939_1.3px,_transparent_1.8px),linear-gradient(145deg,_#424242,_#2d2d2d)] bg-[length:8px_8px,_100%_100%] shadow-[inset_0_1px_0_#777777,inset_0_-2px_4px_#222222,0_2px_3px_#111111]"
      : "!border-[#777777] !bg-[radial-gradient(circle_at_2px_2px,_#747474_0.5px,_#414141_1.3px,_transparent_1.8px),linear-gradient(145deg,_#484848,_#333333)] bg-[length:8px_8px,_100%_100%] shadow-[inset_0_1px_0_#858585,inset_0_-2px_4px_#292929,0_2px_3px_#111111]"
  const badgeStyle = occupancy === "blocked"
    ? "border-[#606060] bg-[#202020] text-[#d0d0d0] shadow-[inset_0_1px_1px_#111111,inset_0_-1px_0_#444444]"
    : occupancy === "booked"
      ? "border-[#666666] bg-[linear-gradient(180deg,#4b4b4b,#353535)] text-[#dddddd] shadow-[inset_0_1px_0_#777777,inset_0_-1px_0_#292929]"
      : "border-[#777777] bg-[linear-gradient(180deg,#565656,#3e3e3e)] text-[#e5e5e5] shadow-[inset_0_1px_0_#858585,inset_0_-1px_0_#303030]"

  return <button
    type="button"
    aria-label={`${time}${date ? ` ${date}` : ""}: ${occupancyText}${eligibilityText ? `, ${eligibilityText}` : ""}`}
    aria-pressed={active}
    data-occupancy={occupancy}
    data-eligibility={eligibility}
    disabled={disabled}
    onClick={handleClick}
    style={{ cursor: disabled ? waiting ? "wait" : "not-allowed" : undefined }}
    className={`${adminUi.button} ${cardStyle} admin-availability-slot flex-col !items-start !justify-center !px-xs !opacity-100 text-left transition-[filter,transform] hover:brightness-110 active:scale-[.99] aria-[pressed=true]:outline aria-[pressed=true]:outline-2 aria-[pressed=true]:outline-offset-2 aria-[pressed=true]:outline-[#eeeeee] disabled:hover:brightness-100`}>
    <span className="font-typewriter text-[12px] leading-tight text-[#f0f0f0]">{time}<small className="ml-xs text-[9px] text-[#c0c0c0]">{date}</small></span>
    <span className="admin-availability-statuses flex flex-wrap items-center">
      <span className={`admin-availability-badge inline-flex items-center rounded-[2px] border font-mono text-[9px] font-bold uppercase leading-tight tracking-[.5px] ${badgeStyle}`}>
        <span aria-hidden="true">{occupancy === "free" ? "○" : occupancy === "blocked" ? "×" : "●"}</span>
        {occupancyText}
      </span>
      {eligibility !== "eligible" && <span className="admin-availability-badge inline-flex items-center rounded-[2px] border border-[#777777] bg-[#292929] font-mono text-[9px] uppercase leading-tight tracking-[.5px] text-[#c8c8c8] shadow-[inset_0_1px_2px_#111111]">
        <span aria-hidden="true">{eligibility === "past" ? "↶" : "◷"}</span>
        {eligibilityText}
      </span>}
    </span>
  </button>
})

interface AdminAvailabilityResponse {
  ok: boolean
  date?: string
  timezone?: string
  serverNow?: string
  slots?: AdminSlot[]
  error?: string
  code?: string
}

export const AppointmentAvailabilitySection = memo(function AppointmentAvailabilitySection() {
  const t = useScopedI18n("adminConsole")
  const [date, setDate] = useState("")
  const [timezone, setTimezone] = useState("Europe/Moscow")
  const [localTimezone, setLocalTimezone] = useState("Europe/Berlin")
  const [slots, setSlots] = useState<AdminSlot[]>([])
  const [selected, setSelected] = useState<string[]>([])
  const [rangeStart, setRangeStart] = useState("")
  const [rangeEnd, setRangeEnd] = useState("")
  const [loading, setLoading] = useState(false)
  const [mutating, setMutating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resultMessage, setResultMessage] = useState("")
  const requestId = useRef(0)
  const abortController = useRef<AbortController | null>(null)
  const lastFocusRefresh = useRef(0)
  const mutatingRef = useRef(mutating)
  mutatingRef.current = mutating

  const refresh = useCallback(async () => {
    if (!date) return
    abortController.current?.abort()
    const controller = new AbortController()
    abortController.current = controller
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const query = new URLSearchParams({ date, timezone })
      const response = await fetch(`/api/admin/appointment-slots?${query.toString()}`, { cache: "no-store", signal: controller.signal })
      const payload = await response.json() as AdminAvailabilityResponse
      if (!response.ok || !payload.ok || !payload.slots) throw new Error(payload.error ?? t("availabilityLoadFailed"))
      if (currentRequest !== requestId.current) return
      setSlots(payload.slots)
    } catch (reason) {
      if (!controller.signal.aborted && currentRequest === requestId.current) {
        setSlots([])
        setError(reason instanceof Error ? reason.message : t("availabilityLoadFailed"))
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false)
    }
  }, [date, timezone, t])

  useEffect(() => {
    const guessed = moment.tz.guess()
    setLocalTimezone(guessed)
    setDate(moment().tz("Europe/Moscow").format("YYYY-MM-DD"))
  }, [])

  useEffect(() => { refresh() }, [refresh])

  useEffect(() => {
    const onFocus = () => {
      if (document.visibilityState !== "visible" || Date.now() - lastFocusRefresh.current < 5000) return
      lastFocusRefresh.current = Date.now()
      refresh()
    }
    window.addEventListener("focus", onFocus)
    document.addEventListener("visibilitychange", onFocus)
    return () => {
      window.removeEventListener("focus", onFocus)
      document.removeEventListener("visibilitychange", onFocus)
      abortController.current?.abort()
    }
  }, [refresh])

  useEffect(() => {
    setSelected([])
    setRangeStart("")
    setRangeEnd("")
  }, [date, timezone])

  const byInstant = useMemo(() => new Map(slots.map(slot => [slot.startsAt, slot])), [slots])
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const selectedSlots = useMemo(() => selected.map(startsAt => byInstant.get(startsAt)).filter((slot): slot is AdminSlot => Boolean(slot)), [byInstant, selected])
  const blockable = useMemo(() => selectedSlots.filter(slot => slot.occupancy === "free" && slot.eligibility !== "past"), [selectedSlots])
  const unblockable = useMemo(() => selectedSlots.filter(slot => slot.occupancy === "blocked" && slot.eligibility !== "past"), [selectedSlots])
  const slotStartInstants = useMemo(() => new Set(slots.map(slot => slot.startsAt)), [slots])
  const slotDisplays = useMemo(() => new Map(slots.map(slot => [slot.startsAt, formatInstantInZone(slot.startsAt, timezone)])), [slots, timezone])
  const rangeCandidates = useMemo(() => {
    const values = new Map<string, string>()
    for (const slot of slots) {
      const label = formatInstantInZone(slot.startsAt, timezone)
      if (label) values.set(slot.startsAt, label.date === date ? label.time : `${label.date} · ${label.time}`)
      const endInstant = new Date(Date.parse(slot.startsAt) + 30 * 60 * 1000).toISOString()
      const endLabel = formatInstantInZone(endInstant, timezone)
      if (endLabel) values.set(endInstant, endLabel.date === date ? endLabel.time : `${endLabel.date} · ${endLabel.time}`)
    }
    return [...values].sort(([left], [right]) => Date.parse(left) - Date.parse(right))
  }, [date, slots, timezone])
  const rangePreview = useMemo(() => {
    const start = Date.parse(rangeStart)
    const end = Date.parse(rangeEnd)
    const inRange = Number.isFinite(start) && Number.isFinite(end) && start < end
      ? slots.filter(slot => Date.parse(slot.startsAt) >= start && Date.parse(slot.startsAt) < end)
      : []
    return {
      free: inRange.filter(slot => slot.occupancy === "free" && slot.eligibility !== "past").length,
      bookedSlots: inRange.filter(slot => slot.occupancy === "booked").map(slot => {
        const display = formatInstantInZone(slot.startsAt, timezone)
        return display ? `${display.date} ${display.time}` : slot.timeMSK
      }),
      past: inRange.filter(slot => slot.eligibility === "past").length,
    }
  }, [slots, rangeStart, rangeEnd, timezone])

  function changeDate(nextDate: string) {
    setSelected([])
    setDate(nextDate)
  }

  function chooseTodayOrTomorrow(offset: number) {
    changeDate(moment().tz(timezone).add(offset, "day").format("YYYY-MM-DD"))
  }

  const { toggleSlot } = useAppointmentAvailabilityHandlers({ byInstant, mutatingRef, setSelected })

  function selectRange() {
    const start = Date.parse(rangeStart)
    const end = Date.parse(rangeEnd)
    if (!Number.isFinite(start) || !Number.isFinite(end) || start >= end) return
    setSelected(slots.filter(slot => Date.parse(slot.startsAt) >= start && Date.parse(slot.startsAt) < end && slot.eligibility !== "past" && slot.occupancy !== "booked").map(slot => slot.startsAt))
  }

  async function mutate(blocked: boolean) {
    const startsAt = (blocked ? blockable : unblockable).map(slot => slot.startsAt)
    if (!startsAt.length || mutating) return
    setMutating(true)
    setError(null)
    setResultMessage("")
    try {
      const response = await fetch("/api/admin/appointment-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ startsAt, blocked }),
      })
      const result = await response.json() as { ok: boolean; changed?: number; unchanged?: number; error?: string; code?: string }
      if (!response.ok || !result.ok) {
        if (response.status === 409) setError(t("availabilityConflict"))
        else setError(result.error ?? t("actionFailed"))
        await refresh()
        return
      }
      setResultMessage(blocked ? t("blockSuccess", { count: result.changed ?? 0 }) : t("unblockSuccess", { count: result.changed ?? 0 }))
      setSelected([])
      await refresh()
    } catch {
      setError(t("actionFailed"))
      await refresh()
    } finally {
      setMutating(false)
    }
  }

  const zoneChoices = [...new Set(["Europe/Moscow", localTimezone])]
  const today = moment().tz(timezone).format("YYYY-MM-DD")
  const tomorrow = moment().tz(timezone).add(1, "day").format("YYYY-MM-DD")

  return <div className="admin-availability" aria-busy={loading || mutating}>
    <div className={adminUi.stack}>
      <section className={`${adminUi.panel} admin-availability-toolbar`} aria-label={t("availability")}>
        <div className="flex flex-wrap items-center gap-sm">
          <label className="flex w-full min-w-0 items-center gap-sm text-[11px] text-[var(--3d-dot-c-adb5bc)] tablet:w-auto"><span>{t("bookingDate")}</span><input className={`${adminUi.input} admin-availability-control flex-1 tablet:w-[160px] tablet:flex-none`} type="date" value={date} disabled={mutating} onChange={event => changeDate(event.target.value)} /></label>
          <div className={`${adminUi.segmented} !gap-0`} role="group" aria-label={t("bookingDate")}>
            <button type="button" className="admin-availability-control px-sm" aria-pressed={date === today} disabled={mutating} onClick={() => chooseTodayOrTomorrow(0)}>{t("today")}</button>
            <button type="button" className="admin-availability-control px-sm" aria-pressed={date === tomorrow} disabled={mutating} onClick={() => chooseTodayOrTomorrow(1)}>{t("tomorrow")}</button>
          </div>
          <div className="flex flex-wrap items-center gap-xs tablet:ml-sm tablet:border-l tablet:border-[var(--3d-dot-c-43494f)] tablet:pl-sm">
            <div className={`${adminUi.segmented} !gap-0`} role="group" aria-label={t("adminTimeZone")}>
              {zoneChoices.map((zone, index) => <button key={zone} className="admin-availability-control px-sm" type="button" aria-pressed={timezone === zone} title={zone} disabled={mutating} onClick={() => { setSelected([]); setTimezone(zone) }}>{index === 0 ? "MSK" : "Local"}</button>)}
            </div>
            <span className={`${adminUi.muted} font-typewriter text-[10px]`}>{timezone}</span>
          </div>
          <div className="admin-availability-refresh ml-auto"><RefreshButton pending={loading || mutating} onClick={refresh} /></div>
        </div>
      </section>

      <section className={adminUi.panel} aria-label={t("selectRange")}>
        <div className="grid grid-cols-2 items-center gap-sm tablet:grid-cols-[minmax(0,220px)_minmax(0,220px)_auto_minmax(0,1fr)]">
          <label className={`${adminUi.field} tablet:flex tablet:items-center tablet:gap-sm`}><span className="shrink-0">{t("blockRangeStart")}</span><select className={`${adminUi.input} admin-availability-control`} aria-label={t("rangeStartLabel")} value={rangeStart} disabled={mutating} onChange={event => setRangeStart(event.target.value)}><option value="">—</option>{rangeCandidates.filter(([instant]) => slotStartInstants.has(instant)).map(([instant, label]) => <option key={instant} value={instant}>{label}</option>)}</select></label>
          <label className={`${adminUi.field} tablet:flex tablet:items-center tablet:gap-sm`}><span className="shrink-0">{t("blockRangeEnd")}</span><select className={`${adminUi.input} admin-availability-control`} aria-label={t("rangeEndLabel")} aria-describedby="availability-range-end-help" value={rangeEnd} disabled={mutating} onChange={event => setRangeEnd(event.target.value)}><option value="">—</option>{rangeCandidates.map(([instant, label]) => <option key={instant} value={instant}>{label}</option>)}</select></label>
          <button type="button" className={`${adminUi.button} admin-availability-control`} disabled={mutating || !rangeStart || !rangeEnd || Date.parse(rangeStart) >= Date.parse(rangeEnd)} onClick={selectRange}>{t("selectRange")}</button>
          <p className={`${adminUi.muted} text-[10px]`} id="availability-range-end-help">{t("rangeEndExcluded")}</p>
        </div>
        {rangeStart && rangeEnd && <div className={`${adminUi.muted} mt-xs text-[11px]`} aria-live="polite"><p>{t("rangePreview", { free: rangePreview.free, booked: rangePreview.bookedSlots.length })}{rangePreview.past > 0 ? ` ${t("excludedPast", { count: rangePreview.past })}` : ""}</p>{rangePreview.bookedSlots.length > 0 && <p>{t("booked")}: {rangePreview.bookedSlots.join(", ")}</p>}</div>}
      </section>

      <section className={adminUi.panel}>
        <div className={adminUi.toolbar}>
          <p className={adminUi.heading}>{t("selectedSlots", { count: selectedSlots.length })}</p>
          <div className="flex flex-wrap gap-xs">
            <button type="button" className={`${adminUi.button} admin-availability-control`} disabled={mutating || !slots.length} onClick={() => { setSelected(slots.filter(slot => slot.eligibility !== "past" && slot.occupancy !== "booked").map(slot => slot.startsAt)) }}>{t("selectWholeDay")}</button>
            <button type="button" className={`${adminUi.button} admin-availability-control`} disabled={mutating || selected.length === 0} onClick={() => setSelected([])}>{t("clearSelection")}</button>
          </div>
        </div>
        <div className="admin-availability-slots mt-sm grid gap-xs">
          {slots.map(slot => {
            const display = slotDisplays.get(slot.startsAt)
            if (!display) return null
            return <AvailabilitySlotButton key={slot.startsAt} active={selectedSet.has(slot.startsAt)} date={display.date !== date ? display.date : ""} disabled={mutating || slot.eligibility === "past" || slot.occupancy === "booked"} eligibility={slot.eligibility} occupancy={slot.occupancy} onToggle={toggleSlot} startsAt={slot.startsAt} time={display.time} waiting={mutating} />
          })}
        </div>
        {loading && <p className={`${adminUi.muted} mt-sm`} role="status">{t("refreshing")}</p>}
        {!loading && !error && !slots.length && <p className={adminUi.empty}>{t("noAvailabilitySlots")}</p>}
        {error && <p className={`${adminUi.error} mt-sm`} role="alert">{error} <button type="button" className="ml-xs underline" onClick={refresh}>{t("refreshAvailability")}</button></p>}
        {resultMessage && <p className="mt-sm text-[12px] text-[var(--3d-dot-c-d9e2e7)]" role="status" aria-live="polite">{resultMessage}</p>}
        <div className="mt-sm flex flex-wrap items-center gap-sm border-t border-[var(--3d-dot-c-3c454d)] pt-sm">
          <span className="text-[11px] text-[var(--3d-dot-c-a1a7ae)]" aria-live="polite">{t("free")} · {t("blocked")} · {t("booked")} · {t("tooSoon")} · {t("past")}</span>
          <div className="ml-auto flex flex-wrap gap-xs">
            <button type="button" className={`${adminUi.button} admin-availability-control`} disabled={mutating || blockable.length === 0} onClick={() => { mutate(true) }}>{mutating ? t("pending") : `${t("blockSelected")} (${blockable.length})`}</button>
            <button type="button" className={`${adminUi.button} admin-availability-control`} disabled={mutating || unblockable.length === 0} onClick={() => { mutate(false) }}>{mutating ? t("pending") : `${t("unblockSelected")} (${unblockable.length})`}</button>
          </div>
        </div>
      </section>
    </div>
  </div>
})
