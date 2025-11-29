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
  const [imageLoaded, setImageLoaded] = useState(false)

  if (viewMode === "timeline") {
    return (
      <div className="flex flex-col md:flex-row gap-4 md:gap-6 group">
        <div className="flex flex-col items-center md:items-end min-w-[140px]">
          <Badge variant="outline" className="mb-2 text-xs">
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
          className="flex-1 overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-[1.02] border-2"
          onClick={onClick}
        >
          <div className="flex flex-col sm:flex-row">
            <div className="relative w-full sm:w-48 h-48 flex-shrink-0 bg-muted">
              {artwork.videoUrl && !artwork.customPreview ? (
                <video
                  src={artwork.videoUrl}
                  className={cn(
                    "object-cover w-full h-full transition-all duration-500",
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  )}
                  muted
                  playsInline
                  onLoadedData={() => setImageLoaded(true)}
                />
              ) : (
                <Image
                  src={artwork.customPreview || artwork.image}
                  alt={artwork.title}
                  fill
                  priority={priority}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={cn(
                    "object-cover transition-all duration-500",
                    imageLoaded ? "opacity-100 scale-100" : "opacity-0 scale-95",
                  )}
                  onLoad={() => setImageLoaded(true)}
                />
              )}
              {artwork.isFavorite && (
                <div className="absolute top-2 right-2 bg-destructive/90 backdrop-blur-sm rounded-full p-2">
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

  return (
    <Card
      className="group overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl hover:scale-[1.03] hover:-translate-y-1 border-2"
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {artwork.videoUrl && !artwork.customPreview ? (
          <video
            src={artwork.videoUrl}
            className={cn(
              "object-cover w-full h-full transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            muted
            playsInline
            onLoadedData={() => setImageLoaded(true)}
          />
        ) : (
          <Image
            src={artwork.customPreview || artwork.image}
            alt={artwork.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className={cn(
              "object-cover transition-all duration-500 group-hover:scale-110",
              imageLoaded ? "opacity-100" : "opacity-0",
            )}
            onLoad={() => setImageLoaded(true)}
          />
        )}
        {artwork.isFavorite && (
          <div className="absolute top-3 right-3 bg-destructive/90 backdrop-blur-sm rounded-full p-2 transition-transform group-hover:scale-110">
            <Heart className="w-4 h-4 fill-destructive-foreground text-destructive-foreground" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 !rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 !rounded-none">
          <h3 className="text-white font-bold text-lg mb-1 text-balance !rounded-none">{artwork.title}</h3>
          <p className="text-white/80 text-xs line-clamp-2 !rounded-none">{artwork.description}</p>
        </div>
      </div>

      <div className="px-2 py-1">
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