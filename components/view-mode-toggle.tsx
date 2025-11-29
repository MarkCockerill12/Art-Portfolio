"use client"

import { Button } from "@/components/ui/button"
import { Grid3x3, List } from "lucide-react"
import type { ViewMode } from "@/lib/types"

interface ViewModeToggleProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewModeToggle({ viewMode, onViewModeChange }: ViewModeToggleProps) {
  return (
    <div className="flex gap-1 bg-background/60 backdrop-blur-md border border-border/50 p-1 rounded-lg">
      <Button
        variant={viewMode === "grid" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("grid")}
        className="transition-all duration-200"
      >
        <Grid3x3 className="w-4 h-4 mr-2" />
        Grid
      </Button>
      <Button
        variant={viewMode === "timeline" ? "default" : "ghost"}
        size="sm"
        onClick={() => onViewModeChange("timeline")}
        className="transition-all duration-200"
      >
        <List className="w-4 h-4 mr-2" />
        Timeline
      </Button>
    </div>
  )
}
