"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import type { Theme } from "@/lib/types"

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark")

  useEffect(() => {
    const savedTheme = localStorage.getItem("art-portfolio-theme") as Theme
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("art-portfolio-theme", theme)
    const themes: Theme[] = [
      "light",
      "dark",
      "windowsxp",
      "frutiger-aero",
      "frutiger-eco",
      "macos",
      "gameboy",
      "vaporwave",
    ]
    themes.forEach((t) => document.body.classList.remove(`theme-${t}`))
    document.body.classList.add(`theme-${theme}`)
  }, [theme])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}
