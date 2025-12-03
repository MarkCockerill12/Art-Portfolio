export interface Artwork {
  id: string
  title: string
  image: string
  thumbnail?: string // New standard for grid/previews
  images?: string[]  // Now represents only ADDITIONAL images, not duplicates
  videoUrl?: string
  description: string
  date: string
  software?: "Procreate" | "Blender" | "Krita" | "Sketchbook" | "Gale" | "Other"
  genre?:
    | "Character Design"
    | "Environment"
    | "Concept Art"
    | "Fan Art"
    | "Original"
    | "Study"
    | "Illustration"
    | "Sketch"
    | "Pixel Art"
  isDigital: boolean
  isFavorite: boolean
  timeTaken?: string
  isCollab?: boolean
}

export type Theme =
  | "light"
  | "dark"
  | "windowsxp"
  | "frutiger-aero"
  | "frutiger-eco"
  | "macos"
  | "gameboy"
  | "vaporwave"

export type ViewMode = "grid" | "timeline"