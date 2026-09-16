"use client"

import Link from "next/link"
import { useEffect, useRef, useState, type KeyboardEvent } from "react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import gsap from "gsap"
import { FiActivity, FiArrowUpRight, FiBriefcase, FiCalendar, FiChevronRight, FiClock, FiExternalLink, FiLock } from "react-icons/fi"
import { useCurrentLocale, useScopedI18n } from "@/locales/client"
import { localizePath } from "@/locales/helpers"
import { LanguageDropdown } from "@/components/Navbar/LanguageDropdown"
import { toggleIsGMAction } from "../actions/toggleIsGMAction"
import type { TBookingRow } from "./types/TBookingRow"
import type { TCronScheduleRow } from "./types/TCronScheduleRow"
import { JobSearchDashboardSection } from "./components/JobSearchDashboardSection"
import { ProjectClicksDashboardSection } from "./components/ProjectClicksDashboardSection"
import { UTMStatsDashboardSection } from "./components/UTMStatsDashboardSection"
import { BookedAppointmentsSection } from "./components/BookedAppointmentsSection"
import { CronSchedulesSection } from "./components/CronSchedulesSection"
import { DotRelief, DotReliefBackground } from "./components/DotRelief"
import { FullDotReliefSvg } from "./components/FullDotReliefSvg"
import { adminUi } from "./components/AdminUI"
import { playAdminButtonSound } from "./utils/playAdminButtonSound"

interface AdminDashboardClientProps {
  bookings: TBookingRow[]
  cronSchedules: TCronScheduleRow[]
  userId: string
  bookingsLoadError?: boolean
  cronSchedulesLoadError?: boolean
  isGMLive?: boolean
}

const sections = [
  { id: "traffic", title: "traffic", description: "trafficDescription", icon: FiActivity },
  { id: "project-links", title: "projectLinks", description: "projectLinksDescription", icon: FiArrowUpRight },
  { id: "job-search", title: "jobSearch", description: "jobSearchDescription", icon: FiBriefcase },
  { id: "bookings", title: "bookings", description: "bookingsDescription", icon: FiCalendar },
  { id: "schedules", title: "schedules", description: "schedulesDescription", icon: FiClock },
] as const

type Section = typeof sections[number]["id"]
const STORAGE_KEY = "admin-dashboard-active-tab"
const oldSections: Record<string, Section> = { utm: "traffic", projectClick: "project-links", jobSearch: "job-search" }
const acceptedButtonSounds = [1, 3, 4, 5, 6, 7, 8, 9]

function playConsoleButtonSound(accepted: boolean) {
  const number = accepted ? acceptedButtonSounds[Math.floor(Math.random() * acceptedButtonSounds.length)] : 2
  playAdminButtonSound(number, accepted ? 0.32 : 0.4)
}

