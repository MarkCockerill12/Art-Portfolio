"use client"

import { useState, useEffect } from "react"
import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"
import type { Theme } from "@/lib/types"

const themes: { value: Theme; label: string; emoji: string }[] = [
  { value: "light", label: "Light Mode", emoji: "☀️" },
  { value: "dark", label: "Dark Mode", emoji: "🌙" },
  { value: "windowsxp", label: "Windows XP", emoji: "💻" },
  { value: "frutiger-aero", label: "Frutiger Aero", emoji: "💎" },
  { value: "frutiger-eco", label: "Frutiger Eco", emoji: "🌿" },
  { value: "macos", label: "macOS", emoji: "🍎" },
  { value: "gameboy", label: "Game Boy", emoji: "🎮" },
  { value: "vaporwave", label: "Vaporwave", emoji: "🌴" },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const [showPopup, setShowPopup] = useState(false)

  useEffect(() => {
    // Check if user has seen the popup
    const hasSeenPopup = localStorage.getItem("hasSeenThemePopup")

    if (!hasSeenPopup) {
      // Show popup after 1 second
      const showTimer = setTimeout(() => {
        setShowPopup(true)
        localStorage.setItem("hasSeenThemePopup", "true")
      }, 1000)

      // Hide popup after 6 seconds (5 seconds visible)
      const hideTimer = setTimeout(() => {
        setShowPopup(false)
      }, 6000)

      return () => {
        clearTimeout(showTimer)
        clearTimeout(hideTimer)
      }
    }
  }, [])

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="icon"
            className="relative overflow-hidden transition-all duration-300 hover:scale-105 bg-transparent"
            onClick={() => setShowPopup(false)}
          >
            <Palette className="h-5 w-5" />
            <span className="sr-only">Select theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {themes.map((t) => (
            <DropdownMenuItem
              key={t.value}
              onClick={() => setTheme(t.value)}
              className={theme === t.value ? "bg-accent" : ""}
            >
              <span className="mr-2">{t.emoji}</span>
              {t.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Popup Notification */}
      <div
        className={`absolute top-full right-0 mt-3 w-max max-w-[200px] bg-popover text-popover-foreground text-xs font-medium px-3 py-2 rounded-md shadow-lg border border-border pointer-events-none transition-all duration-500 z-50 ${
          showPopup ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
        }`}
      >
        <div className="absolute -top-1 right-3 w-2 h-2 bg-popover border-t border-l border-border rotate-45" />
        Try out the different themes!
      </div>
    </div>
  )
}
