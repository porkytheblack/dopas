'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { User, UserRound, Info } from "lucide-react"
import { motion } from "framer-motion"

interface Message {
  id: string
  content: string
  sender: 'doctor' | 'patient' | 'system'
  timestamp: Date
}

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isDoctor = message.sender === 'doctor'
  const isSystem = message.sender === 'system'

  if (isSystem) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        className="flex justify-center my-6"
      >
        <div className="flex items-center gap-3 px-4 py-3 bg-background-secondary border border-claude rounded-xl max-w-lg shadow-claude">
          <div className="w-6 h-6 bg-info/10 rounded-full flex items-center justify-center">
            <Info className="w-3 h-3 text-info" />
          </div>
          <span className="text-sm font-medium text-foreground-secondary">
            {message.content}
          </span>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className={cn(
        "flex gap-4 mb-6 max-w-[85%]",
        isDoctor ? "ml-auto flex-row-reverse" : "mr-auto"
      )}
    >
      <Avatar className={cn(
        "shadow-claude flex-shrink-0",
        isDoctor ? "w-10 h-10" : "w-10 h-10"
      )}>
        <AvatarFallback className={cn(
          "text-sm font-medium border-2",
          isDoctor 
            ? "bg-gradient-primary text-white border-transparent" 
            : "bg-card text-foreground border-claude"
        )}>
          {isDoctor ? <User className="w-5 h-5" /> : <UserRound className="w-5 h-5" />}
        </AvatarFallback>
      </Avatar>
      
      <div className="flex flex-col space-y-1 min-w-0 flex-1">
        {/* Message Header */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-foreground-muted">
            {isDoctor ? "Dr. You" : "Rachel Fernandez"}
          </span>
          <span className="text-xs text-foreground-muted">
            {message.timestamp.toLocaleTimeString([], { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </span>
        </div>
        
        {/* Message Content */}
        <div className={cn(
          "rounded-2xl px-5 py-4 shadow-claude border-2",
          "relative overflow-hidden",
          isDoctor 
            ? "bg-gradient-primary text-white border-transparent ml-4" 
            : "bg-card text-foreground border-claude"
        )}>
          {/* Subtle gradient overlay for doctor messages */}
          {isDoctor && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          )}
          
          <p className="text-base leading-relaxed relative z-10">
            {message.content}
          </p>
        </div>
      </div>
    </motion.div>
  )
}