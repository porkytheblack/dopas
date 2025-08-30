'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { User, Heart } from "lucide-react"

interface PatientAvatarProps {
  name?: string
  status?: 'stable' | 'anxious' | 'critical' | 'normal'
  isThinking?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function PatientAvatar({ 
  name = "Sarah M.", 
  status = 'normal',
  isThinking = false,
  size = 'md'
}: PatientAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12", 
    lg: "w-16 h-16"
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success'
      case 'anxious': return 'bg-warning'
      case 'critical': return 'bg-destructive'
      default: return 'bg-secondary'
    }
  }

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        <Avatar className={cn(
          sizeClasses[size],
          "shadow-sm border border-border",
          isThinking && "animate-pulse"
        )}>
          <AvatarFallback className="bg-card text-card-foreground">
            {name ? getInitials(name) : <User className="w-4 h-4" />}
          </AvatarFallback>
        </Avatar>
        
        {/* Status indicator */}
        <div className={cn(
          "absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-background",
          getStatusColor(status)
        )}>
          {status === 'critical' && (
            <Heart className="w-2 h-2 text-white absolute inset-0.5" />
          )}
        </div>
      </div>
      
      <div className="flex flex-col">
        <span className="text-sm font-medium text-foreground">{name}</span>
        <Badge 
          variant="outline" 
          className={cn(
            "text-xs w-fit",
            getStatusColor(status),
            "text-white border-transparent"
          )}
        >
          {status}
        </Badge>
      </div>
    </div>
  )
}