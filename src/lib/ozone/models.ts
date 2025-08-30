import { Model } from "ozone-model"
import {Effect}  from "effect";
import OpenAI from "openai"

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
})


export const openai_model = Model.define({
        promptLevel: `1`,
        name: "gpt-4o",
        Asker: (input, history = []) => {
            const messages = history?.map((output) => {

                if((output.toolResponses?.length ?? 0) > 0){
                    const response = [
                        {
                            role: "assistant",
                            content: null, 
                            tool_calls: output.toolResponses?.map((resp)=>{
                                return {
                                    function: { 
                                        name: resp.name,
                                        arguments: JSON.stringify(resp.args ?? {})
                                    },
                                    type: "function",
                                    id: resp.id
                                }
                            })
                            
                        } as any
                    ]
                    output.toolResponses?.map((t_response)=>{
                        const matching_call = output.toolCallResults?.find(r => r.id == t_response.id)
                        if(!matching_call) throw new Error("Tool Response without matching call result");

                        response.push({
                            role: "tool",
                            tool_call_id: t_response.id,
                            content: matching_call.content
                        })
                    })

                    return response
                }
                
                return {
                    role: output.role ?? "assistant" as const,
                    content: output.answer ?? null
                }
            }).flat();
            return Effect.tryPromise({
                try: async () => {

                    const response = await openai.chat.completions.create({
                        model: "gpt-4o",
                        messages: [
                            ...messages,
                            {
                                role: "assistant",
                                name: input.toolName,
                                content: input.question,
                            }
                        ],
                        tools: input.tools?.map((tool) => ({
                            function: {
                                description: tool.description,
                                name: tool.name,
                                parameters: tool.args
                            },
                            type: "function"
                        }))
                    })

                    
                    const message_content = response.choices?.[0]?.message?.content ?? ""
                    const function_res = response.choices[0].message.tool_calls?.map((res)=>{
                        return {
                            name: res.function.name,
                            args: JSON.parse(res.function.arguments),
                            id: res.id
                        }
                    })

                    return {
                        answer: message_content,
                        toolResponses: function_res
                    }
                },
                catch: (error) => {
                    console.log(`Error in model: ${error}`)
                    return error
                }
            })
        }
    })