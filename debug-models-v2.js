import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from 'fs';
import path from 'path';

// Manual .env parser
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("FATAL: No API Key found in .env");
    process.exit(1);
}

console.log(`Key Found: ${apiKey.slice(0, 5)}...${apiKey.slice(-4)}`);

const genAI = new GoogleGenerativeAI(apiKey);

const candidates = [
    "gemini-2.0-flash-exp",
    "gemini-1.5-flash",
    "gemini-1.5-flash-latest",
    "gemini-1.5-pro",
    "gemini-1.5-pro-latest",
    "gemini-1.0-pro",
    "gemini-pro",
    "gemini-pro-vision"
];

async function testAll() {
    console.log("Starting Connectivity Test...\n");
    let workingModel = null;

    for (const modelName of candidates) {
        process.stdout.write(`Testing: ${modelName.padEnd(25)} `);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello?");
            const response = await result.response;
            const text = response.text();

            if (text) {
                console.log("✅ OK");
                if (!workingModel) workingModel = modelName;
            }
        } catch (e) {
            if (e.message.includes('404')) {
                console.log("❌ 404 (Not Found)");
            } else {
                console.log(`⚠️ Error: ${e.message.split('[')[0]}`);
            }
        }
    }

    console.log("\n------------------------------------------------");
    if (workingModel) {
        console.log(`RECOMMENDATION: Use "${workingModel}"`);
    } else {
        console.log("CRITICAL: No working models found. Check API Key permissions or quota.");
        // Try listing models via REST as last resort fallback info?
        // Skipped for now, the list test is better.
    }
}

testAll();
