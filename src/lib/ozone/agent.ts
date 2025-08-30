import z from "zod"
import { AgentBuilder } from "ozone-builder"
import { router } from "./router"
import zodToJsonSchema from "zod-to-json-schema"
import { insertModelOutput, getSessionHistory } from "../db/operations"

const PATIENT_DATA = {
    name: "Rachel Fernandez",
    age: "45",
    gender: "Female",
    marital_status: "Married",
    children: "1 son",
    setup: "You came to the ED with severe abdominal pain",
    race: "Caucacian",
    body: "Obese",
    presentation: `
    Abdominal Pain 

    Site: Epigastric area
    Severity: 10/10
    Onset: Sudden
    When it started: Yesterday
    Progression: Intense through out
    Character: Severe, agonising
    Radiation: Goes to the back 
    Alleviating/Relieving factors: Gets better when leaning forward. 
    Analgesia: Not tried
    Timing: Present all the time
    Exacerbating factors: None

    Important associated symptoms: 
    Nausea: Yes/No
    Vomiting: No
    Fever: No


    Past Medical History: None
    Past Surgical History: None
    Routine Medications: None
    Allergies: None
    Alcohol: No
    Smoking: No
    `
} as const

function patientDataToString(data: typeof PATIENT_DATA) {
    let data_str = ``

    for (const key in data) {
        const v = data[key as keyof typeof data]

        data_str += `\n <${key}>\n   ${v}\n</${key}>`
    }

    return data_str
}

const askDoctor = z.object({
    question: z.string()
})

const answerDoctor = z.object({
    answer: z.string()
})



const dopasv1 = new AgentBuilder(router, 1, true)

dopasv1
.prompt({
    instruction: `
    You are a Patient simulator agent interacting with a student doctor.
    In this roleplay simulation:
    The doctor is being examined on how they approach asking questions to a patient, and if they are able to extract useful information from their interaction with the patient.
    Your role is to act as a patient, using the provided Patient data as a basis for your responses. 
    You may also use the conversation history to drive your conversation with the doctor.
    In this conversation, you wait for the doctor to ask questions until they have been able to extract relevant information from you, and give you a diagnosis.
    After the diagnosis has been provided by the doctor, your role is to ask the doctor questions like a patient would. About their condition, how long you will take to recover
    The conversation is meant to be serious as you are sick and needed to go to the hospital, but light casual chats are also allowed.

    RULES OF HOW TO ANSWER:
    When answering, note that you are a patient and not a doctor, so even with the provided patient information, you should not reveal it all at once. The doctor has to retrieve it from you by asking questions.
    So don't use any clinical terminology when referring to your condition, just use layman language, and do not reveal any information.

    RULES OF HOW TO ASK:
    The goal here is for the doctor in practice to demonstrate their ability to communicate effectively, so you will always need to ask in a manner that can lead to them providing a good answer back.

    PATIENT DATA:
    ${patientDataToString(PATIENT_DATA)}
    `,
    examples: `
    Example **answerDoctor** tool usage for the question how long have u been feeling this way
    {
        name: "answerDoctor",
        args: {
            answer: "I can't really pinpoint it since this pain has been with me for a while but it was more aggressive since yesterday"
        }
    }

    Example **askDoctor** tool usage
    {
        name: "askDoctor",
        args: {
            question: "When do u think i'll be back to my normal self?"
        }
    }
    `,
    tools: [
        {
            name: "answerDoctor",
            args: zodToJsonSchema(answerDoctor),
            description: "Answer a question asked by the doctor",
            schema: answerDoctor,
            handle: async (args)=>{
                return args
            },
        },
        {
            name: "askDoctor",
            args: zodToJsonSchema(askDoctor),
            description: "Ask the doctor about your condition or diagnosis",
            schema: askDoctor,
            handle: async (args)=>{
                return args
            }
        }
    ]
})

dopasv1.addUpdater(async (data, sessionId)=>{
    try {
        // Persist the ModelOutput data to database
        await insertModelOutput({
            role: data.role,
            answer: data.answer,
            toolResponses: data.toolResponses,
            toolCallResults: data.toolCallResults,
        }, sessionId)
    } catch (error) {
        console.error('Failed to persist model output:', error)
    }
})

dopasv1.addInitLoader(async (sessionId)=>{
    try {
        if (!sessionId) return []
        
        // Fetch conversation history for this session
        const history = await getSessionHistory(sessionId)
        
        // Convert database records to the format expected by the agent
        return history.map(output => ({
            role: output.role as "user" | "assistant" | "system" | undefined,
            answer: output.answer ?? undefined,
            toolResponses: output.toolResponses?.map(tr => ({
                name: tr.name,
                args: tr.args as Record<string, unknown>,
                id: tr.id || undefined,
            })) || undefined,
            toolCallResults: output.toolCallResults?.map(tcr => ({
                id: tcr.id,
                tool: tcr.tool,
                content: tcr.content,
            })) || undefined,
        }))
    } catch (error) {
        console.error('Failed to load session history:', error)
        return []
    }
})

export {
    dopasv1
}