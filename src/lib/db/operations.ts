import { db, sessions, modelOutputs, toolResponses, toolCallResults, type NewToolResponse, type NewToolCallResult } from './index'
import { eq } from 'drizzle-orm'

export interface ModelOutput {
  role?: "user" | "assistant" | "system"
  answer: string | undefined
  toolResponses?: Array<{ name: string, args: Record<string, unknown>, id?: string }> | undefined
  toolCallResults?: Array<{ id: string, tool: string, content: string }>
}

export async function getOrCreateSession(sessionId: string) {
  // Try to find existing session
  const [existingSession] = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId))
  
  if (existingSession) {
    return existingSession
  }
  
  // Create new session
  const [newSession] = await db.insert(sessions).values({
    sessionId,
  }).returning()
  
  return newSession
}

export async function insertModelOutput(data: ModelOutput, sessionId?: string) {
  return await db.transaction(async (tx) => {
    let sessionDbId: number | null = null
    
    if (sessionId) {
      const session = await getOrCreateSession(sessionId)
      sessionDbId = session.id
    }
    
    // Insert main model output
    const [modelOutput] = await tx.insert(modelOutputs).values({
      sessionId: sessionDbId,
      role: data.role,
      answer: data.answer,
    }).returning()

    // Insert tool responses if they exist
    if (data.toolResponses && data.toolResponses.length > 0) {
      const toolResponsesData: NewToolResponse[] = data.toolResponses.map(tr => ({
        modelOutputId: modelOutput.id,
        name: tr.name,
        args: tr.args,
        toolId: tr.id,
      }))
      
      await tx.insert(toolResponses).values(toolResponsesData)
    }

    // Insert tool call results if they exist
    if (data.toolCallResults && data.toolCallResults.length > 0) {
      const toolCallResultsData: NewToolCallResult[] = data.toolCallResults.map(tcr => ({
        modelOutputId: modelOutput.id,
        toolId: tcr.id,
        tool: tcr.tool,
        content: tcr.content,
      }))
      
      await tx.insert(toolCallResults).values(toolCallResultsData)
    }

    return modelOutput
  })
}

export async function getModelOutput(id: number) {
  const [modelOutput] = await db.select().from(modelOutputs).where(eq(modelOutputs.id, id))
  
  if (!modelOutput) return null

  const relatedToolResponses = await db.select().from(toolResponses).where(eq(toolResponses.modelOutputId, id))
  const relatedToolCallResults = await db.select().from(toolCallResults).where(eq(toolCallResults.modelOutputId, id))

  return {
    ...modelOutput,
    toolResponses: relatedToolResponses.map(tr => ({
      name: tr.name,
      args: tr.args as Record<string, unknown>,
      id: tr.toolId,
    })),
    toolCallResults: relatedToolCallResults.map(tcr => ({
      id: tcr.toolId,
      tool: tcr.tool,
      content: tcr.content,
    })),
  }
}

export async function getAllModelOutputs() {
  return await db.select().from(modelOutputs).orderBy(modelOutputs.createdAt)
}

export async function deleteModelOutput(id: number) {
  await db.delete(modelOutputs).where(eq(modelOutputs.id, id))
}

export async function getSessionHistory(sessionId: string) {
  const session = await db.select().from(sessions).where(eq(sessions.sessionId, sessionId))
  
  if (!session.length) {
    return []
  }

  const outputs = await db.select().from(modelOutputs)
    .where(eq(modelOutputs.sessionId, session[0].id))
    .orderBy(modelOutputs.createdAt)

  // Fetch related tool data for each output
  const enrichedOutputs = await Promise.all(
    outputs.map(async (output) => {
      const relatedToolResponses = await db.select().from(toolResponses).where(eq(toolResponses.modelOutputId, output.id))
      const relatedToolCallResults = await db.select().from(toolCallResults).where(eq(toolCallResults.modelOutputId, output.id))

      return {
        ...output,
        toolResponses: relatedToolResponses.map(tr => ({
          name: tr.name,
          args: tr.args as Record<string, unknown>,
          id: tr.toolId || undefined,
        })),
        toolCallResults: relatedToolCallResults.map(tcr => ({
          id: tcr.toolId,
          tool: tcr.tool,
          content: tcr.content,
        })),
      }
    })
  )

  return enrichedOutputs
}

export async function updateModelOutput(id: number, data: Partial<ModelOutput>) {
  const [updated] = await db.update(modelOutputs)
    .set({
      role: data.role,
      answer: data.answer,
      updatedAt: new Date(),
    })
    .where(eq(modelOutputs.id, id))
    .returning()

  return updated
}