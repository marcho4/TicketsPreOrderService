"use client"

import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface FeatureCardProps {
  title: string
  description: string
  icon: ReactNode
  className?: string
}

export default function FeatureCard({ 
  title, 
  description, 
  icon, 
  className 
}: FeatureCardProps) {
  return (
    <Card className={cn("h-full", className)}>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="icon-container mb-4 relative">
          <div className="w-16 h-16 flex items-center justify-center rounded-xl bg-gradient-to-br from-lime-400 to-lime-500 p-3 
             overflow-hidden relative group">
            <div className="text-primary w-full h-full flex items-center justify-center transition-transform duration-300 
              hover:scale-[1.1] z-10">
              {icon}
            </div>
          </div>
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </CardContent>
    </Card>
  )
}