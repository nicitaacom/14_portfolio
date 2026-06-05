import { RefObject, useEffect } from "react"

export const useCloseOnClickOutside = (divRef: RefObject<HTMLDivElement | null>, closeFn: () => void) => {
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (e.target instanceof Element) {
        if (!divRef.current?.contains(e.target)) {
          closeFn()
        }
      }
    }

    document.addEventListener("mousedown", handler)

    return () => {
      document.removeEventListener("mousedown", handler)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
