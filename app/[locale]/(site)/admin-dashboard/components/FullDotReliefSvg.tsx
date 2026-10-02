"use client"

import { memo } from "react"
import { DotReliefBackground } from "./DotRelief"

/** Uses the shared seamless tile instead of creating tens of thousands of viewport-sized SVG nodes. */
export const FullDotReliefSvg = memo(function FullDotReliefSvg() {
  return <DotReliefBackground />
})
