'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { HelpCircle, Stethoscope, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeaderProps {
  patientName?: string
  patientStatus?: 'stable' | 'anxious' | 'critical' | 'normal'
}

export function Header({ 
  patientName = "Rachel Fernandez", 
  patientStatus = 'normal' 
}: HeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'stable': return 'bg-success/90 text-white border-success/20'
      case 'anxious': return 'bg-warning/90 text-white border-warning/20'
      case 'critical': return 'bg-destructive/90 text-white border-destructive/20'
      default: return 'bg-secondary/80 text-white border-secondary/20'
    }
  }

  return (
    <header className="h-14 sm:h-16 border-b border-claude bg-background/80 backdrop-blur-sm px-4 sm:px-6 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-3 sm:gap-6">
        {/* DOPAS Logo/Brand */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center shadow-claude">
            <Stethoscope className="w-4 h-4 text-white" />
          </div>
          <h1 className="text-xl font-semibold text-foreground tracking-tight">DOPAS</h1>
        </div>
        
        {/* Patient Info - Hidden on mobile, shown on tablet+ */}
        <div className="hidden sm:flex items-center gap-3 px-3 sm:px-4 py-2 bg-background-secondary rounded-xl border border-claude">
          <UserRound className="w-4 h-4 text-foreground-muted" />
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">{patientName}</span>
            <Badge 
              variant="outline" 
              className={cn(
                "text-xs font-medium border-2",
                getStatusColor(patientStatus)
              )}
            >
              {patientStatus}
            </Badge>
          </div>
        </div>
      </div>

      {/* Help Button */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm"
              className="text-foreground-muted hover:text-foreground hover:bg-background-secondary rounded-lg transition-all duration-200"
            >
              <HelpCircle className="w-4 h-4" />
              <span className="sr-only">Help</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Get help with patient consultation</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </header>
  )
}