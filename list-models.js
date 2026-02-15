
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf-8');
const apiKeyMatch = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
const apiKey = apiKeyMatch ? apiKeyMatch[1].trim() : null;

if (!apiKey) {
    console.error("No API Key");
    process.exit(1);
}

const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            if (json.error) {
                console.error("API ERROR:", json.error.message);
            } else {
                console.log("AVAILABLE MODELS:");
                if (json.models) {
                    const geminiModels = json.models.filter(m => m.name.includes('gemini'));
                    if (geminiModels.length > 0) {
                        const content = geminiModels.map(m => m.name).join('\n');
                        fs.writeFileSync('final_models.txt', content);
                        console.log("Check final_models.txt");
                    } else {
                        console.log("No 'gemini' models found. Listing all:");
                        json.models.forEach(m => console.log(`- ${m.name}`));
                    }
                } else {
                    console.log("No models found in response:", json);
                }
            }
        } catch (e) {
            console.error("Parse Error:", data);
        }
    });
}).on('error', e => console.error("Net Error", e));
