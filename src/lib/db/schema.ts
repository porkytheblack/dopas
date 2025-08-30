import { pgTable, serial, text, timestamp, jsonb, integer, varchar } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const sessions = pgTable('sessions', {
  id: serial('id').primaryKey(),
  sessionId: varchar('session_id', { length: 255 }).unique().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const modelOutputs = pgTable('model_outputs', {
  id: serial('id').primaryKey(),
  sessionId: integer('session_id').references(() => sessions.id, { onDelete: 'cascade' }),
  role: varchar('role', { length: 20 }),
  answer: text('answer'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
})

export const toolResponses = pgTable('tool_responses', {
  id: serial('id').primaryKey(),
  modelOutputId: integer('model_output_id').references(() => modelOutputs.id, { onDelete: 'cascade' }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  args: jsonb('args').notNull(),
  toolId: varchar('tool_id', { length: 255 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

export const toolCallResults = pgTable('tool_call_results', {
  id: serial('id').primaryKey(),
  modelOutputId: integer('model_output_id').references(() => modelOutputs.id, { onDelete: 'cascade' }).notNull(),
  toolId: varchar('tool_id', { length: 255 }).notNull(),
  tool: varchar('tool', { length: 255 }).notNull(),
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
})

// Relations
export const sessionsRelations = relations(sessions, ({ many }) => ({
  modelOutputs: many(modelOutputs),
}))

export const modelOutputsRelations = relations(modelOutputs, ({ many, one }) => ({
  session: one(sessions, {
    fields: [modelOutputs.sessionId],
    references: [sessions.id],
  }),
  toolResponses: many(toolResponses),
  toolCallResults: many(toolCallResults),
}))

export const toolResponsesRelations = relations(toolResponses, ({ one }) => ({
  modelOutput: one(modelOutputs, {
    fields: [toolResponses.modelOutputId],
    references: [modelOutputs.id],
  }),
}))

export const toolCallResultsRelations = relations(toolCallResults, ({ one }) => ({
  modelOutput: one(modelOutputs, {
    fields: [toolCallResults.modelOutputId],
    references: [modelOutputs.id],
  }),
}))

// Types
export type Session = typeof sessions.$inferSelect
export type NewSession = typeof sessions.$inferInsert
export type ModelOutput = typeof modelOutputs.$inferSelect
export type NewModelOutput = typeof modelOutputs.$inferInsert
export type ToolResponse = typeof toolResponses.$inferSelect
export type NewToolResponse = typeof toolResponses.$inferInsert
export type ToolCallResult = typeof toolCallResults.$inferSelect
export type NewToolCallResult = typeof toolCallResults.$inferInsert