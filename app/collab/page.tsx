"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Navbar } from "@/components/navbar"
import { ArtworkCard } from "@/components/artwork-card"
import { ArtworkModal } from "@/components/artwork-modal"
import { myArtwork as staticMyArtwork } from "@/lib/my-artwork"
import type { Artwork } from "@/lib/types"

export default function CollabPage() {
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null)
  const [artworks, setArtworks] = useState<Artwork[]>(staticMyArtwork)

  const [isAdmin, setIsAdmin] = useState(false)

  // Fetch dynamic artworks list from R2 bucket
  const loadArtworks = useCallback(async () => {
    try {
      const res = await fetch("/api/artworks")
      if (res.ok) {
        const data = await res.json()
        if (data.myArtwork && data.myArtwork.length > 0) {
          setArtworks(data.myArtwork)
        }
      }
    } catch (err) {
      console.error("Failed to load collab artworks dynamically", err)
    }
  }, [])

  useEffect(() => {
    loadArtworks()
  }, [loadArtworks])

  // Check authentication status
  useEffect(() => {
    fetch("/api/auth")
      .then((res) => res.json())
      .then((data) => setIsAdmin(data.authenticated))
      .catch(() => setIsAdmin(false))
  }, [])

  const collabArtwork = useMemo(() => {
    return artworks.filter((art) => art.isCollab)
  }, [artworks])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 text-balance">Collaborations</h1>
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            A collection of artworks created in collaboration with other talented artists.
          </p>
        </div>

        {/* Gallery */}
        {collabArtwork.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-2xl font-semibold mb-2">No collaborations found yet</p>
            <p className="text-muted-foreground">Check back later for collaborative projects!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {collabArtwork.map((item, index) => (
              <ArtworkCard
                key={item.id}
                artwork={item}
                viewMode="grid"
                onClick={() => setSelectedArtwork(item)}
                priority={index < 4}
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
        isAdmin={isAdmin}
        onArtworkUpdated={loadArtworks}
      />
    </div>
  )
}
