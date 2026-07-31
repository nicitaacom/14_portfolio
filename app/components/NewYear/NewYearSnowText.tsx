"use client"

import { useLayoutEffect, useRef } from "react"

interface NewYearSnowTextProps {
  text: string
}

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function NewYearSnowText({ text }: NewYearSnowTextProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    const fontSize = 26
    const font = `700 ${fontSize}px system-ui, sans-serif`
    const measureContext = document.createElement("canvas").getContext("2d")
    if (!measureContext) return

    measureContext.font = font
    const width = Math.ceil(measureContext.measureText(text).width + 10)
    const height = 36
    const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
    const mask = document.createElement("canvas")
    const maskContext = mask.getContext("2d", { willReadFrequently: true })
    if (!maskContext) return

    canvas.style.width = `${width}px`
    canvas.style.height = `${height}px`
    canvas.width = Math.ceil(width * pixelRatio)
    canvas.height = Math.ceil(height * pixelRatio)
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)

    mask.width = width
    mask.height = height
    maskContext.font = font
    maskContext.textBaseline = "middle"
    maskContext.fillStyle = "#fff"
    maskContext.fillText(text, 4, height / 2 + 1)

    const pixels = maskContext.getImageData(0, 0, width, height).data
    const seed = [...text].reduce((value, character) => value * 31 + character.charCodeAt(0), 2166136261)
    const random = createRandom(seed)

    context.clearRect(0, 0, width, height)
    context.shadowColor = "rgb(103 151 174 / 0.42)"
    context.shadowBlur = 2
    context.shadowOffsetY = 1

    for (let y = 2; y < height - 2; y += 2) {
      for (let x = 2; x < width - 2; x += 2) {
        const alpha = pixels[(y * width + x) * 4 + 3]
        if (alpha < 72 || random() < 0.12) continue

        const radius = 0.65 + random() * 0.75
        context.beginPath()
        context.arc(x + (random() - 0.5) * 0.8, y + (random() - 0.5) * 0.65, radius, 0, Math.PI * 2)
        context.fillStyle = random() > 0.28 ? "#f7fcff" : "#cfe3ed"
        context.fill()
      }
    }
  }, [text])

  return <canvas ref={canvasRef} className="new-year-snow-text" aria-hidden="true" />
}
