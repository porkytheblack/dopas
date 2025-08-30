'use client'

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { MessageBubble } from "./MessageBubble"
import { MessageInput } from "./MessageInput"
import { useChat } from "@/hooks/useChat"
import { AlertCircle, Activity, Stethoscope } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

export function ChatContainer() {
  const { messages, isLoading, error, sendMessage } = useChat()
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasMessages = messages.length > 0

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const handleSendMessage = async (message: string) => {
    if (!message.trim() || isLoading) return
    await sendMessage(message)
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <AnimatePresence mode="wait">
        {!hasMessages ? (
          // Claude-style empty state - centered
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 md:px-8"
          >
            {/* Welcome Section */}
            <div className="text-center space-y-8 max-w-2xl">
              {/* Logo and Title */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-primary rounded-2xl flex items-center justify-center shadow-claude-lg">
                      <Stethoscope className="w-8 h-8 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-success rounded-full flex items-center justify-center border-2 border-background">
                      <Activity className="w-3 h-3 text-white" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h1 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    Welcome to DOPAS
                  </h1>
                  <p className="text-base sm:text-lg text-foreground-secondary">
                    Doctor Patient Simulator
                  </p>
                </div>
              </div>

              {/* Patient Info Card */}
              <div className="bg-card border border-claude shadow-claude rounded-xl p-6 max-w-md mx-auto">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium text-foreground">Patient Connected</span>
                  </div>
                  <div className="text-left space-y-1">
                    <p className="text-sm text-foreground-secondary">
                      <span className="font-medium">Patient:</span> Rachel Fernandez
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      <span className="font-medium">Age:</span> 45 years old
                    </p>
                    <p className="text-sm text-foreground-secondary">
                      <span className="font-medium">Chief Complaint:</span> Severe abdominal pain
                    </p>
                  </div>
                </div>
              </div>

              {/* Instructions */}
              <div className="space-y-3">
                <p className="text-foreground-muted">
                  Begin your consultation by introducing yourself and asking about the patient&apos;s condition.
                </p>
                <div className="flex flex-wrap justify-center gap-2 text-xs text-foreground-muted">
                  <span className="px-2 py-1 bg-background-secondary rounded-md">Medical History</span>
                  <span className="px-2 py-1 bg-background-secondary rounded-md">Symptom Assessment</span>
                  <span className="px-2 py-1 bg-background-secondary rounded-md">Diagnosis</span>
                </div>
              </div>
            </div>

            {/* Centered Input */}
            <div className="w-full max-w-2xl mt-8">
              <MessageInput 
                onSend={handleSendMessage}
                disabled={isLoading}
                placeholder="Start your consultation... (e.g., 'Hello, I'm Dr. Smith. How are you feeling today?')"
                centered={true}
              />
            </div>
          </motion.div>
        ) : (
          // Chat mode - full height with messages
          <motion.div
            key="chat-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col max-w-4xl mx-auto w-full"
          >
            {/* Messages Area */}
            <ScrollArea 
              ref={scrollAreaRef}
              className="flex-1 px-4 md:px-6 py-6"
            >
              <div className="space-y-6">
                {messages.map((message) => (
                  <MessageBubble key={message.id} message={message} />
                ))}
                
                {/* Error Display */}
                {error && (
                  <Alert variant="destructive" className="mx-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {error}
                    </AlertDescription>
                  </Alert>
                )}
                
                {/* Scroll anchor */}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>

            {/* Input Area */}
            <MessageInput 
              onSend={handleSendMessage}
              disabled={isLoading}
              placeholder="Continue the consultation..."
              centered={false}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}