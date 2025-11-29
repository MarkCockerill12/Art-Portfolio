"use client"

import { useState, useMemo } from "react"
import { Navbar } from "@/components/navbar"
import { ArtworkCard } from "@/components/artwork-card"
import { ViewModeToggle } from "@/components/view-mode-toggle"
import { ArtworkModal } from "@/components/artwork-modal"
import { FilterPanel } from "@/components/filter-panel"
import { SortDropdown, type SortOption } from "@/components/sort-dropdown"
import { myArtwork, secretArtwork } from "@/lib/my-artwork"
import type { ViewMode, Artwork } from "@/lib/types"
import { useKonami } from "@/lib/konami-context"

export default function GalleryPage() {
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("date-desc")
  const { konamiUnlocked } = useKonami()

  const [filters, setFilters] = useState({
    software: [] as string[],
    genre: [] as string[],
    isDigital: null as boolean | null,
    favoritesOnly: false,
  })

  const allArtwork = useMemo(() => {
    return konamiUnlocked ? [...myArtwork, ...secretArtwork] : myArtwork
  }, [konamiUnlocked])

  const filteredAndSortedArtwork = useMemo(() => {
    let result = [...allArtwork]

    // Apply filters
    if (filters.software.length > 0) {
      result = result.filter((art) => art.software && filters.software.includes(art.software))
    }

    if (filters.genre.length > 0) {
      result = result.filter((art) => art.genre && filters.genre.includes(art.genre))
    }

    if (filters.isDigital !== null) {
      result = result.filter((art) => art.isDigital === filters.isDigital)
    }

    if (filters.favoritesOnly) {
      result = result.filter((art) => art.isFavorite)
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date).getTime() - new Date(a.date).getTime()
        case "date-asc":
          return new Date(a.date).getTime() - new Date(b.date).getTime()
        case "title-asc":
          return a.title.localeCompare(b.title)
        case "title-desc":
          return b.title.localeCompare(a.title)
        default:
          return 0
      }
    })

    return result
  }, [filters, sortBy, allArtwork])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">look some art stuff</h1>

        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4 mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="bg-background/60 backdrop-blur-md px-4 py-2 rounded-full border border-border/50 shadow-sm">
              <p className="text-sm text-muted-foreground font-medium">
                {filteredAndSortedArtwork.length} of {allArtwork.length} artworks •{" "}
                {allArtwork.filter((a) => a.isFavorite).length} favorites
                {konamiUnlocked && <span className="ml-2 text-yellow-500 font-bold">🎮 Secrets Unlocked!</span>}
              </p>
            </div>

            <div className="flex gap-2 flex-wrap items-center">
              <SortDropdown sortBy={sortBy} onSortChange={setSortBy} />
              <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
            </div>
          </div>

          <FilterPanel filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Gallery */}
        {filteredAndSortedArtwork.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2">No artwork found</p>
            <p className="text-muted-foreground">Try adjusting your filters to see more results</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAndSortedArtwork.map((item, index) => (
              <ArtworkCard
                key={item.id}
                artwork={item}
                viewMode="grid"
                onClick={() => setSelectedArtwork(item)}
                priority={index < 4}
              />
            ))}
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {filteredAndSortedArtwork.map((item, index) => (
              <ArtworkCard
                key={item.id}
                artwork={item}
                viewMode="timeline"
                onClick={() => setSelectedArtwork(item)}
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </main>

      <ArtworkModal
        artwork={selectedArtwork}
        open={!!selectedArtwork}
        onOpenChange={(open) => {
          if (!open) setSelectedArtwork(null)
        }}
      />
    </div>
  )
}
