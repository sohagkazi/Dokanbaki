'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4 text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Critical Error</h2>
                    <p className="text-gray-600 mb-8">Something went wrong globally.</p>
                    <button
                        onClick={() => reset()}
                        className="bg-blue-600 text-white font-bold py-2 px-6 rounded-full"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
