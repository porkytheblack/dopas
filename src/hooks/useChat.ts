'use client'

import { useState, useCallback } from 'react'
import { sendMessage as sendMessageAction } from '@/lib/api'

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export interface Message {
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

interface ChatState {
  messages: Message[]
  isLoading: boolean
  error: string | null
  sessionId: string
}

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isLoading: false,
    error: null,
    sessionId: generateSessionId(),
  })

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim()) return

    // Add doctor message immediately (optimistic UI)
    const doctorMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'doctor',
      timestamp: new Date(),
    }
    
    setState(prev => ({ 
      ...prev, 
      messages: [...prev.messages, doctorMessage],
      isLoading: true,
      error: null 
    }))

    try {
      // Call backend via server action with session ID
      const patientResponse = await sendMessageAction(content, state.sessionId)
      
      // Add patient response
      const patientMessage: Message = {
        id: crypto.randomUUID(),
        content: patientResponse.content,
        sender: 'patient',
        timestamp: new Date(),
        type: patientResponse.type,
        data: patientResponse.data,
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, patientMessage],
        isLoading: false,
      }))

    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error 
          ? error.message 
          : 'Failed to communicate with patient simulator',
      }))
    }
  }, [state.sessionId])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const addSystemMessage = useCallback((content: string) => {
    const systemMessage: Message = {
      id: crypto.randomUUID(),
      content,
      sender: 'system',
      timestamp: new Date(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, systemMessage],
    }))
  }, [])

  return { 
    ...state, 
    sendMessage, 
    clearError, 
    addSystemMessage 
  }
}