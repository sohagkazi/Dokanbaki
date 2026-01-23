import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages } = await req.json();

        // Basic validation
        if (!messages || !Array.isArray(messages)) {
            return new Response('Invalid messages format', { status: 400 });
        }

        const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
        if (!apiKey) {
            console.error("CHAT API ERROR: GOOGLE_GENERATIVE_AI_API_KEY is missing from environment variables.");
            return new Response(JSON.stringify({ error: "Server Configuration Error: API Key Missing" }), { status: 500 });
        }

        console.log(`[Chat API] Processing request with ${messages.length} messages...`);

        const result = await streamText({
            model: google('gemini-1.5-flash'),
            system: "You are a helpful AI assistant for the 'Dokan Baki' shop management application. Your goal is to help shop owners manage their dues, payments, and customers. If they encounter errors, guide them through troubleshooting. Keep answers concise and helpful.",
            messages: convertToCoreMessages(messages),
        });

        return result.toDataStreamResponse();
    } catch (error: any) {
        console.error("CHAT API ERROR:", error);
        return new Response(JSON.stringify({ error: error.message || 'Internal Server Error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}