export function AdminDashboardClient({ bookings, cronSchedules, userId, bookingsLoadError = false, cronSchedulesLoadError = false, isGMLive = false }: AdminDashboardClientProps) {
  const t = useScopedI18n("adminConsole")
  const locale = useCurrentLocale()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState<Section>("traffic")
  const [restored, setRestored] = useState(false)
  const [live, setLive] = useState(isGMLive)
  const [livePending, setLivePending] = useState(false)
  const [liveError, setLiveError] = useState(false)
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  const gate = useRef<HTMLDivElement>(null)
  const gateSeam = useRef<HTMLDivElement>(null)
  const [gateBusy, setGateBusy] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const html = document.documentElement
    const previousTheme = html.dataset.theme
    html.dataset.theme = "3d-dot"
    return () => {
      if (previousTheme) html.dataset.theme = previousTheme
      else delete html.dataset.theme
    }
  }, [])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      const next = stored && (oldSections[stored] ?? stored)
      if (sections.some(section => section.id === next)) setActiveSection(next as Section)
    } catch { /* Saved navigation is optional when browser storage is unavailable. */ }
    setRestored(true)
  }, [])

  useEffect(() => {
    if (!restored) return
    try { localStorage.setItem(STORAGE_KEY, activeSection) } catch { /* Storage can be disabled. */ }
  }, [activeSection, restored])

  useEffect(() => { setLive(isGMLive) }, [isGMLive])

  const current = sections.find(section => section.id === activeSection) ?? sections[0]
  const currentIndex = sections.indexOf(current)

  function activateSection(next: Section) {
    if (next === activeSection || gateBusy) return
    playConsoleButtonSound(true)
    const gateElement = gate.current
    const seamElement = gateSeam.current
    if (!gateElement || reducedMotion) {
      setActiveSection(next)
      return
    }
    setGateBusy(true)
    gsap.killTweensOf([gateElement, seamElement])
    const timeline = gsap.timeline({ onComplete: () => setGateBusy(false) })
    timeline.set(gateElement, { opacity: 1, scaleY: 0, transformOrigin: "top center", filter: "brightness(0.72)" })
      .set(seamElement, { opacity: 0, scaleX: 0, transformOrigin: "center" })
      .to(seamElement, { opacity: 1, scaleX: 1, duration: 0.055, ease: "power4.out" })
      .to(gateElement, { scaleY: 1, filter: "brightness(1.18)", duration: 0.22, ease: "power4.in" }, 0)
      .to(seamElement, { opacity: 0.5, duration: 0.07, ease: "none" })
      .to(gateElement, { filter: "brightness(0.9)", duration: 0.08, ease: "none" })
      .call(() => setActiveSection(next))
      .to(gateElement, { scaleY: 0, filter: "brightness(1)", duration: 0.38, delay: 0.2, ease: "power3.out" })
      .to(seamElement, { opacity: 0, scaleX: 0.25, duration: 0.18, ease: "power2.in" }, "<")
  }

  function navigateTabs(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number | undefined
    if (event.key === "ArrowDown" || event.key === "ArrowRight") next = (index + 1) % sections.length
    if (event.key === "ArrowUp" || event.key === "ArrowLeft") next = (index + sections.length - 1) % sections.length
    if (event.key === "Home") next = 0
    if (event.key === "End") next = sections.length - 1
    if (next === undefined) return
    event.preventDefault()
    activateSection(sections[next].id)
    buttons.current[next]?.focus()
  }

  async function toggleLive() {
    if (livePending) return
    setLivePending(true)
    setLiveError(false)
    try { await toggleIsGMAction(); setLive(previous => !previous); router.refresh() }
    catch { playConsoleButtonSound(false); setLiveError(true) }
    finally { setLivePending(false) }
  }

  return <div className="3d-dot relative isolate min-h-dvh overflow-hidden text-[var(--3d-dot-c-eef0f2)]">
    <div className="pointer-events-none fixed inset-0 z-0 opacity-[0.48]" aria-hidden="true"><FullDotReliefSvg /></div>
    <a className="fixed left-lg top-[-100px] z-[100] rounded bg-[var(--3d-dot-c-e2eaf0)] px-md py-sm text-[var(--3d-dot-c-13171a)] focus:top-3" href="#admin-content">{t("skipToContent")}</a>
    <div className="relative z-10 grid h-dvh overflow-hidden laptop:grid-cols-[236px_minmax(0,1fr)]">
    <aside className="relative flex h-auto flex-col overflow-hidden border-b border-[var(--3d-dot-c-3a3f44)] bg-[linear-gradient(110deg,var(--3d-dot-c-22262a),var(--3d-dot-c-1b1e21-55),var(--3d-dot-c-1c1f22)] px-xs py-sm laptop:sticky laptop:top-0 laptop:h-dvh laptop:border-b-0 laptop:border-r laptop:px-xs laptop:py-sm">
      <div className="flex items-center gap-sm px-0 laptop:px-sm"><span className="grid grid-cols-3 gap-xs -rotate-[5deg]" aria-hidden="true">{Array.from({ length: 9 }, (_, i) => <i className="h-[5px] w-[5px] rounded-full bg-[linear-gradient(135deg,var(--3d-dot-c-f1f5f7),var(--3d-dot-c-68727a-52),var(--3d-dot-c-30373c))] shadow-[1px_2px_2px_var(--3d-dot-c-090b0d)]" key={i} />)}</span><span className="text-[13px] font-medium tracking-[-.3px] laptop:text-[15px]">{t("title")}<small className="ml-sm text-[10px] tracking-[.7px] text-[var(--3d-dot-c-929aa2)] laptop:ml-0 laptop:mt-xs laptop:block">nicitaacom</small></span></div>
      <p className="mt-md hidden px-sm font-typewriter text-[10px] uppercase tracking-[1.7px] text-[var(--3d-dot-c-a1a7ae)] laptop:mt-lg laptop:mb-sm laptop:block">{t("workspace")}</p>
      <div className="mt-sm flex flex-wrap gap-xs laptop:mt-0 laptop:flex-col laptop:gap-xs" role="tablist" aria-label={t("navigation")}>
        {sections.map((section, index) => <button type="button" key={section.id} ref={node => { buttons.current[index] = node }}
          role="tab" id={`admin-tab-${section.id}`} aria-controls={`admin-panel-${section.id}`} aria-selected={activeSection === section.id}
          tabIndex={activeSection === section.id ? 0 : -1} onKeyDown={event => navigateTabs(event, index)} onClick={() => activateSection(section.id)} className="flex min-h-10 w-auto items-center gap-xs rounded-md border border-transparent px-sm py-xs text-left text-[11px] text-[var(--3d-dot-c-a6adb3)] hover:bg-[var(--3d-dot-c-292e32)] hover:text-[var(--3d-dot-c-eef0f2)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--3d-dot-c-e8edf1)] laptop:min-h-[45px] laptop:w-full laptop:gap-sm laptop:px-sm laptop:py-sm laptop:text-[13px] aria-[selected=true]:border-[var(--3d-dot-c-363c41)] aria-[selected=true]:bg-[linear-gradient(var(--3d-dot-c-141719),var(--3d-dot-c-1a1e21))] aria-[selected=true]:text-[var(--3d-dot-c-f7f8f9)] aria-[selected=true]:shadow-[inset_0_2px_4px_var(--3d-dot-c-090b0d),0_1px_0_var(--3d-dot-c-434a50)]">
          <section.icon size={17} aria-hidden="true" /><span>{t(section.title)}</span><i className="ml-xs h-[5px] w-[5px] rounded-full bg-[var(--3d-dot-c-f3f5f6)] opacity-0 shadow-[0_0_7px_var(--3d-dot-c-ecf4ff60)] aria-[selected=true]:opacity-100 laptop:ml-auto" aria-hidden="true" />
        </button>)}
      </div>
      <div className="hidden min-h-[60px] overflow-hidden opacity-80 laptop:-mx-md laptop:-mb-xs laptop:mt-auto laptop:block"><DotRelief /></div>
      <div className="absolute right-4 top-5 grid gap-sm text-[10px] laptop:static laptop:border-t laptop:border-[var(--3d-dot-c-363b40)] laptop:px-sm laptop:pt-sm laptop:text-[11px]"><span className="hidden items-center gap-xs text-[var(--3d-dot-c-abb4bb)] laptop:flex"><FiLock size={12} aria-hidden="true" />{t("authenticated")}</span><Link className="flex items-center justify-between gap-xs text-[var(--3d-dot-c-d1d7db)] hover:text-white" href={localizePath("/", locale)}>{t("backToSite")}<FiExternalLink size={13} aria-hidden="true" /></Link></div>
    </aside>
    <div className="flex min-h-0 min-w-0 flex-col">
      <header className="flex min-h-[62px] items-center justify-between gap-xs border-b border-[var(--3d-dot-c-2a2e32)] bg-[var(--3d-dot-c-171a1d)] px-xs py-xs tablet:px-sm laptop:min-h-[72px] laptop:px-sm laptop:py-xs">
        <div className="hidden items-center gap-sm text-[11px] text-[var(--3d-dot-c-969fa6)] tablet:flex"><span>{t("workspace")}</span><FiChevronRight size={12} aria-hidden="true" /><strong className="font-normal text-[var(--3d-dot-c-d9dde0)]">{t(current.title)}</strong></div>
        <div className="flex w-full items-center justify-end gap-md tablet:w-auto">
          <div className="shrink-0"><LanguageDropdown /></div>
          <details className="relative shrink-0"><summary className="flex min-h-10 cursor-pointer items-center gap-xs rounded-[6px] px-xs text-[11px] text-[var(--3d-dot-c-c4cbd1)] transition duration-200 hover:bg-[var(--3d-dot-c-2b3034)] hover:text-[var(--3d-dot-c-f4f7f8)] hover:shadow-[inset_0_1px_0_var(--3d-dot-c-ffffff0c)]" aria-label={t("account")}><FiLock size={14} aria-hidden="true" /><span>{t("account")}</span></summary><div className="absolute right-0 top-[calc(100%+10px)] z-30 w-[min(330px,calc(100vw-32px))] rounded-lg border border-[var(--3d-dot-c-4b5157)] bg-[var(--3d-dot-c-25292d)] px-sm py-sm shadow-[0_16px_40px_var(--3d-dot-c-0008),inset_0_1px_0_var(--3d-dot-c-ffffff0e)]">
            <p className={adminUi.eyebrow}>{t("account")}</p><code className="mt-xs block break-all text-[11px]">{userId}</code>
            <div className="mt-sm flex items-center justify-between gap-sm border-t border-[var(--3d-dot-c-43494f)] pt-sm"><span>{t("gmLive")}<small className="mt-xs block text-[11px] text-[var(--3d-dot-c-a1a7ae)]">{t("gmLiveHelp")}</small></span><button className="h-6 w-[38px] rounded-full border border-[var(--3d-dot-c-5a6269)] bg-[var(--3d-dot-c-121618)] p-xs shadow-[inset_0_2px_4px_var(--3d-dot-c-0008)]" type="button" role="switch" aria-label={t("gmLive")} aria-checked={live} disabled={livePending} onClick={toggleLive}><span className={`block h-4 w-4 rounded-full bg-[linear-gradient(var(--3d-dot-c-a3acb3),var(--3d-dot-c-5d666d))] transition ${live ? "translate-x-[13px] bg-[var(--3d-dot-c-f0f3f5)]" : ""}`} /></button></div>
            {liveError && <p className={`${adminUi.error} mt-sm`} role="alert">{t("actionFailed")}</p>}
          </div></details>
        </div>
      </header>
      <main className="mx-auto flex min-h-0 w-full max-w-[1580px] flex-1 flex-col overflow-hidden px-xs py-xs tablet:px-sm laptop:px-sm laptop:py-xs" id="admin-content" tabIndex={-1}>
        <div className="relative mb-sm flex min-h-[72px] shrink-0 items-center justify-between overflow-hidden"><div className="relative z-10"><p className={adminUi.eyebrow}><span className="mr-sm text-[var(--3d-dot-c-e4e8eb)]">{String(currentIndex + 1).padStart(2, "0")}</span>{t(currentIndex < 3 ? "analytics" : "operations")}</p><h1 className="my-xs !font-primary text-[25px] font-medium leading-tight tracking-[-1.2px] text-[var(--3d-dot-c-eff2f4)] tablet:text-[33px]">{t(current.title)}</h1><p className={`${adminUi.muted} max-w-[310px] text-[11px] tablet:max-w-none tablet:text-[12px]`}>{t(current.description)}</p></div><div className="absolute right-[-8px] top-[-4px] h-20 w-20 opacity-30 [mask-image:linear-gradient(90deg,transparent,black)] tablet:h-24 tablet:w-24 tablet:opacity-50"><DotRelief /></div></div>
        <div className="relative isolate min-h-0 flex-1 overflow-hidden rounded-lg" role="tabpanel" id={`admin-panel-${activeSection}`} aria-labelledby={`admin-tab-${activeSection}`} tabIndex={0}>
          <div ref={gate} className="pointer-events-none absolute inset-0 z-30 origin-top scale-y-0 overflow-hidden border-y border-[var(--3d-dot-c-a9b7c0)] bg-[linear-gradient(90deg,var(--3d-dot-c-101416),var(--3d-dot-c-3b464d-48),var(--3d-dot-c-111518))] shadow-[0_0_30px_var(--3d-dot-c-dbe8f02b),inset_0_1px_0_var(--3d-dot-c-ffffff3b),inset_0_-10px_20px_var(--3d-dot-c-050709a8)]" aria-hidden="true"><DotReliefBackground scale={0.62} /><div ref={gateSeam} className="absolute left-0 top-1/2 h-px w-full bg-[var(--3d-dot-c-e8f6ff)] shadow-[0_0_4px_var(--3d-dot-c-ffffff),0_0_18px_var(--3d-dot-c-b8eaff)]" /></div>
          <div className="relative z-10 h-full">{restored ? <AnimatePresence initial={false} mode="wait"><motion.div className="h-full" key={activeSection} initial={{ opacity: 0, y: 7, filter: "brightness(0.74)" }} animate={{ opacity: 1, y: 0, filter: "brightness(1)" }} exit={{ opacity: 0, y: -4, filter: "brightness(0.8)" }} transition={{ duration: 0.22, ease: "easeOut" }}>
            {activeSection === "traffic" && <UTMStatsDashboardSection />}
            {activeSection === "project-links" && <ProjectClicksDashboardSection />}
            {activeSection === "job-search" && <JobSearchDashboardSection />}
            {activeSection === "bookings" && <BookedAppointmentsSection bookings={bookings} loadError={bookingsLoadError} />}
            {activeSection === "schedules" && <CronSchedulesSection cronSchedules={cronSchedules} loadError={cronSchedulesLoadError} />}
          </motion.div></AnimatePresence> : <div className={`${adminUi.skeleton} min-h-[330px]`} role="status" aria-label={t("refreshing")} />}</div>
        </div>
      </main>
    </div>
    </div>
  </div>
}
