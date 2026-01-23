'use client';

import { useEffect } from 'react';

interface ThemeProviderProps {
    theme?: {
        primaryColor: string;
        secondaryColor: string;
        accentColor: string;
    };
    children: React.ReactNode;
}

export function ThemeProvider({ theme, children }: ThemeProviderProps) {
    useEffect(() => {
        if (theme) {
            const root = document.documentElement;
            root.style.setProperty('--primary', theme.primaryColor);
            root.style.setProperty('--secondary', theme.secondaryColor);
            root.style.setProperty('--accent', theme.accentColor);
        }
    }, [theme]);

    return <>{children}</>;
}
