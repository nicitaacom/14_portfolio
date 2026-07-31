"use client"

import { useEffect, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"
import { IoMdClose } from "react-icons/io"

import { HalloweenFrameOrnaments } from "@/components/Halloween/HalloweenFrameOrnaments"
import { NewYearModalChimney } from "@/components/NewYear/NewYearModalChimney"
import { NewYearModalPullClose } from "@/components/NewYear/NewYearModalPullClose"
import { useSiteTheme } from "@/hooks/useSiteTheme"

interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
  backdropClassName?: string
  title?: string
}

export function ModalContainer({
  isOpen,
  onClose,
  children,
  className,
  backdropClassName,
  title,
}: ModalContainerProps) {
  const [showModal, setShowModal] = useState(isOpen)
  const theme = useSiteTheme()
  const showNewYearCloseBell = theme === "new-year"
  const showNewYearChimney = showNewYearCloseBell && className?.includes("project-more-info-modal")

  /* onOpen - show modal - disable scroll and scrollbar - hide navbar - show bg */
  useEffect(() => {
    setShowModal(isOpen)

    if (isOpen) {
      document.body.style.overflow = "hidden"
      document.body.classList.add("modal-open")
    } else {
      document.body.style.overflow = ""
      document.body.classList.remove("modal-open")
    }

    return () => {
      document.body.style.overflow = ""
      document.body.classList.remove("modal-open")
    }
  }, [isOpen])

  /* onClose - close modal - show navbar - show scrollbar */
  function closeModal() {
    onClose()
    document.body.style.overflow = ""
    document.body.classList.remove("modal-open")
  }

  /* for e.stopPropagation when mousedown on modal and mouseup on modalBg */
  const modalBgHandler = useSwipeable({
    onTouchStartOrOnMouseDown: () => {
      closeModal()
    },
    trackMouse: true,
  })

  const modalHandler = useSwipeable({
    onTouchStartOrOnMouseDown: e => {
      e.event.stopPropagation()
    },
    trackMouse: true,
  })

  return (
    <AnimatePresence>
      {showModal && (
        <motion.div
          className={`site-modal-backdrop fixed inset-[0] z-[222] flex items-end justify-center p-sm tablet:items-center ${
            backdropClassName ?? "bg-[rgba(0,0,0,0.82)]"
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          {...modalBgHandler}>
          <motion.div
            className={`site-modal modal-frame relative z-[100] w-full overflow-visible rounded-[5px] bg-wood p-[9px] shadow-[0_12px_12px_rgb(0_0_0/0.75)] ${className}`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            {...modalHandler}>
            {showNewYearChimney && <NewYearModalChimney />}
            <HalloweenFrameOrnaments variant="modal" />
            <span aria-hidden="true" className="halloween-only halloween-modal-skull" />
            <div aria-hidden="true" className="modal-frame-hardware pointer-events-none absolute inset-[0] z-20">
              <div className="absolute left-[15px] right-[15px] top-[0] h-[9px] rounded-[1px] border border-steel-deep bg-pipe shadow-[0_2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.62)]" />
              <div className="absolute bottom-[0] left-[15px] right-[15px] h-[9px] rounded-[1px] border border-steel-deep bg-pipe shadow-[0_-2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.62)]" />
              <div className="absolute bottom-[15px] left-[0] top-[15px] w-[9px] rounded-[1px] border border-steel-deep bg-pipe shadow-[2px_0_2px_rgb(0_0_0/0.55),inset_1px_0_0_rgb(255_255_255/0.62)]" />
              <div className="absolute bottom-[15px] right-[0] top-[15px] w-[9px] rounded-[1px] border border-steel-deep bg-pipe shadow-[-2px_0_2px_rgb(0_0_0/0.55),inset_-1px_0_0_rgb(255_255_255/0.62)]" />
              <div className="absolute left-[0] top-[0] flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border border-steel-deep bg-pipe shadow-[0_2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.38)]">
                <span className="h-[6px] w-[6px] rounded-full border border-steel-deep bg-paper" />
              </div>
              <div className="absolute right-[0] top-[0] flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border border-steel-deep bg-pipe shadow-[0_2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.38)]">
                <span className="h-[6px] w-[6px] rounded-full border border-steel-deep bg-paper" />
              </div>
              <div className="absolute bottom-[0] left-[0] flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border border-steel-deep bg-pipe shadow-[0_2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.38)]">
                <span className="h-[6px] w-[6px] rounded-full border border-steel-deep bg-paper" />
              </div>
              <div className="absolute bottom-[0] right-[0] flex h-[18px] w-[18px] items-center justify-center rounded-[2px] border border-steel-deep bg-pipe shadow-[0_2px_2px_rgb(0_0_0/0.55),inset_0_1px_0_rgb(255_255_255/0.38)]">
                <span className="h-[6px] w-[6px] rounded-full border border-steel-deep bg-paper" />
              </div>
            </div>
            <div className="modal-frame-surface site-modal-surface relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[1px] bg-[radial-gradient(ellipse_52%_10%_at_18%_14%,hsl(var(--paper)/0.13),transparent_68%),radial-gradient(ellipse_44%_9%_at_74%_67%,hsl(var(--paper)/0.1),transparent_68%),repeating-linear-gradient(1deg,hsl(var(--steel-deep)/0.2)_0_1px,transparent_1px_6px,hsl(var(--paper)/0.045)_7px_9px,transparent_10px_18px),linear-gradient(100deg,hsl(var(--wood)),hsl(var(--brass)/0.48)_48%,hsl(var(--wood)))] shadow-[inset_0_1px_0_rgb(255_255_255/0.13),inset_0_-2px_0_rgb(0_0_0/0.42)]">
              {title && !showNewYearCloseBell && (
                <div
                  className="modal-title-label absolute left-1/2 top-[-2px] z-20 max-w-[60%] -translate-x-1/2 rotate-[-1deg] truncate border border-brass/50 bg-[linear-gradient(100deg,hsl(var(--paper)),hsl(var(--paper)/0.8))] px-md py-[3px] font-typewriter text-xs uppercase tracking-[0.14em] text-steel-deep shadow-[0_4px_5px_rgb(0_0_0/0.45),inset_0_1px_0_rgb(255_255_255/0.62)]">
                  {title}
                </div>
              )}
              {showNewYearCloseBell ? (
                <NewYearModalPullClose ariaLabel="Close modal" onClose={closeModal} />
              ) : (
                <button
                  type="button"
                  aria-label="Close modal"
                  className="site-modal-close plaque absolute right-[10px] top-[10px] z-30 flex h-9 w-9 items-center justify-center !p-0 text-secondary-foreground/70 hover:text-secondary"
                  style={{ top: 10, right: 10, left: "auto", bottom: "auto" }}
                  onClick={closeModal}>
                  <IoMdClose size={34} />
                </button>
              )}
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
