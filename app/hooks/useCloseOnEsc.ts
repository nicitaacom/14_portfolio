import { useEffect } from "react"

export const useCloseOnEsc = (closeFn: () => void) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeFn()
      }
    }

    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      if (typeof document !== "undefined") {
        document.removeEventListener("keydown", handleKeyDown)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
