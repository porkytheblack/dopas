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
    `,
    test_results: `
    Blood Tests:
    - Lipase: 850 U/L (Normal: 10-140 U/L) - ELEVATED
    - Amylase: 420 U/L (Normal: 30-110 U/L) - ELEVATED
    - WBC: 12,500/μL (Normal: 4,000-11,000/μL) - SLIGHTLY ELEVATED
    - CRP: 85 mg/L (Normal: <3 mg/L) - ELEVATED
    - Glucose: 165 mg/dL (Normal: 70-100 mg/dL) - ELEVATED
    - ALT: 45 U/L (Normal: 7-35 U/L) - SLIGHTLY ELEVATED
    - AST: 52 U/L (Normal: 8-40 U/L) - SLIGHTLY ELEVATED
    - Bilirubin: 1.8 mg/dL (Normal: 0.3-1.2 mg/dL) - SLIGHTLY ELEVATED
    
    Imaging:
    - CT Abdomen: Pancreatic edema and peripancreatic fat stranding consistent with acute pancreatitis
    - No evidence of gallstones or pancreatic ductal dilatation
    `,
    report_requirements: `
    EVALUATION CRITERIA - The doctor should have addressed the following during the consultation:
    
    HISTORY TAKING (Expected to be mentioned/asked):
    - Chief complaint and pain characteristics (site, severity, onset, character, radiation)
    - Associated symptoms (nausea, vomiting, fever)
    - Pain relieving/exacerbating factors
    - Past medical and surgical history
    - Medications and allergies
    - Social history (alcohol consumption, smoking)
    - Family history of pancreatic or gallbladder disease
    
    PHYSICAL EXAMINATION (Expected to be mentioned):
    - Vital signs assessment
    - Abdominal examination (inspection, palpation, percussion, auscultation)
    - Assessment for Murphy's sign or Cullen's sign
    - General appearance and pain assessment
    
    INVESTIGATIONS (Expected to be ordered/mentioned):
    - Blood tests: Lipase, Amylase, FBC, CRP, LFTs, Glucose
    - Imaging: CT abdomen or ultrasound
    - Consideration of ECG to rule out cardiac causes
    
    DIAGNOSIS AND MANAGEMENT (Expected outcomes):
    - Correct diagnosis of acute pancreatitis
    - Pain management plan
    - Fluid resuscitation consideration
    - Dietary modifications (NPO initially)
    - Follow-up plans and monitoring
    - Patient education about condition
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

const provideTestResults = z.object({
    results: z.array(z.object({
        result: z.string(),
        description: z.string()
    }))
})


const provideReport = z.object({
    report: z.string()
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

    SPECIAL ROLE SWITCH FOR REPORTS:
    When the user types "/report", you switch roles from patient to EXAMINER/EVALUATOR. As an examiner, you evaluate the doctor's performance throughout the entire consultation based on the report_requirements criteria. You provide constructive feedback on what they did well and areas for improvement.

    RULES OF HOW TO ANSWER (as patient):
    When answering, note that you are a patient and not a doctor, so even with the provided patient information, you should not reveal it all at once. The doctor has to retrieve it from you by asking questions.
    So don't use any clinical terminology when referring to your condition, just use layman language, and do not reveal any information.

    RULES OF HOW TO ASK (as patient):
    The goal here is for the doctor in practice to demonstrate their ability to communicate effectively, so you will always need to ask in a manner that can lead to them providing a good answer back.

    RULES FOR EXAMINER REPORT:
    When providing the report, evaluate the doctor's performance against the report_requirements criteria. Provide specific feedback on:
    - What the doctor did well (commendations)
    - What was missed or could be improved (constructive criticism)
    - Overall assessment of their clinical approach
    - Specific recommendations for improvement
    Use professional, educational language appropriate for medical training.

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

    Example **provideTestResults** tool usage (only when doctor explicitly types "/tests")
    {
        name: "provideTestResults",
        args: {
            results: [
                {
                    result: "Lipase: 850 U/L (elevated)",
                    description: "Pancreatic enzyme level indicating possible pancreatic inflammation"
                },
                {
                    result: "WBC: 12,000/μL",
                    description: "White blood cell count slightly elevated"
                }
            ]
        }
    }

    Example **provideReport** tool usage (only when user specifically types "/report")
    {
        name: "provideReport",
        args: {
            report: "# CLINICAL EVALUATION REPORT\n\n## STRENGTHS OBSERVED\n\n✅ **Excellent history taking** - thorough pain assessment using appropriate framework\n✅ **Correctly identified** key symptoms and radiation pattern\n✅ **Appropriate differential diagnosis** consideration\n✅ **Accurate diagnosis** of acute pancreatitis\n\n## AREAS FOR IMPROVEMENT\n\n⚠️ **Physical examination** could have been more systematic\n⚠️ **Family history** - consider asking about pancreatic disease\n⚠️ **Pain management** discussion could be more detailed\n\n## OVERALL ASSESSMENT\n\n**Grade: B+** - Well-conducted consultation with accurate diagnosis. Strong clinical reasoning demonstrated. Minor improvements in systematic approach would enhance overall performance.\n\n## RECOMMENDATIONS\n\n1. Implement more structured physical examination approach\n2. Include family history in routine history taking\n3. Develop comprehensive pain management discussions"
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
        },
        {
            name: "provideTestResults",
            args: zodToJsonSchema(provideTestResults),
            description: "Provide test results only when the doctor explicitly mentions performing tests",
            schema: provideTestResults,
            handle: async (args) => {
                return args
            }
        },
        {
            name: "provideReport",
            args: zodToJsonSchema(provideReport),
            description: "Switch to examiner role and provide an evaluation report of the doctor's performance when user types '/report'",
            schema: provideReport,
            handle: async (args) => {
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