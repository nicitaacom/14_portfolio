import "./globals.css"

import type { Metadata } from "next"
import { Inter } from "next/font/google"
import { nanoid } from "nanoid"

import Layout from "./components/Layout"
import { Navbar } from "./components/Navbar/Navbar"
import Script from "next/script"
import { UTMTracker } from "./utm-stats/UTMTracker"

const inter = Inter({ subsets: ["latin"], preload: true })

export const metadata: Metadata = {
  title: "Portfolio t.me/nicitaacom",
  description: "https://t.me/nicitaacom",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
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
      <body className={`${inter.className} hide-scrollbar`}>
        <noscript>
          {/* Fallback for browsers with disabled JavaScript */}
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=AW-11303856122"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>
        <Navbar />
        <UTMTracker userId={`14-${nanoid()}`} />
        <Layout>{children}</Layout>
      </body>
    </html>
  )
}
