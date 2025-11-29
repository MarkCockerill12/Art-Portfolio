import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/lib/theme-context"
import { KonamiProvider } from "@/lib/konami-context"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  // <CHANGE> Updated metadata for art portfolio
  title: "Art Portfolio | Creative Journey",
  description:
    "A vibrant showcase of my artistic journey, featuring digital art, character designs, and creative experiments. Computing science student with a passion for games, anime, and visual storytelling.",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {/* <CHANGE> Wrapped app in ThemeProvider */}
        <ThemeProvider>
          <KonamiProvider>
            {children}
            <Toaster />
          </KonamiProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
