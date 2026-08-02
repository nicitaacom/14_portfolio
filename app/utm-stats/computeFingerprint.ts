// Machine/OS/display-level signals only - no navigator.userAgent or other browser-identifying
// value, since this layer exists specifically to survive a visitor switching browsers on the
// same physical machine. Including a browser-level signal would change the hash the moment the
// browser changes and defeat the one case this is meant to solve.
function readCanvasRenderHash() {
  const canvas = document.createElement("canvas")
  canvas.width = 220
  canvas.height = 30
  const ctx = canvas.getContext("2d")
  if (!ctx) return ""

  ctx.textBaseline = "top"
  ctx.font = "14px 'Arial'"
  ctx.fillStyle = "#f60"
  ctx.fillRect(0, 0, 220, 30)
  ctx.fillStyle = "#069"
  ctx.fillText("device-fingerprint-14", 2, 2)

  return canvas.toDataURL()
}

function readWebGLRenderer() {
  const canvas = document.createElement("canvas")
  const gl = (canvas.getContext("webgl") ?? canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null
  if (!gl) return ""

  const debugInfo = gl.getExtension("WEBGL_debug_renderer_info")
  if (!debugInfo) return ""

  return String(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
}

async function sha256Hex(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value))
  return Array.from(new Uint8Array(digest))
    .map(byte => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function computeFingerprint() {
  const signals = [
    `${screen.width}x${screen.height}x${screen.colorDepth}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.languages?.join(",") ?? "",
    String(navigator.hardwareConcurrency ?? ""),
    String((navigator as any).deviceMemory ?? ""),
    readWebGLRenderer(),
    readCanvasRenderHash(),
    navigator.platform,
  ]

  return sha256Hex(signals.join("|"))
}
