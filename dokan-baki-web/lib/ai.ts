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
    // 1. Try AI Generation for semantic coloring
    try {
        const styles = ['Vibrant', 'Pastel', 'Dark', 'Nature', 'Warm', 'Cool', 'Cyberpunk', 'Minimalist', 'Retro', 'Neon'];
        const randomStyle = styles[Math.floor(Math.random() * styles.length)];

        const prompt = `
        Generate a UNIQUE color palette for a shop named "${shopName}" (Type: ${businessType || 'General'}).
        
        CRITICAL: 
        - Do NOT default to Blue. 
        - Use specific, distinct colors (e.g., Crimson, Emerald, Amber, Violet, Teal, Magenta, Indigo, Lime).
        - Style: ${randomStyle}.

        Return ONLY a JSON object:
        {
            "primaryColor": "#hex",
            "secondaryColor": "#hex",
            "accentColor": "#hex"
        }
        `;

        const { text } = await generateText({
            model: aiModel,
            prompt,
        });
        const cleanText = text.replace(/```json|```/g, '').trim();
        return JSON.parse(cleanText);

    } catch (e) {
        console.error("AI Theme Generation Failed, using deterministic fallback:", e);
        return generateFallbackTheme(shopName);
    }
}

// Deterministic Fallback: Guarantees different colors for different names without AI
function generateFallbackTheme(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }

    // Generate Primary Hue from hash
    const h = Math.abs(hash) % 360;
    const s = 70 + (Math.abs(hash * 13) % 20); // 70-90% saturation
    const l = 45 + (Math.abs(hash * 7) % 15);  // 45-60% lightness

    // Function to HSL->Hex (standard algo)
    const hslToHex = (h: number, s: number, l: number) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = (n: number) => {
            const k = (n + h / 30) % 12;
            const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
            return Math.round(255 * color).toString(16).padStart(2, '0');
        };
        return `#${f(0)}${f(8)}${f(4)}`;
    };

    const primaryHex = hslToHex(h, s, l);

    // Secondary: Triadic (+120deg) or Analogous (+30deg) based on odd/even hash
    const h2 = (h + (hash % 2 === 0 ? 120 : 30)) % 360;
    const secondaryHex = hslToHex(h2, s, 85); // Light background tint

    // Accent: Complementary (+180deg)
    const h3 = (h + 180) % 360;
    const accentHex = hslToHex(h3, 90, 60);

    return {
        primaryColor: primaryHex,
        secondaryColor: secondaryHex,
        accentColor: accentHex
    };
}

function adjustColor(color: string, amount: number) { return color; } // Deprecated by new logic but kept if referenced
function invertColor(hex: string) { return '#ffffff'; }
