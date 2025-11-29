"use client"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ArrowUpDown } from "lucide-react"

export type SortOption = "date-desc" | "date-asc" | "title-asc" | "title-desc"

interface SortDropdownProps {
  sortBy: SortOption
  onSortChange: (sort: SortOption) => void
}

export function SortDropdown({ sortBy, onSortChange }: SortDropdownProps) {
  const sortLabels: Record<SortOption, string> = {
    "date-desc": "Newest First",
    "date-asc": "Oldest First",
    "title-asc": "Title (A-Z)",
    "title-desc": "Title (Z-A)",
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="transition-all duration-200 bg-background/60 backdrop-blur-md border-border/50">
          <ArrowUpDown className="w-4 h-4 mr-2" />
          {sortLabels[sortBy]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuLabel>Sort By</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuRadioGroup value={sortBy} onValueChange={(value) => onSortChange(value as SortOption)}>
          <DropdownMenuRadioItem value="date-desc">Newest First</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="date-asc">Oldest First</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title-asc">Title (A-Z)</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="title-desc">Title (Z-A)</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
