"use client"

import { Button } from "@/components/Button"
import { useIsGMLive } from "@/store/useIsGMLive"

export function IsGMLive() {
  const { isGMLive } = useIsGMLive()
  return (
    <>
      {isGMLive && (
        <>
          <Button className="font-bold" href="https://meet.google.com/yiy-pbnd-ygo" target="_blank">
            Join google meets now
          </Button>
          <span>or</span>
        </>
      )}
    </>
  )
}
