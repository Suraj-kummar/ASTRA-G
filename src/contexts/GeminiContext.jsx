import React, { createContext, useContext, useState, useEffect } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";

const GeminiContext = createContext();

export const useGemini = () => useContext(GeminiContext);

export const GeminiProvider = ({ children }) => {
    const [apiKey, setApiKey] = useState('');
    const [genAI, setGenAI] = useState(null);

    // Initialize Key from Env or LocalStorage
    useEffect(() => {
        const envKey = import.meta.env.VITE_GEMINI_API_KEY;
        const storedKey = localStorage.getItem('ASTRA_GEMINI_KEY');

        if (envKey && envKey !== 'REPLACE_WITH_YOUR_KEY') {
            setApiKey(envKey);
        } else if (storedKey) {
            setApiKey(storedKey);
        }
    }, []);

    // Initialize Gemini SDK
    useEffect(() => {
        if (apiKey) {
            try {
                const ai = new GoogleGenerativeAI(apiKey);
                setGenAI(ai);
                // Sync to local storage if it came from input (optional, but good for persistence if env is missing)
                if (!import.meta.env.VITE_GEMINI_API_KEY) {
                    localStorage.setItem('ASTRA_GEMINI_KEY', apiKey);
                }
            } catch (e) {
                console.error("Gemini Init Failed:", e);
            }
        }
    }, [apiKey]);
    // Centralized Model Configuration
    // Primary: gemini-2.0-flash (Efficient)
    // The codebase now handles 429 errors by gracefully degrading to simulation mode.
    const modelName = "gemini-2.0-flash";


    return (
        <GeminiContext.Provider value={{ apiKey, setApiKey, genAI, modelName }}>
            {children}
        </GeminiContext.Provider>
    );
};
