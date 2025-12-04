"use client"

import { useState } from "react"
import Image from "next/image"
import { Card } from "@/components/ui/card"
import { Heart, Calendar, Palette, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import type { Artwork } from "@/lib/types"
import { cn } from "@/lib/utils"

interface ArtworkCardProps {
  artwork: Artwork
  onClick: () => void
  viewMode: "grid" | "timeline"
  priority?: boolean
}

export function ArtworkCard({ artwork, onClick, viewMode, priority = false }: ArtworkCardProps) {
  const [isHovering, setIsHovering] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)

  // OPTIMIZATION: Always prefer the thumbnail for the card view
  const displaySrc = artwork.thumbnail || artwork.image

  if (viewMode === "timeline") {
    return (
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 group">
        <div className="flex flex-col items-center md:items-end min-w-[140px]">
          <Badge variant="outline" className="mb-2 text-xs bg-background/95 border-primary/20">
            {new Date(artwork.date).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </Badge>
          <div className="hidden md:block w-px h-full bg-border relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-primary" />
          </div>
        </div>

        <Card
          className="flex-1 overflow-hidden cursor-pointer transition-[transform,shadow] duration-300 hover:shadow-lg hover:scale-[1.02] border-2 group"
          onClick={onClick}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-72 h-64 md:h-auto flex-shrink-0 bg-muted">
              {/* Always render Image as base layer */}
                            <Image
                src={displaySrc || "/placeholder.svg"}
                alt={artwork.title}
                fill
                priority={priority}
                className={cn(
                  "object-cover transition-opacity duration-500",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
                onLoad={() => setImageLoaded(true)}
              />

              {/* Render video on top ONLY when hovering */}
              {artwork.videoUrl && isHovering && (
                <div className="absolute inset-0 z-10 bg-background">
                  <video
                    src={artwork.videoUrl}
                    className="object-cover w-full h-full animate-in fade-in duration-300"
                    muted
                    playsInline
                    autoPlay
                    loop
                  />
                </div>
              )}
              
              {artwork.isFavorite && (
                <div className="absolute top-2 right-2 bg-destructive/95 rounded-full p-2 z-20">
                  <Heart className="w-4 h-4 fill-destructive-foreground text-destructive-foreground" />
                </div>
              )}
            </div>

            <div className="flex-1 flex flex-col justify-between p-4">
              <div>
                <h3 className="text-xl font-bold mb-2 text-balance">{artwork.title}</h3>
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{artwork.description}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    <Palette className="w-4 h-4 mr-2" />
                    {artwork.software}
                  </Badge>
                  <Badge variant="outline" className="text-sm px-3 py-1">
                    {artwork.genre}
                  </Badge>
                  {artwork.timeTaken && (
                    <Badge variant="outline" className="text-sm px-3 py-1">
                      <Clock className="w-4 h-4 mr-2" />
                      {artwork.timeTaken}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    )
  }

  // GRID VIEW
  return (
    <Card
      // Added 'group' here explicitly to ensure hover states propagate
      className="group overflow-hidden cursor-pointer transition-[transform,shadow] duration-300 hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 border-0 relative"
      onClick={onClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {/* 1. Base Image Layer (Always visible initially) */}
        <Image
          src={displaySrc}
          alt={artwork.title}
          fill
          priority={priority}
          className={cn(
            "object-cover transition-transform duration-500 group-hover:scale-110",
            imageLoaded ? "opacity-100" : "opacity-0",
          )}
          onLoad={() => setImageLoaded(true)}
        />

        {/* 2. Video Layer (Overlays on hover) */}
        {artwork.videoUrl && isHovering && (
          <div className="absolute inset-0 z-10 bg-background/50">
             <video
              src={artwork.videoUrl}
              className="object-cover w-full h-full animate-in fade-in duration-300 group-hover:scale-110 transition-transform duration-500"
              muted
              playsInline
              autoPlay
              loop
            />
          </div>
        )}
        
        {/* 3. Gradient & Text Overlay (Highest Z-Index) */}
        <div className="absolute -inset-2 z-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 pointer-events-none" />
        
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500 z-20 pointer-events-none">
          <h3 className="text-white font-bold text-lg mb-1 text-balance drop-shadow-md">{artwork.title}</h3>
          <p className="text-white/90 text-xs line-clamp-2 drop-shadow-md">{artwork.description}</p>
        </div>

        {/* Heart Icon */}
        {artwork.isFavorite && (
          <div className="absolute top-3 right-3 bg-destructive/95 rounded-full p-2 transition-transform group-hover:scale-110 z-30">
            <Heart className="w-4 h-4 fill-destructive-foreground text-destructive-foreground" />
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-2 py-1 bg-card/95 relative z-20">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Palette className="w-4 h-4 mr-2" />
              {artwork.software}
            </Badge>
            {artwork.timeTaken && (
              <Badge variant="outline" className="text-sm px-3 py-1">
                <Clock className="w-4 h-4 mr-2" />
                {artwork.timeTaken}
              </Badge>
            )}
          </div>
          <span className="text-sm text-muted-foreground flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            {new Date(artwork.date).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </Card>
  )
}