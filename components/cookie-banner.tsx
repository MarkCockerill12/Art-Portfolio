"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, Cookie } from "lucide-react"

export function CookieBanner() {
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem("art-portfolio-cookie-consent")
    if (!consent) {
      // Small delay for entrance animation feel
      const timer = setTimeout(() => setIsOpen(true), 1500)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem("art-portfolio-cookie-consent", "accepted")
    setIsOpen(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="bg-card/95 backdrop-blur-md border border-border shadow-2xl rounded-xl p-5 flex flex-col gap-4 relative overflow-hidden">
        {/* Subtle premium accent top glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary/50 via-primary to-accent/50" />
        
        <div className="flex gap-3 items-start">
          <div className="bg-primary/10 rounded-full p-2 text-primary shrink-0 mt-0.5">
            <Cookie className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-base mb-1">Cookie & Storage Consent</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              This website uses cookies and local storage.
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsOpen(false)}
            className="text-muted-foreground hover:text-foreground h-8 w-8 rounded-full shrink-0 -mt-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex justify-end gap-2 shrink-0">
          <Button
            onClick={handleAccept}
            size="sm"
            className="text-xs font-semibold px-4 transition-transform hover:scale-105 active:scale-95"
          >
            Got it
          </Button>
        </div>
      </div>
    </div>
  )
}
