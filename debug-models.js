import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env parser since dotenv might not be installed
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("Could not find API Key in .env");
    process.exit(1);
}

console.log("Using Key ending in:", apiKey.slice(-4));

const genAI = new GoogleGenerativeAI(apiKey);

async function listModels() {
    try {
        // This is a workaround to list models using REST if SDK doesn't expose it easily,
        // but let's try a fallback: testing common names.
        
        const candidates = [
            "gemini-1.5-flash",
            "gemini-1.5-flash-latest",
            "gemini-1.5-pro",
            "gemini-pro",
            "gemini-1.5-flash-8b",
            "gemini-2.0-flash-exp"
        ];
        
        console.log("\nTesting Model Availability...");
        
        for (const name of candidates) {
            try {
                const model = genAI.getGenerativeModel({ model: name });
                const result = await model.generateContent("Test.");
                console.log(`✅ ${name}: AVAILABLE`);
            } catch (e) {
                if (e.message.includes("404")) {
                     console.log(`❌ ${name}: NOT FOUND (404)`);
                } else {
                     console.log(`⚠️ ${name}: ERROR (${e.message.split('[')[0]})`);
                }
            }
        }
        
    } catch (e) {
        console.error("Fatal Error:", e);
    }
}

listModels();
