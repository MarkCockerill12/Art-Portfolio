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
    year: "2024",
    title: "Advanced Digital Art & Portfolio Launch",
    description:
      "Launched my online portfolio to showcase my artistic journey. Started experimenting with 3D modeling in Blender and created my first mech designs. Joined online art communities and began receiving commissions.",
    icon: "spark",
    color: "from-purple-500 to-pink-500",
  },
  {
    year: "2023",
    title: "Computing Science & Creative Coding",
    description:
      "Started my Computing Science degree, combining my love for programming with creative projects. Built interactive web experiences and learned how technology can enhance artistic expression.",
    icon: "laptop",
    color: "from-blue-500 to-cyan-500",
  },
  {
    year: "2022",
    title: "Digital Art Evolution",
    description:
      "Transitioned fully to digital art using Procreate and Clip Studio Paint. Developed my signature anime-inspired style. Started creating fan art for my favorite games and shows, building a small following.",
    icon: "art",
    color: "from-orange-500 to-red-500",
  },
  {
    year: "2021",
    title: "Discovering Digital Creation",
    description:
      "Got my first drawing tablet and fell in love with digital art. Spent countless hours learning fundamentals through YouTube tutorials and online courses. Created my first character designs.",
    icon: "art",
    color: "from-green-500 to-emerald-500",
  },
  {
    year: "2020",
    title: "Gaming & Anime Inspiration",
    description:
      "Deepened my passion for video games and anime. Became obsessed with the art styles of games like Persona and Genshin Impact. Started sketching characters from my favorite series.",
    icon: "game",
    color: "from-violet-500 to-purple-500",
  },
  {
    year: "2019",
    title: "The Beginning",
    description:
      "Picked up traditional drawing as a hobby. Started with pencil sketches and basic character studies. Discovered my love for creating original characters and telling stories through art.",
    icon: "art",
    color: "from-pink-500 to-rose-500",
  },
]

const interests = [
  { name: "Digital Art", icon: Palette, color: "bg-orange-500" },
  { name: "Video Games", icon: Gamepad2, color: "bg-purple-500" },
  { name: "Anime & Cartoons", icon: Tv, color: "bg-pink-500" },
  { name: "Programming", icon: Code, color: "bg-blue-500" },
  { name: "Tech & Gadgets", icon: Laptop, color: "bg-green-500" },
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
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-balance">My Creative Journey</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            From traditional sketches to digital masterpieces, this is the story of my artistic evolution and how I
            blend creativity with technology.
          </p>
        </div>

        {/* Interests Section */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">What I'm Passionate About</h2>
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
                        isEven ? "md:text-right md:pr-12" : "md:pl-12"
                      }`}
                    >
                      <Card className="p-6 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                        <div className="mb-3">
                          <Badge className={`bg-gradient-to-r ${event.color} text-white border-0 mb-2`}>
                            {event.year}
                          </Badge>
                        </div>
                        <h3 className="text-xl font-bold mb-3 text-balance">{event.title}</h3>
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

        {/* About Section */}
        <div className="mt-16 max-w-3xl mx-auto">
          <Card className="p-8 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
            <h2 className="text-2xl font-bold mb-4 text-center">About Me</h2>
            <p className="text-muted-foreground leading-relaxed text-center text-pretty">
              I'm a computing science student who believes that art and technology are two sides of the same creative
              coin. Whether I'm coding a new web app or sketching a character design, I'm driven by the desire to create
              something meaningful and beautiful. My work is heavily influenced by the vibrant worlds of video games,
              the emotional storytelling of anime, and the endless possibilities of digital art tools. When I'm not
              drawing or coding, you'll find me exploring new games, watching anime, or experimenting with the latest
              creative software.
            </p>
          </Card>
        </div>
      </main>
    </div>
  )
}
