"use client"

import { useEffect, useState } from "react"

import { AnimatePresence, motion } from "framer-motion"
import { useSwipeable } from "react-swipeable"
import { IoMdClose } from "react-icons/io"

interface ModalContainerProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
  className?: string
}

export function ModalContainer({ isOpen, onClose, children, className }: ModalContainerProps) {
  const [showModal, setShowModal] = useState(isOpen)

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
          className="fixed inset-[0] z-[222] flex items-end justify-center bg-[rgba(0,0,0,0.82)] p-sm tablet:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          {...modalBgHandler}>
          <motion.div
            className={`relative z-[100] w-full overflow-hidden rounded-md border border-secondary-foreground/70 bg-primary shadow-[0_32px_90px_rgba(0,0,0,0.45)] ${className}`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            {...modalHandler}>
            <button
              type="button"
              aria-label="Close modal"
              className="absolute z-20 flex h-10 w-10 items-center justify-center text-secondary-foreground/70 transition-colors duration-300 hover:text-secondary"
              style={{ top: 0, right: 0, left: "auto", bottom: "auto" }}
              onClick={closeModal}>
              <IoMdClose size={34} />
            </button>
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
