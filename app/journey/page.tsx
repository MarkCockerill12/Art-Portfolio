"use client"

import { Navbar } from "@/components/navbar"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Code, Gamepad2, Palette, Sparkles, Tv, Laptop } from "lucide-react"
import { useEffect, useRef } from "react"

interface TimelineEvent {
  year: string
  title: string
  description: string
  icon: "code" | "art" | "game" | "anime" | "spark" | "laptop"
  color: string
}

const timelineEvents: TimelineEvent[] = [
  {
    year: "2026-Present",
    title: "Ipad time",
    description:
      "Thanks to a wonderful friend who gave me her old Ipad Pro 2017, i was able to upgrade my tools once again through the apple 1st gen pencil and procreate. This came at a perfect time as the nib in HPs pens tend to wear out very quickly, becoming unusable and costing a lot to replace consistently. Before even really using procreatem, its evident how superior the Ipad is with drawing with the lack of noticeable parralax and synergy.",
    icon: "art",
    color: "from-orange-500 to-red-500",
  },
  {
    year: "2024-2025",
    title: "From tablet to screen",
    description:
      "As i grew my skills, i also grew my desire to upgrade my laptop, and when i did i opted for one with a touch screen, a HP x360 pavillion. I started off with a random third party pen, but soon transitioned to a Hp MPP 2.0 Tilt pen. It took a bit of getting used to, and despite a few bugs (and it ending up less than ideal) i was able to utilise my new tech to improve my skills. I experimented with different types of media in this time, with animations both 2D and pixel.",
    icon: "art",
    color: "from-green-500 to-emerald-500",
  },
  {
    year: "2023-2024",
    title: "Moving to Digital",
    description:
      "This is when i got my first drawing tablet, a Huion h640p. A simple tablet with no screen that plugged into my laptop. I started off with sketchbook, learning the basics and getting used to it more before i really started to come into my own. And when i did i moved to krita, which allowed for a lot more freedom and features.",
    icon: "game",
    color: "from-violet-500 to-purple-500",
  },
  {
    year: "2019-2022",
    title: "The Beginning",
    description:
      "This was the year i started to draw properly with pencil and paper, I had drawn a bit previously, but not regularly. I experimented with all types of styles and shading and colours. One of my first drawings was of Tails the fox, and my friend encouraged me to keep drawing and maybe one day make an art page. Of course i said no as i would never be at that level but i guess she got the last laugh.",
    icon: "art",
    color: "from-pink-500 to-rose-500",
  },
]

const interests = [
  { name: "2D illustration- Krita/Procreate", icon: Palette, color: "bg-orange-500" },  
  { name: "Pixel Art- Gale", icon: Palette, color: "bg-orange-500" },  
  { name: "Animation- Krita", icon: Laptop, color: "bg-green-500" },
  { name: "Video Games", icon: Gamepad2, color: "bg-purple-500" },
  { name: "Anime & Cartoons", icon: Tv, color: "bg-pink-500" },
  { name: "Movies & Tv", icon: Tv, color: "bg-pink-500" }

]

function getIcon(iconType: string) {
  switch (iconType) {
    case "code":
      return Code
    case "art":
      return Palette
    case "game":
      return Gamepad2
    case "anime":
      return Tv
    case "spark":
      return Sparkles
    case "laptop":
      return Laptop
    default:
      return Palette
  }
}

export default function JourneyPage() {
  const timelineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (timelineRef.current) {
      const items = timelineRef.current.querySelectorAll(".timeline-item")
      
      // Simple CSS-based animation fallback
      items.forEach((item, index) => {
        const el = item as HTMLElement
        el.style.opacity = "0"
        el.style.transform = "translateX(-50px)"
        el.style.transition = "all 0.8s cubic-bezier(0.19, 1, 0.22, 1)"
        
        setTimeout(() => {
          el.style.opacity = "1"
          el.style.transform = "translateX(0)"
        }, index * 150)
      })
    }
  }, [])

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">A lil bit about me:</h1>
        </div>

        {/* Interests Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">What/how I like to draw:</h2>
          <div className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
            {interests.map((interest) => {
              const Icon = interest.icon
              return (
                <Badge
                  key={interest.name}
                  variant="secondary"
                  className="text-base py-2 px-4 transition-all duration-300 hover:scale-110"
                >
                  <Icon className="w-4 h-4 mr-2" />
                  {interest.name}
                </Badge>
              )
            })}
          </div>
        </div>

        {/* Timeline */}
        <div className="max-w-4xl mx-auto" ref={timelineRef}>
          <h2 className="text-2xl font-bold mb-8 text-center">The Timeline</h2>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-12">
              {timelineEvents.map((event, index) => {
                const Icon = getIcon(event.icon)
                const isEven = index % 2 === 0

                return (
                  <div
                    key={event.year}
                    className={`timeline-item relative flex items-center ${
                      isEven ? "md:flex-row" : "md:flex-row-reverse"
                    } flex-col md:gap-8`}
                  >
                    {/* Year badge - centered on timeline */}
                    <div className="absolute left-8 md:left-1/2 -translate-x-1/2 z-10">
                      <div className={`bg-gradient-to-br ${event.color} p-3 rounded-full shadow-lg`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                    </div>

                    {/* Content card */}
                    <div
                      className={`w-full md:w-[calc(50%-2rem)] ml-20 md:ml-0 ${
                        isEven                       }`}
                    >
                      <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={`bg-gradient-to-r ${event.color} text-white border-0`}>
                            {event.year}
                          </Badge>
                          <h3 className="text-xl font-bold text-balance">{event.title}</h3>
                        </div>
                        <p className="text-muted-foreground text-sm leading-relaxed text-pretty">{event.description}</p>
                      </Card>
                    </div>

                    {/* Spacer for the other side */}
                    <div className="hidden md:block w-[calc(50%-2rem)]" />
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        
      </main>
    </div>
  )
}
