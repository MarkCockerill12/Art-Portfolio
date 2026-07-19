"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Loader2, Plus, LogOut, CheckCircle, Video, Image as ImageIcon } from "lucide-react"

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

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [password, setPassword] = useState("")
  const [authError, setAuthError] = useState("")
  const [isAuthLoading, setIsAuthLoading] = useState(false)

  // Form State
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [date, setDate] = useState(() => {
    const today = new Date()
    return today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    })
  })
  const [software, setSoftware] = useState("Krita")
  const [genre, setGenre] = useState("Original")
  const [isDigital, setIsDigital] = useState(true)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isCollab, setIsCollab] = useState(false)
  const [isSecret, setIsSecret] = useState(false)
  const [timeTaken, setTimeTaken] = useState("")
  
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [mediaPreview, setMediaPreview] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "success" | "error">("idle")
  const [uploadError, setUploadError] = useState("")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()

  // 1. Check active session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch("/api/auth")
        if (res.ok) {
          const data = await res.json()
          setIsAuthenticated(data.authenticated)
        } else {
          setIsAuthenticated(false)
        }
      } catch (err) {
        setIsAuthenticated(false)
      }
    }
    checkAuth()
  }, [])

  // 2. Perform authentication login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAuthError("")
    setIsAuthLoading(true)
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      })
      
      if (res.ok) {
        setIsAuthenticated(true)
      } else {
        const data = await res.json()
        setAuthError(data.error || "Authentication failed")
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server")
    } finally {
      setIsAuthLoading(false)
    }
  }

  // Logout handler
  const handleLogout = async () => {
    try {
      await fetch("/api/auth", { method: "DELETE" })
      setIsAuthenticated(false)
      setPassword("")
    } catch (err) {
      console.error("Logout failed", err)
    }
  }

  // Handle media selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaFile(file)
    if (mediaPreview) {
      URL.revokeObjectURL(mediaPreview)
    }
    setMediaPreview(URL.createObjectURL(file))
    setUploadStatus("idle")
  }

  // Helper to convert Image File/Blob to WebP and optionally resize it (100% Client-Sided)
  const processImageToWebp = (
    imageFile: File | Blob,
    quality: number,
    maxWidth?: number
  ): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.src = URL.createObjectURL(imageFile)
      
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas")
          let width = img.naturalWidth
          let height = img.naturalHeight

          if (maxWidth && width > maxWidth) {
            const ratio = maxWidth / width
            width = maxWidth
            height = img.naturalHeight * ratio
          }

          canvas.width = width
          canvas.height = height
          
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get 2D canvas context"))
            return
          }
          ctx.drawImage(img, 0, 0, width, height)
          
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Canvas toBlob output is null"))
              }
              URL.revokeObjectURL(img.src)
            },
            "image/webp",
            quality
          )
        } catch (err) {
          reject(err)
        }
      }

      img.onerror = () => {
        reject(new Error("Failed to load image for processing"))
      }
    })
  }

  // Extract a WebP preview frame from a video file using HTML5 Canvas (100% Client-Sided)
  const extractVideoFrame = (videoFile: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.preload = "auto"
      video.muted = true
      video.playsInline = true
      video.src = URL.createObjectURL(videoFile)
      
      video.onloadeddata = () => {
        // Seek to 0.5s to get a good preview frame
        video.currentTime = 0.5
      }

      video.onseeked = () => {
        try {
          const canvas = document.createElement("canvas")
          canvas.width = video.videoWidth
          canvas.height = video.videoHeight
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            reject(new Error("Failed to get canvas context"))
            return
          }
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          canvas.toBlob(
            (blob) => {
              if (blob) {
                resolve(blob)
              } else {
                reject(new Error("Canvas toBlob failed"))
              }
              URL.revokeObjectURL(video.src)
            },
            "image/webp",
            0.85
          )
        } catch (err) {
          reject(err)
        }
      }

      video.onerror = () => {
        reject(new Error("Error loading video for frame capture"))
      }
    })
  }

  // Handle creation/submission of post
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!mediaFile) {
      setUploadError("Please select an image or video file to upload")
      return
    }

    setIsUploading(true)
    setUploadStatus("processing")
    setUploadError("")

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("description", description)
      formData.append("date", date)
      formData.append("software", software)
      formData.append("genre", genre)
      formData.append("isDigital", String(isDigital))
      formData.append("isFavorite", String(isFavorite))
      formData.append("isCollab", String(isCollab))
      formData.append("isSecret", String(isSecret))
      formData.append("timeTaken", timeTaken)

      // Client-Side Image/Video formatting checks
      if (mediaFile.type.startsWith("video/")) {
        // 1. Append the raw video file
        formData.append("file", mediaFile)

        // 2. Extract full-size preview WebP from video on client side
        const previewBlob = await extractVideoFrame(mediaFile)
        const previewFile = new File([previewBlob], "preview.webp", { type: "image/webp" })
        formData.append("previewFile", previewFile)

        // 3. Extract WebP thumbnail from preview frame on client side
        const thumbBlob = await processImageToWebp(previewBlob, 0.8, 1000)
        const thumbFile = new File([thumbBlob], "thumb.webp", { type: "image/webp" })
        formData.append("thumbnailFile", thumbFile)
      } else {
        // It's an image! Perform 100% client side WebP conversion
        // 1. Convert to high-quality WebP full-size
        const webpBlob = await processImageToWebp(mediaFile, 0.9)
        const webpFile = new File([webpBlob], "image.webp", { type: "image/webp" })
        formData.append("file", webpFile)

        // 2. Convert to WebP thumbnail
        const thumbBlob = await processImageToWebp(mediaFile, 0.8, 1000)
        const thumbFile = new File([thumbBlob], "thumb.webp", { type: "image/webp" })
        formData.append("thumbnailFile", thumbFile)
      }

      const res = await fetch("/api/artworks", {
        method: "POST",
        body: formData,
      })

      if (res.ok) {
        setUploadStatus("success")
        // Epic celebration confetti
        const confetti = (await import("canvas-confetti")).default
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } })
        
        // Reset form
        setTitle("")
        setDescription("")
        setTimeTaken("")
        setMediaFile(null)
        if (mediaPreview) {
          URL.revokeObjectURL(mediaPreview)
          setMediaPreview(null)
        }
        if (fileInputRef.current) fileInputRef.current.value = ""
      } else {
        const data = await res.json()
        setUploadStatus("error")
        setUploadError(data.error || "Failed to upload post")
      }
    } catch (err: any) {
      setUploadStatus("error")
      setUploadError(err.message || "Failed to process media or communicate with backend")
    } finally {
      setIsUploading(false)
    }
  }

  // Loading Session State
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Unauthenticated Password Screen */}
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto py-12">
            <Card className="border shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent" />
              <CardHeader className="space-y-2">
                <CardTitle className="text-2xl font-bold text-center">Admin Access Needed</CardTitle>
                <CardDescription className="text-center">
                  Please enter your password to access the creation portal.
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleLogin}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <input
                      type="password"
                      placeholder="Enter Admin Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary text-center"
                      required
                      autoFocus
                    />
                  </div>
                  {authError && (
                    <p className="text-destructive text-sm text-center font-medium bg-destructive/10 py-2 rounded-lg">
                      ❌ {authError}
                    </p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button type="submit" className="w-full font-bold" disabled={isAuthLoading}>
                    {isAuthLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Authenticating...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        ) : (
          /* Authenticated Panel Form */
          <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <div>
                <h1 className="text-4xl font-extrabold tracking-tight">Create Post</h1>
                <p className="text-muted-foreground mt-1">Images are converted to WebP on your device before upload</p>
              </div>
              <Button variant="outline" onClick={handleLogout} className="border-border hover:bg-destructive/15">
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
              <div className="space-y-6">
                <Card className="border">
                  <CardContent className="p-6 space-y-4">
                    {/* Post Title */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Post Title</label>
                      <input
                        type="text"
                        placeholder="e.g. Crucible Knight Starscape"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        required
                      />
                    </div>

                    {/* Post Description */}
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-foreground">Description</label>
                      <textarea
                        placeholder="Write a description, story, or reference notes about the piece..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary resize-none leading-relaxed"
                        required
                      />
                    </div>

                    {/* Metadata grids */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Software Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Software Used</label>
                        <select
                          value={software}
                          onChange={(e) => setSoftware(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {SOFTWARE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Genre Selector */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Genre</label>
                        <select
                          value={genre}
                          onChange={(e) => setGenre(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {GENRE_OPTIONS.map((opt) => (
                            <option key={opt} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Date */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Date (Formatted String)</label>
                        <input
                          type="text"
                          value={date}
                          onChange={(e) => setDate(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary"
                          required
                        />
                      </div>

                      {/* Time taken */}
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-foreground">Time Taken (Optional)</label>
                        <input
                          type="text"
                          placeholder="e.g. 5h 49m"
                          value={timeTaken}
                          onChange={(e) => setTimeTaken(e.target.value)}
                          className="bg-background border border-border rounded-lg px-4 py-3 text-foreground w-full focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Settings Card */}
                <Card className="border">
                  <CardContent className="p-6">
                    <h3 className="font-bold text-base mb-4">Post Settings</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {/* isDigital */}
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isDigital}
                          onChange={(e) => setIsDigital(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                        />
                        <div className="text-sm">
                          <span className="font-semibold block">Digital Artwork</span>
                          <span className="text-muted-foreground text-xs">Uncheck for physical pieces</span>
                        </div>
                      </label>

                      {/* isFavorite */}
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isFavorite}
                          onChange={(e) => setIsFavorite(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                        />
                        <div className="text-sm">
                          <span className="font-semibold block">Mark as Favorite</span>
                          <span className="text-muted-foreground text-xs">Highlights with a heart badge</span>
                        </div>
                      </label>

                      {/* isCollab */}
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isCollab}
                          onChange={(e) => setIsCollab(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                        />
                        <div className="text-sm">
                          <span className="font-semibold block">Collaboration</span>
                          <span className="text-muted-foreground text-xs">Include on Collab page</span>
                        </div>
                      </label>

                      {/* isSecret */}
                      <label className="flex items-center gap-3 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={isSecret}
                          onChange={(e) => setIsSecret(e.target.checked)}
                          className="w-5 h-5 rounded border-border bg-background text-primary focus:ring-primary focus:ring-offset-background"
                        />
                        <div className="text-sm">
                          <span className="font-semibold block">Secret Artwork</span>
                          <span className="text-muted-foreground text-xs">Unlocked via Easter Egg</span>
                        </div>
                      </label>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload Zone & Previews */}
              <div className="space-y-6">
                <Card className="border h-full flex flex-col justify-between overflow-hidden">
                  <CardHeader className="bg-muted/50 p-4 border-b">
                    <CardTitle className="text-sm font-bold">Media Upload</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 flex-1 flex flex-col justify-center items-center gap-4">
                    {mediaPreview ? (
                      <div className="w-full relative aspect-square rounded-lg border border-border bg-black/5 dark:bg-black/20 overflow-hidden group">
                        {mediaFile?.type.startsWith("video/") ? (
                          <video src={mediaPreview} controls className="w-full h-full object-contain" />
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mediaPreview} alt="Preview" className="w-full h-full object-contain" />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            type="button"
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              setMediaFile(null)
                              setMediaPreview(null)
                              if (fileInputRef.current) fileInputRef.current.value = ""
                            }}
                          >
                            Replace File
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full aspect-square border-2 border-dashed border-border rounded-lg flex flex-col justify-center items-center gap-3 cursor-pointer hover:border-primary/50 transition-colors p-6 text-center"
                      >
                        <div className="bg-primary/5 rounded-full p-4 text-primary">
                          <Plus className="w-8 h-8" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Select Image or Video</p>
                          <p className="text-muted-foreground text-xs mt-1">PNG, JPG, WEBP, MP4, WEBM</p>
                        </div>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,video/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {mediaFile && (
                      <div className="flex gap-2 flex-wrap items-center">
                        <Badge variant="outline" className="flex items-center gap-1.5 py-1 px-2.5 bg-background">
                          {mediaFile.type.startsWith("video/") ? (
                            <Video className="w-3.5 h-3.5 text-blue-500" />
                          ) : (
                            <ImageIcon className="w-3.5 h-3.5 text-green-500" />
                          )}
                          <span className="truncate max-w-[150px]">{mediaFile.name}</span>
                        </Badge>
                        <span className="text-xs text-muted-foreground font-semibold">
                          ({(mediaFile.size / (1024 * 1024)).toFixed(2)} MB)
                        </span>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="bg-muted/50 p-4 border-t flex flex-col gap-3">
                    {uploadStatus === "processing" && (
                      <div className="w-full flex flex-col items-center justify-center p-3 gap-2 text-primary font-bold text-xs bg-primary/10 rounded-lg text-center leading-relaxed">
                        <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                        Converting to WebP & uploading to R2 bucket...
                        <span className="text-[10px] text-muted-foreground block font-normal mt-0.5">
                          (This runs 100% locally on your browser. Please do not close the tab.)
                        </span>
                      </div>
                    )}

                    {uploadStatus === "success" && (
                      <div className="w-full flex items-center justify-center p-2 gap-2 text-green-600 dark:text-green-400 font-bold text-sm bg-green-500/10 rounded-lg border border-green-500/20">
                        <CheckCircle className="w-4 h-4" />
                        Post uploaded successfully!
                      </div>
                    )}

                    {uploadStatus === "error" && (
                      <div className="w-full p-3 text-destructive font-semibold text-xs bg-destructive/10 rounded-lg border border-destructive/20 text-center leading-relaxed">
                        ❌ {uploadError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      className="w-full font-extrabold group"
                      disabled={isUploading || !mediaFile}
                    >
                      <Plus className="w-5 h-5 mr-2 shrink-0 group-hover:scale-110 transition-transform" />
                      Publish Post
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  )
}
