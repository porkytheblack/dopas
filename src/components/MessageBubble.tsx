'use client'

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { User, UserRound, Info, TestTube, FileText, TrendingUp, TrendingDown, Minus } from "lucide-react"
import { motion } from "framer-motion"
import ReactMarkdown from "react-markdown"

interface Message {
  id: string
  content: string
  sender: 'doctor' | 'patient' | 'system'
  timestamp: Date
  type?: 'text' | 'test_results' | 'report'
  data?: {
    results?: Array<{ result: string; description: string }>
    report?: string
  }
}

interface MessageBubbleProps {
  message: Message
}

// Helper function to determine if a test result is elevated, normal, or low
function getResultStatus(result: string): 'elevated' | 'normal' | 'low' {
  const normalizedResult = result.toLowerCase()
  if (normalizedResult.includes('elevated') || normalizedResult.includes('high')) return 'elevated'
  if (normalizedResult.includes('low') || normalizedResult.includes('decreased')) return 'low'
  return 'normal'
}

// Helper function to get the appropriate icon for result status
function getResultIcon(status: 'elevated' | 'normal' | 'low') {
  switch (status) {
    case 'elevated': return <TrendingUp className="w-4 h-4" />
    case 'low': return <TrendingDown className="w-4 h-4" />
    default: return <Minus className="w-4 h-4" />
  }
}

// Helper function to get status color
function getStatusColor(status: 'elevated' | 'normal' | 'low') {
  switch (status) {
    case 'elevated': return 'text-red-600 bg-red-50 border-red-200'
    case 'low': return 'text-blue-600 bg-blue-50 border-blue-200'
    default: return 'text-green-600 bg-green-50 border-green-200'
  }
}

// Component to render test results
function TestResultsDisplay({ results }: { results: Array<{ result: string; description: string }> }) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-4">
        <TestTube className="w-5 h-5 text-blue-600" />
        <h3 className="font-semibold text-lg text-foreground">Laboratory Results</h3>
      </div>

      <div className="space-y-3">
        {results.map((testResult, index) => {
          const status = getResultStatus(testResult.result)
          return (
            <Card key={index} className="border-l-4 border-l-blue-500">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-mono text-sm font-medium text-foreground">
                        {testResult.result}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn("text-xs", getStatusColor(status))}
                      >
                        {getResultIcon(status)}
                        <span className="ml-1 capitalize">{status}</span>
                      </Badge>
                    </div>
                    <p className="text-sm text-foreground-secondary">
                      {testResult.description}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

// Component to render medical report
function MedicalReportDisplay({ report }: { report: string }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="w-5 h-5 text-green-600" />
        <h3 className="font-semibold text-lg text-foreground">Examiner&apos;s Report</h3>
      </div>

      <Card className="border-l-4 border-l-green-500">
        <CardHeader className="pb-3">
          <CardTitle className="text-base text-foreground">Clinical Evaluation Report</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="prose prose-sm max-w-none text-foreground-secondary">
            <ReactMarkdown
              components={{
                // Custom styling for markdown elements
                h1: ({ children }) => <h1 className="text-xl font-bold text-foreground mb-3 mt-4 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-lg font-semibold text-foreground mb-2 mt-3">{children}</h2>,
                h3: ({ children }) => <h3 className="text-base font-semibold text-foreground mb-2 mt-2">{children}</h3>,
                p: ({ children }) => <p className="text-sm leading-relaxed mb-2 text-foreground-secondary">{children}</p>,
                ul: ({ children }) => <ul className="list-disc list-inside space-y-1 mb-3 ml-2">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside space-y-1 mb-3 ml-2">{children}</ol>,
                li: ({ children }) => <li className="text-sm text-foreground-secondary">{children}</li>,
                strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
                em: ({ children }) => <em className="italic text-foreground-muted">{children}</em>,
                code: ({ children }) => <code className="bg-background-secondary px-1.5 py-0.5 rounded text-xs font-mono">{children}</code>,
                blockquote: ({ children }) => <blockquote className="border-l-4 border-primary/30 pl-4 italic text-foreground-muted">{children}</blockquote>,
              }}
            >
              {report}
            </ReactMarkdown>
          </div>
        </CardContent>
      </Card>
    </div>
  )
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
          "rounded-2xl shadow-claude border-2",
          "relative overflow-hidden",
          message.type === 'test_results' || message.type === 'report'
            ? "bg-card text-foreground border-claude p-0"
            : isDoctor
              ? "bg-gradient-primary text-white border-transparent ml-4 px-5 py-4"
              : "bg-card text-foreground border-claude px-5 py-4"
        )}>
          {/* Subtle gradient overlay for doctor messages */}
          {isDoctor && message.type === 'text' && (
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
          )}
          
          {/* Render content based on message type */}
          {message.type === 'test_results' && message.data?.results ? (
            <div className="p-5">
              <TestResultsDisplay results={message.data.results} />
            </div>
          ) : message.type === 'report' && message.data?.report ? (
            <div className="p-5">
              <MedicalReportDisplay report={message.data.report} />
            </div>
          ) : (
                <p className="text-base leading-relaxed relative z-10">
                  {message.content}
                </p>
          )}
        </div>
      </div>
    </motion.div>
  )
}