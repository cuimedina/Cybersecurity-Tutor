import { GoogleGenAI, HarmCategory, HarmBlockThreshold } from "@google/genai";
import { Message, Role, StudyContext, StudyMaterial } from "../types";

const SYSTEM_INSTRUCTION = `
You are a World-Class Cybersecurity Law Tutor and Exam Coach. 
Your goal is to help the user master course materials (CFAA, GDPR, FTC Act, Data Breach Liability, etc.) and write A+ law exam answers.

**CRITICAL INSTRUCTION - STRICT GROUNDING:**
You must ONLY use the provided "Knowledge Bank" (Context) to answer. 
Do NOT use outside knowledge unless explicitly asked to explain a general concept not found in the text. 
If the answer is not in the provided materials, explicitly state: "This information is not present in the provided Knowledge Bank."

TEACHING APPROACH:
1. **Identify the Core Rule**: Extract the governing principle, statute, or doctrine from the materials.
2. **Explain in Plain English**: Break it down with real-world analogies.
3. **Case & Policy Context**: Mention key cases or policy debates found in the materials.
4. **Organize**: Use hierarchical outlining (Roman numerals, bullet points).
5. **Exam Lens**: Explain how to spot this issue on an exam and how to structure the answer (IRAC).

STYLE GUIDELINES:
- Use **Bold** for rules and key terms.
- Use > Blockquotes for "Rule Statements" suitable for memorization.
- Be precise with legal terminology but accessible in explanation.
`;

// Lazy initialization to prevent app crash on load if key is missing
let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
    if (aiInstance) return aiInstance;
    
    // This value is replaced by Vite at build time
    const apiKey = process.env.API_KEY; 
    
    if (!apiKey) {
        throw new Error("API Key is missing. Please check your Vercel Environment Variables (VITE_API_KEY).");
    }
    
    aiInstance = new GoogleGenAI({ apiKey: apiKey });
    return aiInstance;
};

const getContextParts = (context: StudyContext | null) => {
    if (!context || context.materials.length === 0) return [];

    const parts: any[] = [];
    parts.push({ text: "--- BEGIN KNOWLEDGE BANK (CONTEXT) ---" });
    
    context.materials.forEach((mat, index) => {
        parts.push({ text: `[MATERIAL ${index + 1}: ${mat.category} - ${mat.name}]` });
        if (mat.type === 'file' && mat.mimeType) {
            parts.push({
                inlineData: {
                    mimeType: mat.mimeType,
                    data: mat.content
                }
            });
        } else {
            parts.push({ text: mat.content });
        }
    });

    parts.push({ text: "--- END KNOWLEDGE BANK ---" });
    parts.push({ text: "Use the above materials exclusively to answer the following." });
    return parts;
};

export const generateTutorResponse = async (
  history: Message[],
  currentContext: StudyContext | null,
  prompt: string
): Promise<string> => {
  try {
    const ai = getAI();
    const model = "gemini-2.5-flash"; 

    const chatHistory = history
        .filter(m => m.role !== Role.SYSTEM)
        .map(m => ({
            role: m.role,
            parts: [{ text: m.content }]
        }));

    const chat = ai.chats.create({
      model: model,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.5, // Lower temperature for stricter adherence to context
      },
      history: chatHistory
    });

    const contextParts = getContextParts(currentContext);
    const messageParts = [...contextParts, { text: prompt }];

    const result = await chat.sendMessage({ 
        message: messageParts 
    });
    
    return result.text || "I'm sorry, I couldn't generate a response regarding that legal concept.";

  } catch (error: any) {
    console.error("Gemini API Error:", error);
    return `Error contacting the Tutor: ${error.message || "Unknown error"}. Please check your connection or try reducing file sizes.`;
  }
};

export const generateKnowledgeBankAnalysis = async (
    context: StudyContext, 
    type: 'OUTLINE' | 'PATTERNS' | 'RULES'
): Promise<string> => {
  try {
    const ai = getAI();
    let promptText = "";
    
    if (type === 'OUTLINE') {
        promptText = `
        Analyze the entire Knowledge Bank. Create a "Metacognitive Class Outline" structured like an A+ law student's notes.
        Follow this structure:
        I. [Major Topic]
          A. [Sub-topic]
             1. [Rule/Doctrine]
                - Explanation (from materials)
                - Key Case/Statute (from materials)
        Include a "Common Pitfalls" section at the end.
        `;
    } else if (type === 'PATTERNS') {
        promptText = `
        **EXAM PATTERN ANALYSIS**
        Analyze all Exams and Materials in the Knowledge Bank to identify structural patterns and testing frequencies.
        
        Provide the output in these sections:
        1. **Most Tested Subjects**: Rank the top 5 topics by how frequently they appear in the materials.
        2. **Recurring Fact Patterns**: Describe the specific fact scenarios that trigger liability (e.g., "The Disgruntled Employee," "The Unsecured Vendor," "The Ransomware Attack").
        3. **Issue Spotting Checklist**: Create a master checklist of issues that MUST be spotted if triggered by facts.
        4. **Professor's Focus**: Identify any specific nuances, cases, or policy arguments the professor seems to emphasize repeatedly.
        `;
    } else if (type === 'RULES') {
        promptText = `
        **MASTER RULE BANK**
        Create a comprehensive Rule Bank for **every single legal issue** identified in the Knowledge Bank.
        
        For EACH issue, provide a strict entry in this format:
        
        ### [Issue Name]
        **Rule**: [The concise, black-letter rule or statute section]
        **Elements**:
        1. [Element 1]
        2. [Element 2]
        ...
        **Key Case**: [Case name cited in materials]
        **Defenses/Exceptions**: [Any valid defenses]
        
        Ensure you cover everything found in the documents, from the CFAA to State Breach Laws.
        `;
    }

    const contextParts = getContextParts(context);
    const parts = [...contextParts, { text: promptText }];

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: parts },
        config: {
            systemInstruction: SYSTEM_INSTRUCTION
        }
    });

    return response.text || "Could not generate analysis.";
  } catch (error: any) {
    console.error("Analysis Generation Error:", error);
    return `FAILED: ${error.message || "Unknown API Error"}. \n\nTip: If you uploaded large PDFs (scans), try removing them and adding smaller files. The API has a size limit for direct uploads.`;
  }
};

export const generatePracticeHypo = async (topic: string): Promise<string> => {
    const prompt = `
    Create a law school exam hypothetical (fact pattern) regarding: ${topic}.
    The facts should trigger specific legal issues found in typical Cybersecurity Law exams.
    Do NOT provide the answer yet. Just provide the Question.
    `;

    try {
        const ai = getAI();
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: { systemInstruction: SYSTEM_INSTRUCTION }
        });
        return response.text || "Could not generate hypothetical.";
    } catch (e) {
        return "Error generating hypothetical. Please check your API Key.";
    }
}
