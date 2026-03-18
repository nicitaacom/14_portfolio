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
    }
  }, [isOpen])

  /* onClose - close modal - show navbar - show scrollbar */
  function closeModal() {
    onClose()
    document.body.removeAttribute("style")
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
          className="fixed inset-[0] z-[222] flex items-end justify-center bg-[rgba(0,0,0,0.55)] p-sm backdrop-blur-[10px] tablet:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          {...modalBgHandler}>
          <motion.div
            className={`relative z-[100] w-full overflow-hidden rounded-[28px] border border-secondary-foreground/70 bg-primary shadow-[0_32px_90px_rgba(0,0,0,0.45)] ${className}`}
            initial={{ scale: 0.75, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            {...modalHandler}>
            <IoMdClose
              className="absolute right-sm top-sm z-20 rounded-full border border-[#777777] bg-primary/80 p-[6px] text-secondary-foreground transition-colors duration-300 hover:border-cta hover:text-secondary"
              size={34}
              onClick={closeModal}
            />
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
