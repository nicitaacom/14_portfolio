"use client"

export function StatusBadge({ label, tone }: { label: string; tone: "green" | "red" | "gray" | "blue" }) {
  const toneClassName =
    tone === "green"
      ? "border-success/40 bg-success/10 text-success"
      : tone === "red"
        ? "border-danger/40 bg-danger/10 text-danger"
        : tone === "blue"
          ? "border-info/40 bg-info/10 text-info"
          : "border-secondary-foreground/30 bg-secondary-foreground/10 text-secondary"

  return (
    <span className={`inline-flex shrink-0 rounded-[2px] border px-sm py-[2px] text-xs ${toneClassName}`}>{label}</span>
  )
}
