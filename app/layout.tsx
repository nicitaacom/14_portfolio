import "./globals.css"
import "./styles/theme-core.css"
import "./styles/theme-crazy-mechanics.css"
import "./styles/theme-halloween.css"
import "./styles/theme-new-year.css"

import type { Metadata } from "next"
import Script from "next/script"

import { SeasonalThemeLifecycle } from "@/components/SeasonalThemeLifecycle"
import { resolveSeasonalTheme } from "@/utils/resolveSeasonalTheme"

export const metadata: Metadata = {
  title: "nicitaacom | Portfolio",
  description:
    "Portfolio of Nikita - Teamlead WEB developer. 8 years of experience - Get results or you don't pay - Russian / Ukrainian / English / German / Polish",
  icons: {
    icon: "/favicon.png",
  },
}

const seasonalThemesByMonth = Array.from({ length: 12 }, (_, monthIndex) => resolveSeasonalTheme(monthIndex + 1))

const seasonalThemeInitScript = `
  (() => {
    const month = new Date().getMonth() + 1;
    const themesByMonth = ${JSON.stringify(seasonalThemesByMonth)};
    const theme = themesByMonth[month - 1] || "default";
    document.documentElement.dataset.theme = theme;
  })();
`

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-theme="default" suppressHydrationWarning>
      <head>
        <Script id="seasonal-theme" strategy="beforeInteractive">
          {seasonalThemeInitScript}
        </Script>
        {/* Add Google Tag Manager script */}
        <Script
          id="google-tag-manager"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
              new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
              j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
              'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
              })(window,document,'script','dataLayer','AW-11303856122');
            `,
          }}
        />
      </head>
      <body className="hide-scrollbar font-sans">
        <SeasonalThemeLifecycle />
        <noscript>
          {/* Fallback for browsers with disabled JavaScript */}
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=AW-11303856122"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>
        {children}
      </body>
    </html>
  )
}
