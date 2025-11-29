export interface Artwork {
  id: string
  title: string
  image: string
  images?: string[] // Support multiple images
  videoUrl?: string // Added video support for artworks
  description: string
  date: string
  software?: "Procreate" | "Blender" | "Krita" | "Sketchbook" | "Other"
  genre?:
    | "Character Design"
    | "Environment"
    | "Concept Art"
    | "Fan Art"
    | "Original"
    | "Study"
    | "Illustration"
    | "Sketch"
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
