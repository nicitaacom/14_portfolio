"use client"

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from "react"

export interface NavbarWavesHandle {
  setScrollPosition: (scrollPosition: number) => void
}

export const NavbarWaves = forwardRef<NavbarWavesHandle>(function NavbarWaves(_, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scrollPositionRef = useRef(0)

  const drawWaves = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const bounds = canvas.getBoundingClientRect()
    const devicePixelRatio = window.devicePixelRatio || 1
    const width = Math.round(bounds.width)
    const height = Math.round(bounds.height)

    if (!width || !height) return

    if (canvas.width !== width * devicePixelRatio || canvas.height !== height * devicePixelRatio) {
      canvas.width = width * devicePixelRatio
      canvas.height = height * devicePixelRatio
    }

    const context = canvas.getContext("2d")
    if (!context) return

    context.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0)
    context.clearRect(0, 0, width, height)

    const gridSpacing = 28
    context.strokeStyle = "rgba(220, 210, 230, 0.055)"
    context.lineWidth = 1

    for (let x = 0; x <= width; x += gridSpacing) {
      context.beginPath()
      context.moveTo(x, 0)
      context.lineTo(x, height)
      context.stroke()
    }

    for (let y = 0; y <= height; y += gridSpacing) {
      context.beginPath()
      context.moveTo(0, y)
      context.lineTo(width, y)
      context.stroke()
    }

    const phase = scrollPositionRef.current * 0.038
    const drawTrace = ({
      amplitude,
      period,
      offset,
      rotation,
      strokeStyle,
    }: {
      amplitude: number
      period: number
      offset: number
      rotation: number
      strokeStyle: string
    }) => {
      context.save()
      context.translate(width / 2, height / 2)
      context.rotate((rotation * Math.PI) / 180)
      context.translate(-width / 2, -height / 2)
      context.beginPath()

      for (let x = -height; x <= width + height; x += 2) {
        const y = height / 2 + Math.sin((x / period) * Math.PI * 2 + phase + offset) * amplitude
        if (x === -height) context.moveTo(x, y)
        else context.lineTo(x, y)
      }

      context.strokeStyle = strokeStyle
      context.lineWidth = 1.2
      context.stroke()
      context.restore()
    }

    drawTrace({ amplitude: height * 0.22, period: 138, offset: 0, rotation: -4, strokeStyle: "rgba(238, 234, 244, 0.075)" })
    drawTrace({ amplitude: height * 0.14, period: 94, offset: Math.PI / 2, rotation: 5.5, strokeStyle: "rgba(238, 234, 244, 0.055)" })
  }, [])

  useImperativeHandle(
    ref,
    () => ({
      setScrollPosition(scrollPosition) {
        scrollPositionRef.current = scrollPosition
        drawWaves()
      },
    }),
    [drawWaves],
  )

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const resizeObserver = new ResizeObserver(drawWaves)
    resizeObserver.observe(canvas)
    drawWaves()

    return () => resizeObserver.disconnect()
  }, [drawWaves])

  return <canvas ref={canvasRef} className="navbar-wave-canvas" aria-hidden="true" />
})
