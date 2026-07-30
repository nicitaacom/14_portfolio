import { Fraunces, Inter, Special_Elite } from "next/font/google"

export const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" })
export const specialElite = Special_Elite({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-typewriter",
  display: "swap",
})
/* The New Year display face. A high-contrast serif suits the watercolour and lo-fi
   references, where Inter's neutral grotesque reads as office software. Headings and gift
   tags take it; body text stays Inter, the same split Halloween uses for its typewriter.
   The SOFT axis is requested so the theme CSS can round the terminals off the default cut —
   a painted letterform rather than an engraved one */
export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-holiday",
  display: "swap",
  axes: ["SOFT"],
})
