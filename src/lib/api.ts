'use server'
import { dopasv1 } from "./ozone/agent"

function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`
}

export interface MessageResponse {
  type: 'text' | 'test_results' | 'report'
  content: string
  data?: {
    results?: Array<{ result: string; description: string }>
    report?: string
  }
}

export async function sendMessage(message: string, sessionId?: string): Promise<MessageResponse> {
  try {
    const currentSessionId = sessionId || generateSessionId()
    dopasv1.setSessionId(currentSessionId)
    await dopasv1.init(true)
    const response = await dopasv1.run(message)
    console.log("Response::",response)
    const stringified_content = response.data?.toolCallResults?.at(0)?.content
    const response_data = stringified_content ? JSON.parse(stringified_content || '{}') : {
      answer: response.data?.answer
    }

    // Determine response type and format accordingly
    if (response_data?.results) {
      return {
        type: 'test_results',
        content: 'Test Results Available',
        data: { results: response_data.results }
      }
    }

    if (response_data?.report) {
      return {
        type: 'report',
        content: 'Medical Report',
        data: { report: response_data.report }
      }
    }

    // Default text response
    const responseText = response_data?.answer ?? response_data?.question ?? "Failed to load response..., try again"
    return {
      type: 'text',
      content: responseText
    }

  } catch (error) {
    console.error('Failed to send message:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Unable to connect to patient simulator. Please check your connection.')
    }
    
    if (error instanceof Error) {
      throw error
    }
    
    throw new Error('Technical difficulties with patient simulator. Please try again.')
  }
}

// Retry wrapper for network resilience
export async function sendMessageWithRetry(message: string, retries = 2): Promise<MessageResponse> {
  for (let i = 0; i <= retries; i++) {
    try {
      return await sendMessage(message)
    } catch (error) {
      if (i === retries) throw error
      // Wait with exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
  throw new Error('Maximum retries exceeded')
}