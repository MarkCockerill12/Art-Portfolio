"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import { useToast } from "@/hooks/use-toast"
import confetti from "canvas-confetti"

interface KonamiContextType {
  konamiUnlocked: boolean
}

const KonamiContext = createContext<KonamiContextType | undefined>(undefined)

export function KonamiProvider({ children }: { children: React.ReactNode }) {
  const [konamiUnlocked, setKonamiUnlocked] = useState(false)
  const [konamiSequence, setKonamiSequence] = useState<string[]>([])
  const { toast } = useToast()

  const konamiCode = [
    "ArrowUp",
    "ArrowUp",
    "ArrowDown",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
    "ArrowLeft",
    "ArrowRight",
    "b",
    "a",
  ]

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const newSequence = [...konamiSequence, e.key]

      // Keep only the last 10 keys
      if (newSequence.length > 10) {
        newSequence.shift()
      }

      setKonamiSequence(newSequence)

      // Check if the sequence matches the Konami code
      const matches = konamiCode.every((key, index) => key === newSequence[index])

      if (matches && newSequence.length === 10 && !konamiUnlocked) {
        setKonamiUnlocked(true)

        // Epic celebration
        const duration = 5000
        const animationEnd = Date.now() + duration
        const defaults = { startVelocity: 50, spread: 360, ticks: 120, zIndex: 9999 }

        const interval = setInterval(() => {
          const timeLeft = animationEnd - Date.now()

          if (timeLeft <= 0) {
            clearInterval(interval)
            return
          }

          const particleCount = 100

          confetti({
            ...defaults,
            particleCount,
            origin: { x: Math.random(), y: Math.random() - 0.2 },
            colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF4500", "#9370DB", "#00FF00"],
          })
        }, 100)

        toast({
          title: "🎮 Secret Unlocked!",
          description: "You've discovered the Konami code! Secret artworks and features are now visible.",
          duration: 5000,
        })
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [konamiSequence, konamiUnlocked, toast])

  return (
    <KonamiContext.Provider value={{ konamiUnlocked }}>
      {children}
    </KonamiContext.Provider>
  )
}

export function useKonami() {
  const context = useContext(KonamiContext)
  if (context === undefined) {
    throw new Error("useKonami must be used within a KonamiProvider")
  }
  return context
}
