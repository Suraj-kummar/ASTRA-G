import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    // 1. Initialize state based on storage or system preference
    const [themeMode, setThemeMode] = useState(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('astra_theme');
            if (saved) return saved; // 'dark' or 'light'
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
        return 'dark';
    });

    const isDark = themeMode === 'dark';

    // 2. Apply theme to document (Always Dark)
    useEffect(() => {
        const root = window.document.documentElement;
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
        localStorage.setItem('astra_theme', 'dark');
    }, []);

    const toggleTheme = () => {
        // Disabled: System is locked to Dark Mode
    };

    const value = {
        themeMode: 'dark',
        isDark: true,
        toggleTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};
