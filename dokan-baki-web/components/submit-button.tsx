'use client';

import { useFormStatus } from 'react-dom';
import { LogIn, Loader2 } from 'lucide-react';

export function SubmitButton() {
    const { pending } = useFormStatus();

    return (
        <button
            type="submit"
            disabled={pending}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
            {pending ? (
                <>
                    <Loader2 className="ml-2 w-4 h-4 mr-2 animate-spin" /> Logging in...
                </>
            ) : (
                <>
                    <LogIn className="ml-2 w-4 h-4 mr-2" /> Log In
                </>
            )}
        </button>
    );
}
