import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./app/**/*.{tsx,mdx}"],
  theme: {
    fontFamily: {
      holiday: ["var(--font-holiday)", "Georgia", "serif"],
      primary: ["var(--font-inter)", "Inter", "sans-serif"],
      typewriter: ["var(--font-typewriter)", "monospace"],
    },
    fontSize: {
      xs: "clamp(0.72rem, 0.68rem + 0.18vw, 0.82rem)",
      sm: "clamp(0.92rem, 0.88rem + 0.24vw, 1rem)",
      base: "clamp(1rem, 0.97rem + 0.24vw, 1.08rem)",
      lg: "clamp(1.3rem, 1.05rem + 0.95vw, 1.85rem)",
      xl: "clamp(1.8rem, 1.35rem + 1.6vw, 2.8rem)",
    },
    spacing: {
      // Keeps the *-0 utilities alive: this scale replaces Tailwind's default,
      // and minWidth/inset/padding all derive from it
      0: "0px",
      xs: "clamp(0.25rem, 0.1364rem + 0.5682vw, 0.5rem)", //320-1024px
      sm: "clamp(0.5rem, 0.3864rem + 0.5682vw, 0.75rem)", //320-1024px
      md: "1rem",
      lg: "clamp(1.5rem, 1.15rem + 1.2vw, 3rem)",
      xl: "clamp(2rem, 1.45rem + 1.9vw, 4rem)",
    },
    screens: {
      tablet: "768px",
      // => @media (min-width: 768px) { ... }
      laptop: "1024px",
      // => @media (min-width: 1024px) { ... }
      desktop: "1440px",
      // => @media (min-width: 1440px) { ... }
    },
    extend: {
      colors: {
        primary: "hsl(var(--primary) / 1)",
        "primary-foreground": "hsl(var(--primary-foreground) / 1)",
        secondary: "hsl(var(--secondary) / 1)",
        "secondary-foreground": "hsl(var(--secondary-foreground) / 1)",
        cta: "hsl(var(--cta) / 1)",
        "cta-tooltip": "hsl(var(--cta-tooltip) / 0.2)",

        info: "hsl(var(--info) / 1)",
        warning: "hsl(var(--warning) / 1)",
        danger: "hsl(var(--danger) / 1)",
        success: "hsl(var(--success) / 1)",
        steel: "hsl(var(--steel) / 1)",
        "steel-deep": "hsl(var(--steel-deep) / 1)",
        wood: "hsl(var(--wood) / 1)",
        brass: "hsl(var(--brass) / 1)",
        paper: "hsl(var(--paper) / 1)",
        pipe: "hsl(var(--pipe) / 1)",
        blueprint: "hsl(var(--blueprint) / 1)",
        room: "hsl(var(--room) / 1)",

        /* Theme-specific semantic colors */
        "theme-trim": "var(--theme-trim)",
        "theme-trim-strong": "var(--theme-trim-strong)",
        "theme-label-bg": "var(--theme-label-background)",
        "theme-control-bg": "var(--theme-control-background)",
        "theme-panel-bg": "var(--theme-panel-background)",
        "theme-inset-bg": "var(--theme-inset-background)",
        "theme-board-bg": "var(--theme-board-background)",
        "theme-frame-bg": "var(--theme-frame-background)",
        "theme-project-bg": "var(--theme-project-background)",
        "theme-project-info-bg": "var(--theme-project-info-background)",
        "theme-input-bg": "var(--theme-input-background)",
        "theme-modal-frame-bg": "var(--theme-modal-frame-background)",
        "theme-modal-surface-bg": "var(--theme-modal-surface-background)",
        "theme-appointment-bg": "var(--theme-appointment-background)",
        "theme-appointment-modal-bg": "var(--theme-appointment-modal-background)",
        "theme-loading-bg": "var(--theme-loading-background)",
        "theme-navbar-bg": "var(--theme-navbar-background)",
      },
      borderColor: {
        theme: {
          trim: "var(--theme-trim)",
          "trim-strong": "var(--theme-trim-strong)",
        },
      },
      borderRadius: {
        theme: "var(--theme-radius)",
      },
      boxShadow: {
        "theme-cast": "var(--theme-cast-shadow)",
        "theme-drop": "var(--theme-panel-drop-shadow)",
      },
      opacity: {
        "theme-hardware": "var(--theme-hardware-opacity)",
        "theme-fastener": "var(--theme-fastener-opacity)",
      },
      rotate: {
        "theme": "var(--theme-label-rotation)",
      },
    },
  },
  plugins: [],
}
export default config
