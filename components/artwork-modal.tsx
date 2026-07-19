"use client"

import { useEffect, useRef, useState } from "react"
import Image from "next/image"
import { Slider } from "@/components/ui/slider"
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Artwork } from "@/lib/types"
import { 
  ZoomIn, 
  ZoomOut, 
  Heart, 
  ChevronLeft, 
  ChevronRight, 
  Palette, 
  Calendar, 
  Sparkles, 
  X, 
  Clock,
  Pencil
} from "lucide-react"

// Types of Software and Genre based on lib/types.ts
const SOFTWARE_OPTIONS = ["Procreate", "Blender", "Krita", "Sketchbook", "Gale", "Other"]
const GENRE_OPTIONS = [
  "Character Design",
  "Environment",
  "Concept Art",
  "Fan Art",
  "Original",
  "Study",
  "Illustration",
  "Sketch",
  "Pixel Art",
]

interface ArtworkModalProps {
  artwork: Artwork | null
  open: boolean
  onOpenChange: (open: boolean) => void
  isAdmin?: boolean
  onArtworkUpdated?: () => void
}

export function ArtworkModal({ 
  artwork, 
  open, 
  onOpenChange,
  isAdmin = false,
  onArtworkUpdated
}: ArtworkModalProps) {
  const [showSpotlight, setShowSpotlight] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [zoomLevel, setZoomLevel] = useState(1)
  const [showVideo, setShowVideo] = useState(false)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isHighQualityLoaded, setIsHighQualityLoaded] = useState(false)
  
  // Edit Mode states
  const [isEditing, setIsEditing] = useState(false)
  const [editTitle, setEditTitle] = useState("")
  const [editDesc, setEditDesc] = useState("")
  const [editDate, setEditDate] = useState("")
  const [editSoftware, setEditSoftware] = useState("Krita")
  const [editGenre, setEditGenre] = useState("Original")
  const [editIsDigital, setEditIsDigital] = useState(true)
  const [editIsFavorite, setEditIsFavorite] = useState(false)
  const [editIsCollab, setEditIsCollab] = useState(false)
  const [editIsSecret, setEditIsSecret] = useState(false)
  const [editTimeTaken, setEditTimeTaken] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [editError, setEditError] = useState("")
  
  const imageRef = useRef<HTMLDivElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)
  const dragStartRef = useRef({ x: 0, y: 0 })
  
  const lastArtworkRef = useRef<Artwork | null>(artwork)
  if (artwork) {
    lastArtworkRef.current = artwork
  }
  const displayArtwork = artwork || lastArtworkRef.current

  // Merge main image with extra gallery images
  const allImages = displayArtwork 
    ? [displayArtwork.image, ...(displayArtwork.images || [])] 
    : [];

  const hasMultipleImages = allImages.length > 1
  const hasVideo = !!displayArtwork?.videoUrl

  // Thumbnail for blur-up effect
  const currentThumbnail = currentImageIndex === 0 ? displayArtwork?.thumbnail : undefined;

  // Initialize edit form values
  useEffect(() => {
    if (displayArtwork) {
      setEditTitle(displayArtwork.title)
      setEditDesc(displayArtwork.description)
      setEditDate(displayArtwork.date)
      setEditSoftware(displayArtwork.software || "Krita")
      setEditGenre(displayArtwork.genre || "Original")
      setEditIsDigital(displayArtwork.isDigital)
      setEditIsFavorite(displayArtwork.isFavorite)
      setEditIsCollab(displayArtwork.isCollab || false)
      setEditIsSecret(displayArtwork.isSecret || false)
      setEditTimeTaken(displayArtwork.timeTaken || "")
    }
    setEditError("")
  }, [displayArtwork, isEditing])

  const handleCelebrate = async () => {
    const confetti = (await import("canvas-confetti")).default
    const duration = 4000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 35, spread: 360, ticks: 80, zIndex: 9999 }

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

  // Handle Save changes PUT request
  const handleSaveChanges = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!displayArtwork) return
    setIsSaving(true)
    setEditError("")

    try {
      const updatedArtwork: Artwork = {
        ...displayArtwork,
        title: editTitle,
        description: editDesc,
        date: editDate,
        software: editSoftware as any,
        genre: editGenre as any,
        isDigital: editIsDigital,
        isFavorite: editIsFavorite,
        isCollab: editIsCollab,
        isSecret: editIsSecret,
        timeTaken: editTimeTaken || undefined,
      }

      const res = await fetch("/api/artworks", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updatedArtwork }),
      })

      if (res.ok) {
        setIsEditing(false)
        onArtworkUpdated?.()
        // Celebrate success
        const confetti = (await import("canvas-confetti")).default
        confetti({ particleCount: 80, spread: 60, origin: { y: 0.6 } })
      } else {
        const data = await res.json()
        setEditError(data.error || "Failed to update artwork")
      }
    } catch (err) {
      setEditError("Failed to communicate with API server")
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (!open) {
      setShowSpotlight(false)
      setCurrentImageIndex(0)
      setZoomLevel(1)
      setShowVideo(false)
      setPan({ x: 0, y: 0 })
      setIsEditing(false)
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
                    opacity: 0.7,
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
                      unoptimized={true}
                      priority
                    />
                  ) : (
                    <video 
                      src={displayArtwork.videoUrl} 
                      poster={displayArtwork.thumbnail || (displayArtwork.image && !displayArtwork.image.endsWith('.mp4') ? displayArtwork.image : undefined)}
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
                    {currentThumbnail && (
                      <Image
                        key={`thumb-${currentImageIndex}`}
                        src={currentThumbnail}
                        alt="Loading Preview"
                        fill
                        className={`object-contain transition-opacity duration-500 delay-300 ${
                          isHighQualityLoaded ? "opacity-0" : "opacity-100"
                        }`}
                        priority
                      />
                    )}
                    
                    <Image
                      key={`highres-${currentImageIndex}`}
                      src={allImages[currentImageIndex]}
                      alt={`${displayArtwork.title} - Image ${currentImageIndex + 1}`}
                      fill
                      quality={90}
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1600px"
                      className={`object-contain transition-opacity duration-500 ${
                        isHighQualityLoaded ? "opacity-100" : "opacity-0"
                      }`}
                      style={{
                        transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoomLevel})`
                      }}
                      priority={true}
                      draggable={false}
                      onLoad={() => setIsHighQualityLoaded(true)}
                    />
                  </>
                )}
              </div>

              {!hasVideo && (
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 w-48 sm:w-64 bg-background/95 px-4 py-2 rounded-full shadow-lg border border-border/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
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
                    className="!absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 hover:bg-background shadow-xl h-10 w-10 sm:h-12 sm:w-12"
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
                    className="!absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10 rounded-full bg-background/90 hover:bg-background shadow-xl h-10 w-10 sm:h-12 sm:w-12"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleNextImage()
                    }}
                  >
                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                  </Button>

                  <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 z-10 bg-background/90 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium shadow-lg">
                    {currentImageIndex + 1} / {allImages.length}
                  </div>
                </>
              )}
            </div>

            {/* Right column details / editing form */}
            {isEditing ? (
              <div className="flex flex-col p-4 sm:p-6 lg:p-8 overflow-visible lg:overflow-y-auto flex-none lg:flex-1 lg:h-full bg-card">
                <form onSubmit={handleSaveChanges} className="flex-1 space-y-4 flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold">Edit Artwork Details</h3>
                    
                    {/* Title */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Title</label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-muted-foreground">Description</label>
                      <textarea
                        value={editDesc}
                        onChange={(e) => setEditDesc(e.target.value)}
                        rows={4}
                        className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Software & Genre */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Software</label>
                        <select
                          value={editSoftware}
                          onChange={(e) => setEditSoftware(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {SOFTWARE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Genre</label>
                        <select
                          value={editGenre}
                          onChange={(e) => setEditGenre(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                        >
                          {GENRE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Date & Time taken */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Date</label>
                        <input
                          type="text"
                          value={editDate}
                          onChange={(e) => setEditDate(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-muted-foreground">Time Taken</label>
                        <input
                          type="text"
                          value={editTimeTaken}
                          onChange={(e) => setEditTimeTaken(e.target.value)}
                          className="bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground w-full focus:outline-none focus:ring-1 focus:ring-primary"
                          placeholder="e.g. 5h 49m"
                        />
                      </div>
                    </div>

                    {/* Checkbox settings flags */}
                    <div className="grid grid-cols-2 gap-3 pt-2">
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editIsDigital}
                          onChange={(e) => setEditIsDigital(e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-xs font-medium">Digital</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editIsFavorite}
                          onChange={(e) => setEditIsFavorite(e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-xs font-medium">Favorite</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editIsCollab}
                          onChange={(e) => setEditIsCollab(e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-xs font-medium">Collab</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={editIsSecret}
                          onChange={(e) => setEditIsSecret(e.target.checked)}
                          className="w-4 h-4 rounded border-border"
                        />
                        <span className="text-xs font-medium">Secret (Easter Egg)</span>
                      </label>
                    </div>
                  </div>

                  {editError && (
                    <p className="text-destructive text-xs font-semibold bg-destructive/10 p-2 rounded-lg text-center">
                      ❌ {editError}
                    </p>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setIsEditing(false)}
                      className="flex-1 text-xs"
                      disabled={isSaving}
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      className="flex-1 text-xs font-semibold"
                      disabled={isSaving}
                    >
                      {isSaving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </div>
            ) : (
              <div className="flex flex-col p-4 sm:p-6 lg:p-8 overflow-visible lg:overflow-y-auto flex-none lg:flex-1 lg:h-full bg-card">
                <div className="flex-1 space-y-3 sm:space-y-4 lg:space-y-6">
                  <div className="flex items-start gap-3 lg:pr-16">
                    {displayArtwork.isFavorite && (
                      <div className="bg-destructive/95 rounded-full p-2 shrink-0 mt-1">
                        <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-destructive-foreground text-destructive-foreground" />
                      </div>
                    )}
                    <div className="flex-1 flex items-start justify-between gap-2">
                      <h2 className="text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-bold text-balance leading-tight">
                        {displayArtwork.title}
                      </h2>
                      {isAdmin && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setIsEditing(true)}
                          className="text-muted-foreground hover:text-foreground hover:bg-muted shrink-0 rounded-full h-8 w-8"
                          title="Edit Artwork Details"
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
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
                      {displayArtwork.isSecret && (
                        <Badge variant="secondary" className="text-xs sm:text-sm px-2 sm:px-3 py-1 sm:py-1.5 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20">
                          Secret Easter Egg
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
                    className="w-full group transition-transform duration-300 hover:scale-105 py-4 sm:py-5 lg:py-6 text-xs sm:text-sm lg:text-base px-3 sm:px-4"
                  >
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 mr-2 shrink-0 group-hover:rotate-12 transition-transform" />
                    <span className="truncate">Rahhh confetti</span>
                  </Button>
                </div>
              </div>
            )}

            <Button
              variant="ghost"
              size="icon"
              className="!absolute top-2 sm:top-3 lg:top-4 right-2 sm:right-3 lg:right-4 z-50 rounded-full bg-background/90 hover:bg-background shadow-xl h-10 w-10 sm:h-11 sm:w-11"
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