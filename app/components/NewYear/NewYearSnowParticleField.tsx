"use client"

import { useLayoutEffect, useRef } from "react"

function createRandom(seed: number) {
  let value = seed >>> 0

  return () => {
    value = (value * 1664525 + 1013904223) >>> 0
    return value / 4294967296
  }
}

export function NewYearSnowParticleField({ seedText }: { seedText: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const context = canvas?.getContext("2d")
    if (!canvas || !context) return

    let cancelled = false

    const draw = () => {
      if (cancelled) return

      const height = 64
      const baseFontSize = 28
      const baseTracking = 3
      const characters = Array.from(seedText)
      const measureContext = document.createElement("canvas").getContext("2d")
      if (!measureContext) return

      measureContext.font = `400 ${baseFontSize}px "Comic Sans MS", "Bradley Hand", cursive`
      const baseTextWidth =
        characters.reduce((total, character) => total + measureContext.measureText(character).width, 0) +
        Math.max(0, characters.length - 1) * baseTracking
      const width = Math.min(620, Math.max(320, Math.ceil(baseTextWidth + 64)))
      const textScale = Math.min(1, (width - 28) / baseTextWidth)
      const fontSize = baseFontSize * textScale
      const tracking = baseTracking * textScale
      const font = `400 ${fontSize}px "Comic Sans MS", "Bradley Hand", cursive`
      const pixelRatio = Math.min(window.devicePixelRatio || 1, 2)
      const seed = [...seedText].reduce((value, character) => value * 31 + character.charCodeAt(0), 2166136261)
      const random = createRandom(seed)
      const edgeRandom = createRandom(seed ^ 0x9e3779b9)
      const mask = document.createElement("canvas")
      const maskContext = mask.getContext("2d", { willReadFrequently: true })
      if (!maskContext) return

      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      canvas.width = width * pixelRatio
      canvas.height = height * pixelRatio
      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0)
      context.clearRect(0, 0, width, height)

      mask.width = width
      mask.height = height
      maskContext.font = font
      maskContext.fillStyle = "#fff"
      maskContext.textAlign = "left"
      maskContext.textBaseline = "middle"
      const textWidth =
        characters.reduce((total, character) => total + maskContext.measureText(character).width, 0) +
        Math.max(0, characters.length - 1) * tracking
      let characterX = (width - textWidth) / 2

      characters.forEach(character => {
        maskContext.fillText(character, characterX, height / 2 + 1)
        characterX += maskContext.measureText(character).width + tracking
      })
      const carvedText = maskContext.getImageData(0, 0, width, height).data

      context.shadowColor = "rgb(101 151 175 / 0.42)"
      context.shadowBlur = 1.8
      context.shadowOffsetY = 0.8

      const edgeStep = 5
      const edgePoints = Array.from({ length: Math.ceil(height / edgeStep) + 2 }, (_, index) => {
        const bite = index % 4 === 2 ? edgeRandom() * 10 : 0
        return width - 3 - edgeRandom() * 22 - bite
      })

      for (let y = 0.5; y < height; y += 1.25) {
        for (let x = 0.5; x < width - 1; x += 1.25) {
          const maskX = Math.min(width - 1, Math.round(x))
          const maskY = Math.min(height - 1, Math.round(y))
          const insideLetter = carvedText[(maskY * width + maskX) * 4 + 3] > 28
          const progress = x / width
          const centerY = height / 2 + Math.sin(progress * 11.5 + 0.4) * 0.7
          const halfHeight = height / 2 + 2 + Math.sin(progress * 19) * 0.7
          const edgeDistance = Math.abs(y - centerY) / halfHeight
          const packedEdge = 0.9 + Math.max(0, Math.min(1, (1 - edgeDistance) * 8)) * 0.1
          const edgeIndex = Math.floor(y / edgeStep)
          const edgeMix = (y % edgeStep) / edgeStep
          const rightEdge = edgePoints[edgeIndex] * (1 - edgeMix) + edgePoints[edgeIndex + 1] * edgeMix
          const edgeFeather = Math.max(0, Math.min(1, (rightEdge - x) / 11))
          const density = (0.995 - Math.pow(progress, 1.35) * 0.68) * packedEdge * edgeFeather

          if (insideLetter || random() > density) continue

          const radius = 0.42 + random() * 0.78
          context.beginPath()
          context.arc(x + (random() - 0.5) * 0.7, y + (random() - 0.5) * 0.7, radius, 0, Math.PI * 2)
          context.fillStyle = random() > 0.22 ? `rgb(247 252 255 / ${0.72 + random() * 0.28})` : "rgb(190 218 231 / 0.78)"
          context.fill()
        }
      }
    }

    document.fonts.ready.then(draw)

    return () => {
      cancelled = true
    }
  }, [seedText])

  return <canvas ref={canvasRef} className="new-year-snow-particle-field" aria-hidden="true" />
}
