"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Filter, X, Check } from "lucide-react"
import type { Artwork } from "@/lib/types"

interface FilterPanelProps {
  filters: {
    software: string[]
    genre: string[]
    isDigital: boolean | null
    favoritesOnly: boolean
  }
  onFilterChange: (filters: any) => void
}

const softwareOptions: Artwork["software"][] = [
  "Procreate",
  "Blender",
  "Krita",
  "Other",
]

const genreOptions: Artwork["genre"][] = [
  "Character Design",
  "Environment",
  "Concept Art",
  "Fan Art",
  "Original",
  "Study",
  "Illustration",
  "Sketch",
]

export function FilterPanel({ filters, onFilterChange }: FilterPanelProps) {
  const toggleSoftware = (software: string) => {
    const newSoftware = filters.software.includes(software)
      ? filters.software.filter((s) => s !== software)
      : [...filters.software, software]
    onFilterChange({ ...filters, software: newSoftware })
  }

  const toggleGenre = (genre: string) => {
    const newGenre = filters.genre.includes(genre)
      ? filters.genre.filter((g) => g !== genre)
      : [...filters.genre, genre]
    onFilterChange({ ...filters, genre: newGenre })
  }

  const setDigitalFilter = (value: boolean | null) => {
    onFilterChange({ ...filters, isDigital: value })
  }

  const toggleFavorites = () => {
    onFilterChange({ ...filters, favoritesOnly: !filters.favoritesOnly })
  }

  const clearAllFilters = () => {
    onFilterChange({
      software: [],
      genre: [],
      isDigital: null,
      favoritesOnly: false,
    })
  }

  const activeFilterCount =
    filters.software.length +
    filters.genre.length +
    (filters.isDigital !== null ? 1 : 0) +
    (filters.favoritesOnly ? 1 : 0)

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all duration-200 bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            Software
            {filters.software.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {filters.software.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm mb-3">Drawing Software</h4>
            <div className="space-y-2">
              {softwareOptions.map((software) => (
                <label
                  key={software}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.software.includes(software)}
                    onChange={() => toggleSoftware(software)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm flex-1">{software}</span>
                  {filters.software.includes(software) && <Check className="w-4 h-4 text-primary" />}
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="transition-all duration-200 bg-transparent">
            <Filter className="w-4 h-4 mr-2" />
            Genre
            {filters.genre.length > 0 && (
              <Badge variant="secondary" className="ml-2 px-1.5 py-0.5 text-xs">
                {filters.genre.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-64">
          <div className="space-y-1">
            <h4 className="font-semibold text-sm mb-3">Art Genre</h4>
            <div className="space-y-2">
              {genreOptions.map((genre) => (
                <label
                  key={genre}
                  className="flex items-center gap-3 cursor-pointer hover:bg-accent/50 p-2 rounded-md transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={filters.genre.includes(genre)}
                    onChange={() => toggleGenre(genre)}
                    className="w-4 h-4 rounded border-border accent-primary cursor-pointer"
                  />
                  <span className="text-sm flex-1">{genre}</span>
                  {filters.genre.includes(genre) && <Check className="w-4 h-4 text-primary" />}
                </label>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant={filters.isDigital !== null ? "default" : "outline"}
            size="sm"
            className="transition-all duration-200"
          >
            <Filter className="w-4 h-4 mr-2" />
            {filters.isDigital === null ? "All Media" : filters.isDigital ? "Digital" : "Traditional"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start">
          <DropdownMenuLabel>Media Type</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuCheckboxItem checked={filters.isDigital === null} onCheckedChange={() => setDigitalFilter(null)}>
            All Media
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem checked={filters.isDigital === true} onCheckedChange={() => setDigitalFilter(true)}>
            Digital Only
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={filters.isDigital === false}
            onCheckedChange={() => setDigitalFilter(false)}
          >
            Traditional Only
          </DropdownMenuCheckboxItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Favorites Toggle */}
      <Button
        variant={filters.favoritesOnly ? "default" : "outline"}
        size="sm"
        onClick={toggleFavorites}
        className="transition-all duration-200"
      >
        Favorites Only
      </Button>

      {/* Clear Filters */}
      {activeFilterCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearAllFilters}
          className="text-muted-foreground hover:text-foreground transition-all duration-200"
        >
          <X className="w-4 h-4 mr-2" />
          Clear All ({activeFilterCount})
        </Button>
      )}
    </div>
  )
}
