"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ThemeSelector } from "@/components/theme-selector"
import { Instagram, Home, Clock, Users } from "lucide-react"
import { useKonami } from "@/lib/konami-context"

export function Navbar() {
  const pathname = usePathname()
  const { konamiUnlocked } = useKonami()

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur-md supports-[backdrop-filter]:bg-card/90 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-bold text-xl hover:text-primary transition-colors">
            Art Portfolio
          </Link>

          <div className="hidden md:flex gap-2">
            <Button
              variant={pathname === "/" ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-all duration-200"
            >
              <Link href="/">
                <Home className="w-4 h-4 mr-2" />
                Gallery
              </Link>
            </Button>
            <Button
              variant={pathname === "/journey" ? "default" : "ghost"}
              size="sm"
              asChild
              className="transition-all duration-200"
            >
              <Link href="/journey">
                <Clock className="w-4 h-4 mr-2" />
                My Journey
              </Link>
            </Button>
            {konamiUnlocked && (
              <Button
                variant={pathname === "/collab" ? "default" : "ghost"}
                size="sm"
                asChild
                className="transition-all duration-200"
              >
                <Link href="/collab">
                  <Users className="w-4 h-4 mr-2" />
                  Collab
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            asChild
            className="transition-all duration-300 hover:scale-105 bg-transparent"
          >
            <a
              href="https://instagram.com/hypernova_art823"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </Button>

          <ThemeSelector />
        </div>
      </div>

      {/* Mobile navigation */}
      <div className="md:hidden flex gap-2 px-4 pb-3">
        <Button variant={pathname === "/" ? "default" : "ghost"} size="sm" asChild className="flex-1">
          <Link href="/">
            <Home className="w-4 h-4 mr-2" />
            Gallery
          </Link>
        </Button>
        <Button variant={pathname === "/journey" ? "default" : "ghost"} size="sm" asChild className="flex-1">
          <Link href="/journey">
            <Clock className="w-4 h-4 mr-2" />
            Journey
          </Link>
        </Button>
        {konamiUnlocked && (
          <Button variant={pathname === "/collab" ? "default" : "ghost"} size="sm" asChild className="flex-1">
            <Link href="/collab">
              <Users className="w-4 h-4 mr-2" />
              Collab
            </Link>
          </Button>
        )}
      </div>
    </nav>
  )
}
