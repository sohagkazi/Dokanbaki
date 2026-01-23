import { google } from '@ai-sdk/google';
import { streamText, convertToCoreMessages } from 'ai';

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
    const { messages } = await req.json();

    const result = await streamText({
        model: google('gemini-1.5-flash'),
        system: "You are a helpful AI assistant for the 'Dokan Baki' shop management application. Your goal is to help shop owners manage their dues, payments, and customers. If they encounter errors, guide them through troubleshooting.",
        messages: convertToCoreMessages(messages),
    });

    return result.toDataStreamResponse();
}
