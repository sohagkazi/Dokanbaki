'use client';

import { useEffect, useState } from 'react';
import { analyzeErrorAction } from './actions-ai';
import { Bot, RefreshCw, Home, AlertCircle } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);

        // Auto-trigger AI Analysis
        setLoadingAi(true);
        analyzeErrorAction(error.message, error.stack)
            .then(setAiAnalysis)
            .catch(() => setAiAnalysis("Unable to generate solution at this time."))
            .finally(() => setLoadingAi(false));

    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4 py-12 text-center font-sans">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-2xl w-full border border-gray-100">
                <div className="bg-red-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                </div>

                <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Something went wrong!</h2>
                <p className="text-gray-500 mb-8">We encountered an unexpected error. The app has attempted to analyze the issue.</p>

                {/* AI Solution Panel */}
                <div className="bg-blue-50/50 rounded-2xl p-6 text-left mb-8 border border-blue-50 relative overflow-hidden">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="bg-blue-600 p-1.5 rounded-lg">
                            <Bot className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="font-bold text-blue-900">AI Suggested Solution</h3>
                    </div>

                    {loadingAi ? (
                        <div className="space-y-3 animate-pulse">
                            <div className="h-4 bg-blue-100 rounded w-3/4"></div>
                            <div className="h-4 bg-blue-100 rounded w-1/2"></div>
                            <div className="h-4 bg-blue-100 rounded w-5/6"></div>
                        </div>
                    ) : (
                        <div className="prose prose-sm text-gray-700 max-w-none">
                            <p className="whitespace-pre-line">{aiAnalysis || "Analyzing..."}</p>
                        </div>
                    )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={() => reset()}
                        className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition shadow-lg shadow-blue-500/30"
                    >
                        <RefreshCw className="w-4 h-4" /> Try again
                    </button>
                    <a href="/" className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 font-bold py-3 px-8 rounded-full hover:bg-gray-50 transition shadow-sm">
                        <Home className="w-4 h-4" /> Go Home
                    </a>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-8 pt-8 border-t border-gray-100 text-left">
                        <details className="cursor-pointer group">
                            <summary className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 group-hover:text-gray-600 transition-colors">Technical Details</summary>
                            <div className="p-4 bg-gray-900 rounded-xl overflow-auto max-h-64 shadow-inner">
                                <p className="font-mono text-xs text-red-300 font-bold mb-2">{error.message}</p>
                                <p className="font-mono text-[10px] text-gray-400 whitespace-pre-wrap">{error.stack}</p>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}
