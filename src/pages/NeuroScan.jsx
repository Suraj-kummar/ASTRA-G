/* eslint-disable */
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, ScanLine, Search, CheckCircle, AlertTriangle } from 'lucide-react';
import TiltCard from '../components/ui/TiltCard';
import Typewriter from '../components/ui/Typewriter';
import { useSound } from '../contexts/SoundContext';
import { useGemini } from '../contexts/GeminiContext';

const NeuroScan = () => {
    const { play } = useSound();
    const { genAI, modelName } = useGemini();
    const [dragActive, setDragActive] = useState(false);
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [progress, setProgress] = useState(0);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleDrag = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            processFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            processFile(e.target.files[0]);
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        setResult(null);
        setError(null);

        // Create Preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result);
        };
        reader.readAsDataURL(selectedFile);
        play('click');
    };

    const fileToGenerativePart = async (file) => {
        const base64EncodedDataPromise = new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result.split(',')[1]);
            reader.readAsDataURL(file);
        });
        return {
            inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
        };
    };

    const startScan = async () => {
        if (!genAI) {
            setError("NEURAL LINK OFFLINE (API KEY MISSING)");
            play('error');
            return;
        }

        setScanning(true);
        setProgress(0);
        setError(null);
        play('scan');

        // Fake progress for visual feedback while waiting
        const progressInterval = setInterval(() => {
            setProgress(prev => Math.min(prev + 10, 90));
        }, 500);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const imagePart = await fileToGenerativePart(file);

            const prompt = `
                Analyze this document/image in detail.
                Act as a specialized sci-fi scanner.
                Return a valid JSON object ONLY, with no code blocks or markdown, with this structure:
                {
                    "type": "Specific Type (e.g. Schematic, Invoice, Code)",
                    "confidence": "Percentage String",
                    "keywords": ["Array", "Of", "Keywords"],
                    "summary": "A detailed technical summary of what is seen.",
                    "author": "Inferred Author or Entity",
                    "date": "Inferred Date or "Unknown""
                }
            `;

            const result = await model.generateContent([prompt, imagePart]);
            const response = await result.response;
            const text = response.text();

            // Clean and Parse
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);

            clearInterval(progressInterval);
            setProgress(100);

            setTimeout(() => {
                setScanning(false);
                setResult(data);
                play('success');
            }, 500);

        } catch (err) {
            clearInterval(progressInterval);

            // FALLBACK SIMULATION (For 429 Rate Limits)
            if (err.message.includes('429') || err.message.includes('Quota')) {
                const fakeResult = {
                    type: "Encrypted Schematic (SIMULATED)",
                    confidence: "98.4%",
                    keywords: ["Simulation", "Bypass", "Offline", "Neural_Link"],
                    summary: "OFFLINE MODE: This object appears to be a high-density data crystal. Pattern recognition algorithms suggest it contains schematics for a quantum stabilizer. (Generated because API usage limit was reached)",
                    author: "Unknown Architect",
                    date: "Est. 2140"
                };

                setTimeout(() => {
                    setScanning(false);
                    setResult(fakeResult);
                    play('success');
                }, 500);
                return;
            }

            setScanning(false);
            setError("SCAN FAILED: " + err.message);
            play('error');
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
            <div className="mb-8 ">
                <h1 className="text-3xl font-headings font-bold dark:text-white flex items-center gap-3">
                    <ScanLine className="w-8 h-8 text-emerald-400" />
                    Neuro-Scan
                </h1>
                <p className="text-gray-500">Optical Character Recognition & Neural Analysis (v2.0)</p>
            </div>

            <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
                {/* Upload Zone */}
                <TiltCard className="h-full">
                    <div
                        className={`h-full border-2 border-dashed rounded-3xl transition-all flex flex-col items-center justify-center p-8 relative overflow-hidden group
                 ${dragActive ? 'border-neon-cyan bg-neon-cyan/5' : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-white/5'}
                 ${file ? 'border-emerald-500 bg-emerald-500/5' : ''}
               `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                    >
                        <input type="file" className="hidden" id="file-upload" onChange={handleFileChange} accept="image/*" />

                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.label
                                    htmlFor="file-upload"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="cursor-pointer flex flex-col items-center text-center"
                                >
                                    <div className="w-20 h-20 bg-gray-100 dark:bg-black/30 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                        <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                                    </div>
                                    <p className="text-lg font-bold dark:text-gray-200">Upload Data Stream</p>
                                    <p className="text-sm text-gray-500">Supports Images (JPG, PNG)</p>
                                </motion.label>
                            ) : (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="text-center w-full flex flex-col h-full"
                                >
                                    <div className="flex-1 relative rounded-2xl overflow-hidden mb-6 border border-white/10 bg-black/50 group-hover:border-emerald-500/50 transition-colors">
                                        {preview && <img src={preview} alt="Scan Target" className="w-full h-full object-contain" />}
                                        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur px-2 py-1 rounded text-xs font-mono text-emerald-400 border border-emerald-500/30">
                                            SRC: {file.name.slice(0, 15)}...
                                        </div>
                                    </div>

                                    {!scanning && !result && (
                                        <button
                                            onClick={startScan}
                                            className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 transition shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2"
                                        >
                                            <ScanLine className="w-5 h-5" />
                                            Initiate Neural Scan
                                        </button>
                                    )}

                                    {scanning && (
                                        <div className="w-full">
                                            <div className="flex justify-between text-xs font-bold text-emerald-500 mb-2">
                                                <span className="animate-pulse">PROCESSING NEURAL NETWORK...</span>
                                                <span>{Math.round(progress)}%</span>
                                            </div>
                                            <div className="h-2 bg-gray-200 dark:bg-black/40 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full bg-emerald-500"
                                                    animate={{ width: `${progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Scanning Animation Overlay */}
                        {scanning && (
                            <motion.div
                                className="absolute top-0 left-0 w-full h-1 bg-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.8)] z-10"
                                animate={{ top: ['0%', '100%'] }}
                                transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                            />
                        )}
                    </div>
                </TiltCard>

                {/* Analysis View */}
                <TiltCard className="h-full">
                    <div className="h-full bg-black/90 rounded-3xl border border-white/10 p-6 md:p-8 font-mono relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>
                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold mb-4 tracking-widest border-b border-white/10 pb-4">
                            <Search className="w-4 h-4" />
                            ANALYSIS_OUTPUT
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-4 text-sm scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent pr-2">
                            {!result && !scanning && !error && (
                                <div className="text-gray-600 text-center mt-32 flex flex-col items-center">
                                    <AlertTriangle className="w-12 h-12 mb-4 opacity-20" />
                                    <p>WAITING FOR UPLINK</p>
                                    <p className="text-xs mt-2 opacity-50">Upload an image to identify content.</p>
                                </div>
                            )}

                            {error && (
                                <div className="p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 mt-20 text-center">
                                    <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
                                    {error}
                                </div>
                            )}

                            {scanning && (
                                <div className="space-y-1 text-emerald-500/70 font-xs">
                                    {Array.from({ length: 12 }).map((_, i) => (
                                        <p key={i} className="animate-pulse" style={{ animationDelay: `${i * 50}ms`, opacity: 1 - (i * 0.05) }}>
                                            {`> analysing_layer_${i}_[${Math.random().toString(36).substring(7)}]... OK`}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {result && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="space-y-6"
                                >
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase">Class</p>
                                            <p className="text-white font-bold text-md truncate">{result.type}</p>
                                        </div>
                                        <div className="p-3 bg-white/5 rounded-lg border border-white/5">
                                            <p className="text-gray-500 text-[10px] uppercase">Entity</p>
                                            <p className="text-white font-bold text-md truncate">{result.author}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs mb-2">INTEGRITY CHECK</p>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 flex-1 bg-gray-800 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: result.confidence }}
                                                    className="h-full bg-emerald-400 box-shadow-glow"
                                                />
                                            </div>
                                            <p className="text-emerald-400 font-bold text-xs">{result.confidence}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="text-gray-500 text-xs mb-2">DETECTED PATTERNS</p>
                                        <div className="flex flex-wrap gap-2">
                                            {result.keywords.map((k, i) => (
                                                <span key={i} className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-[10px] border border-emerald-500/20 uppercase tracking-wider">{k}</span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl relative overflow-hidden">
                                        <div className="absolute top-0 right-0 p-10 bg-emerald-500/5 blur-3xl rounded-full pointer-events-none"></div>
                                        <p className="text-emerald-400 text-xs mb-2 font-bold flex items-center gap-2">
                                            <CheckCircle className="w-3 h-3" />
                                            DECODED DATA
                                        </p>
                                        <div className="text-gray-300 leading-relaxed text-sm h-32 overflow-y-auto pr-2">
                                            <Typewriter text={result.summary} delay={10} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </div>
                    </div>
                </TiltCard>
            </div>
        </div>
    );
};
export default NeuroScan;
