import { google } from '@ai-sdk/google';
import { generateText, streamText } from 'ai';

export const aiModel = google('gemini-1.5-flash');

export async function askAI(prompt: string, context?: string) {
    try {
        const { text } = await generateText({
            model: aiModel,
            system: "You are a helpful assistant for the 'Dokan Baki' application. You help users troubleshoot errors and navigate the app.",
            prompt: context ? `Context: ${context}\n\nUser Question: ${prompt}` : prompt,
        });
        return text;
    } catch (error) {
        console.error("AI Error:", error);
        return "Sorry, I am unable to process your request at the moment due to technical difficulties.";
    }
}

export async function analyzeError(errorMessage: string, stackTrace?: string) {
    const prompt = `
    An error occurred in the Dokan Baki application.
    Error Message: ${errorMessage}
    Stack Trace: ${stackTrace || 'Not available'}
    
    Please provide a user-friendly explanation of what might have gone wrong and suggest potential solutions for the user or developer.
    `;

    return askAI(prompt);
}

export async function generateUserTheme(shopName: string, businessType?: string) {
    const prompt = `
    Generate a color palette for a shop named "${shopName}" which is a "${businessType || 'general store'}".
    Return ONLY a JSON object with this exact structure, no markdown:
    {
        "primaryColor": "#hex",
        "secondaryColor": "#hex",
        "accentColor": "#hex"
    }
    Colors should be professional, harmonious, and suitable for a mobile app UI.
    `;

    try {
        const { text } = await generateText({
            model: aiModel,
            prompt,
        });
        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (e) {
        console.error("AI Theme Generation Failed:", e);
        return {
            primaryColor: '#2563eb', // Default Blue
            secondaryColor: '#4f46e5',
            accentColor: '#f97316'
        };
    }
}
