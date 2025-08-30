'use client'

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Send } from "lucide-react"
import { cn } from "@/lib/utils"

interface MessageInputProps {
  onSend: (message: string) => void
  disabled?: boolean
  placeholder?: string
  centered?: boolean
}

export function MessageInput({ 
  onSend, 
  disabled = false, 
  placeholder = "Type your message...",
  centered = false
}: MessageInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!message.trim() || disabled) return
    
    onSend(message.trim())
    setMessage("")
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [message])

  if (centered) {
    return (
      <div className="w-full">
        <form onSubmit={handleSubmit} className="relative">
          <div className="relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={cn(
                "min-h-[56px] max-h-40 resize-none pr-14",
                "bg-card border-2 border-claude shadow-claude-lg",
                "rounded-2xl text-base leading-relaxed",
                "focus:border-[var(--input-border-focus)] focus:shadow-xl focus:ring-0",
                "hover:border-[var(--input-border-hover)]",
                "placeholder:text-foreground-muted",
                "transition-all duration-200 ease-in-out"
              )}
              rows={1}
            />
            
            <Button
              type="submit"
              disabled={disabled || !message.trim()}
              size="default"
              className={cn(
                "absolute right-2 bottom-2 h-10 w-10 p-0 rounded-xl",
                "bg-gradient-primary hover:opacity-90 shadow-md",
                "disabled:opacity-30 disabled:cursor-not-allowed",
                "transition-all duration-200"
              )}
            >
              <Send className="w-4 h-4" />
              <span className="sr-only">Send message</span>
            </Button>
          </div>
          
          {disabled && (
            <div className="flex items-center justify-center mt-3">
              <span className="text-sm text-foreground-muted animate-typing flex items-center gap-2">
                <div className="w-2 h-2 bg-accent-solid rounded-full animate-pulse"></div>
                Rachel is thinking...
              </span>
            </div>
          )}
        </form>
      </div>
    )
  }

  return (
    <div className="border-t border-claude bg-background p-4">
      <form onSubmit={handleSubmit} className="flex gap-3 items-end max-w-4xl mx-auto">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              "min-h-[48px] max-h-32 resize-none",
              "bg-card border-2 border-claude shadow-claude",
              "rounded-xl text-base",
              "focus:border-[var(--input-border-focus)] focus:ring-0",
              "hover:border-[var(--input-border-hover)]",
              "placeholder:text-foreground-muted",
              "transition-all duration-200"
            )}
            rows={1}
          />
        </div>
        
        <Button
          type="submit"
          disabled={disabled || !message.trim()}
          size="default"
          className={cn(
            "h-[48px] w-[48px] p-0 rounded-xl",
            "bg-gradient-primary hover:opacity-90 shadow-md",
            "disabled:opacity-30 disabled:cursor-not-allowed",
            "transition-all duration-200"
          )}
        >
          <Send className="w-4 h-4" />
          <span className="sr-only">Send message</span>
        </Button>
      </form>
      
      {disabled && (
        <div className="flex items-center justify-center mt-3">
          <span className="text-sm text-foreground-muted animate-typing flex items-center gap-2">
            <div className="w-2 h-2 bg-accent-solid rounded-full animate-pulse"></div>
            Rachel is thinking...
          </span>
        </div>
      )}
    </div>
  )
}