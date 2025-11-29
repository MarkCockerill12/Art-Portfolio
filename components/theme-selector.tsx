"use client"

import { useTheme } from "@/lib/theme-context"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Palette } from "lucide-react"
import type { Theme } from "@/lib/types"

const themes: { value: Theme; label: string; emoji: string }[] = [
  { value: "light", label: "Light Mode", emoji: "☀️" },
  { value: "dark", label: "Dark Mode", emoji: "🌙" },
  { value: "windowsxp", label: "Windows XP", emoji: "🪟" },
  { value: "frutiger-aero", label: "Frutiger Aero", emoji: "💎" },
  { value: "frutiger-eco", label: "Frutiger Eco", emoji: "🌿" },
  { value: "macos", label: "macOS", emoji: "🍎" },
  { value: "gameboy", label: "Game Boy", emoji: "🎮" },
  { value: "vaporwave", label: "Vaporwave", emoji: "🌴" },
]

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()

  const currentTheme = themes.find((t) => t.value === theme)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="relative overflow-hidden transition-all duration-300 hover:scale-105 bg-transparent"
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
  )
}
