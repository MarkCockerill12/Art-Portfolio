"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Artwork } from "@/lib/types"
import confetti from "canvas-confetti"
import { 
  ZoomIn, 
  ZoomOut, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Palette, 
  Calendar, 
  Sparkles, 
  X,
  Clock
} from "lucide-react"

interface ArtworkModalProps {
  artwork: Artwork | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ArtworkModal({ artwork, open, onOpenChange }: ArtworkModalProps) {
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showVideo, setShowVideo] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)
  
  const imageRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  const lastMousePosRef = useRef({ x: 0, y: 0 })
  
  // Keep track of the last valid artwork to display during closing animation
  const lastArtworkRef = useRef<Artwork | null>(artwork)
  if (artwork) {
    lastArtworkRef.current = artwork
  }
  const displayArtwork = artwork || lastArtworkRef.current

  const allImages = displayArtwork?.images || (displayArtwork?.image ? [displayArtwork.image] : [])
  const hasMultipleImages = allImages.length > 1
  const hasVideo = !!displayArtwork?.videoUrl

  const handleCelebrate = () => {
    const duration = 4000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 9999 }

    function randomInRange(min: number, max: number) {
      return Math.random() * (max - min) + min
    }

    const interval: NodeJS.Timeout = setInterval(() => {
      const timeLeft = animationEnd - Date.now()

      if (timeLeft <= 0) {
        clearInterval(interval)
        setShowSpotlight(false)
        return
      }

      const particleCount = 150 * (timeLeft / duration)

      confetti({
        ...defaults,
        particleCount,
        origin: { x: 0, y: 0.5 },
        angle: 60,
        colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF4500", "#9370DB"],
      })

      confetti({
        ...defaults,
        particleCount,
        origin: { x: 1, y: 0.5 },
        angle: 120,
        colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF4500", "#9370DB"],
      })

      confetti({
        ...defaults,
        particleCount: particleCount / 2,
        origin: { x: 0.5, y: 0 },
        angle: 90,
        spread: 100,
        colors: ["#FFD700", "#FF69B4", "#00CED1", "#FF4500", "#9370DB"],
      })
    }, 150)

    setShowSpotlight(true)
  }

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1))
    setShowVideo(false)
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1))
    setShowVideo(false)
  }

  const handleZoomChange = (value: number[]) => {
    const newZoom = value[0]
    setZoomLevel(newZoom)
    if (newZoom === 1) {
      setPan({ x: 0, y: 0 })
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    dragStartRef.current = { x: e.clientX - pan.x, y: e.clientY - pan.y }
    lastMousePosRef.current = { x: e.clientX, y: e.clientY }
    
    if (zoomLevel > 1) {
      setIsDragging(true)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || zoomLevel <= 1) return
    e.preventDefault()
    const newX = e.clientX - dragStartRef.current.x
    const newY = e.clientY - dragStartRef.current.y
    setPan({ x: newX, y: newY })
  }

  const handleMouseUp = (e: React.MouseEvent) => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (!open) {
      setShowSpotlight(false)
      setCurrentImageIndex(0)
      setZoomLevel(1)
      setShowVideo(false)
      setPan({ x: 0, y: 0 })
    }
    setIsHighQualityLoaded(false)
  }, [open])

  useEffect(() => {
    setIsHighQualityLoaded(false)
  }, [currentImageIndex])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {displayArtwork && (
        <DialogContent
          showCloseButton={false}
          className="w-[95vw] max-w-[95vw] sm:max-w-[95vw] md:max-w-[90vw] lg:max-w-[1600px] h-auto max-h-[90vh] lg:h-[95vh] lg:max-h-none overflow-y-auto lg:overflow-hidden !p-0 !gap-0 transition-all duration-300 flex flex-col"
        >
          <DialogTitle className="sr-only">{displayArtwork.title}</DialogTitle>
          <DialogDescription className="sr-only">
            Detailed view of {displayArtwork.title} by the artist. Includes image viewer and artwork details.
          </DialogDescription>
          <div className="flex flex-col lg:grid lg:grid-cols-[1.8fr_1fr] gap-0 relative h-auto lg:h-full overflow-visible lg:overflow-hidden flex-1 w-full">
            <div className="relative bg-black/10 dark:bg-black/30 h-auto aspect-square lg:aspect-auto lg:h-full w-full shrink-0 flex items-center justify-center p-3 sm:p-6 lg:p-10 overflow-hidden group">
              {showSpotlight && (
                <div
                  ref={spotlightRef}
                  className="absolute inset-0 pointer-events-none z-40"
                  style={{
                    background:
                      "radial-gradient(circle at 50% -10%, rgba(255, 255, 255, 0.8) 0%, rgba(255, 215, 0, 0.3) 40%, transparent 70%)",
                    filter: "blur(8px)",
                    mixBlendMode: "overlay",
                  }}
                />
              )}
              
              <div
                ref={imageRef}
                className={`relative w-full h-full rounded-md overflow-hidden ${
                  hasVideo ? "" : zoomLevel > 1 ? (isDragging ? "cursor-grabbing" : "cursor-grab") : "cursor-default"
                }`}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {hasVideo ? (
                  displayArtwork.videoUrl?.toLowerCase().endsWith('.gif') ? (
                    <Image
                      src={displayArtwork.videoUrl}
                      alt={displayArtwork.title}
                      fill
                      className="object-contain"
                      unoptimized
                      priority
                    />
                  ) : (
                    <video 
                      src={displayArtwork.videoUrl} 
                      poster={displayArtwork.image && !displayArtwork.image.endsWith('.mp4') ? displayArtwork.image : undefined}
                      controls 
                      className="w-full h-full object-contain" 
                    />
                  )
                ) : allImages[currentImageIndex]?.toLowerCase().endsWith('.mp4') ? (
                  <video 
                    src={allImages[currentImageIndex]} 
                    controls 
                    className="w-full h-full object-contain" 
                  />
                ) : (
                  <>
                    {/* Low quality placeholder (matches grid card for cache hit) */}
                    <Image
                      key={`placeholder-${currentImageIndex}`}
                      src={allImages[currentImageIndex]}
                      alt={`${displayArtwork.title} - Placeholder`}
                      fill
                      className={`object-contain ${isDragging ? "" : "transition-transform duration-300"}`}
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`
                      }}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      priority
                    />
                    
                    {/* High quality version */}
                    <Image
                      key={`highres-${currentImageIndex}`}
                      src={allImages[currentImageIndex]}
                      alt={`${displayArtwork.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className={`object-contain ${isDragging ? "" : "transition-transform duration-300"} ${isHighQualityLoaded ? "opacity-100" : "opacity-0"}`}
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`
                      }}
                      priority
                      quality={100}
                      sizes="(max-width: 1024px) 95vw, 60vw"
                      draggable={false}
                      onLoad={() => setIsHighQualityLoaded(true)}
                    />
                  </>
                )}
              </div>

              {/* Zoom Slider Control */}
              {!hasVideo && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-48 sm:w-64 bg-background/80 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="flex items-center gap-3">
                    <ZoomOut className="w-4 h-4 text-muted-foreground" />
                    <Slider
                      defaultValue={[1]}
                      value={[zoomLevel]}
                      min={1}
                      max={4}
                      step={0.1}
                      onValueChange={handleZoomChange}
                      className="flex-1"
                    />
                    <ZoomIn className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              )}

              {hasMultipleImages && (
                <>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="!absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-xl h-10 w-10 sm:h-12 sm:w-12"
                    onClick={(e) => {
                      e.stopPropagation()
                      handlePrevImage()
                    }}
                  >
                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="!absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-xl h-10 w-10 sm:h-12 sm:w-12"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/90 backdrop-blur-sm px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col p-4 sm:p-6 lg:p-8 overflow-visible lg:overflow-y-auto flex-none lg:flex-1 lg:h-full bg-card/95 backdrop-blur-sm">
              <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                <div className="flex items-start gap-3 lg:pr-16">
                  {displayArtwork.isFavorite && (
                    <div className="bg-destructive/90 backdrop-blur-sm rounded-full p-2 shrink-0 mt-1">
                      <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-destructive-foreground text-destructive-foreground" />
                    </div>
                  )}
                  <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-balance leading-tight">
                    {displayArtwork.title}
                  </h2>
                </div>

                <div className="space-y-2 sm:space-y-3">
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                      <Palette className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                      {displayArtwork.software}
                    </Badge>
                    <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                      {displayArtwork.genre}
                    </Badge>
                    {displayArtwork.isDigital && (
                      <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5">
                        Digital
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-4 text-xs sm:text-sm text-muted-foreground flex-wrap">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>{displayArtwork.date}</span>
                    </div>
                    {displayArtwork.timeTaken && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
                        <span>{displayArtwork.timeTaken}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none">
                  <p className="text-muted-foreground leading-relaxed text-sm sm:text-base">{displayArtwork.description}</p>
                </div>
              </div>

              <div className="mt-4 sm:mt-6 space-y-2 sm:space-y-3">
                <Button
                  onClick={handleCelebrate}
                  size="lg"
                  className="w-full group transition-all duration-300 hover:scale-105 py-4 sm:py-5 lg:py-6 text-xs sm:text-sm lg:text-base px-3 sm:px-4"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0 group-hover:rotate-12 transition-transform" />
                  <span className="truncate">Rahhh confetti</span>
                </Button>

              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="!absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-50 rounded-full bg-background/90 backdrop-blur-sm hover:bg-background shadow-xl h-10 w-10 sm:h-11 sm:w-11"
              onClick={() => onOpenChange(false)}
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
              <span className="sr-only">Close</span>
            </Button>
          </div>
        </DialogContent>
      )}
    </Dialog>
  )
}
