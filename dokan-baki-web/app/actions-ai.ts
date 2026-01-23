'use server';

import { analyzeError } from '@/lib/ai';

export async function analyzeErrorAction(message: string, stack?: string) {
    return analyzeError(message, stack);
}
