
export const runtime = 'edge';

export async function POST(req: Request) {
    const { messages } = await req.json();
    const lastMessage = messages[messages.length - 1];

    // MOCK RESPONSE FOR DEMONSTRATION

    const responseText = `I am a simulated AI assistant for Dokan Baki.
  
You asked: "${lastMessage.content}"

I can help you with:
1. Checking your total due
2. Adding a new customer
3. Viewing recent transactions

(To make me real, please configure the OpenAI API Key in .env)`;

    // Simple text stream simulation
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
        async start(controller) {
            const chunks = responseText.split(/(?=[,.\n])/); // split by basic punctuation
            for (const chunk of chunks) {
                controller.enqueue(encoder.encode(chunk));
                await new Promise(r => setTimeout(r, 50)); // typing effect
            }
            controller.close();
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
        },
    });
}
