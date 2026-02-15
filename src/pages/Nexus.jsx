/* eslint-disable */
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, CheckCircle, Brain, MessageSquare, Send, Volume2, VolumeX } from 'lucide-react';
import TiltCard from '../components/ui/TiltCard';
import { useGamification } from '../contexts/GamificationContext';
import { useSound } from '../contexts/SoundContext';

import { useGemini } from '../contexts/GeminiContext';
import HolographicChart from '../components/ui/HolographicChart';
import Typewriter from '../components/ui/Typewriter';
import { GoogleGenerativeAI } from "@google/generative-ai";

const Nexus = () => {
    // ...
    const { addXp, skills } = useGamification();

    const [step, setStep] = useState('input'); // input, processing, result, chat
    const [logs, setLogs] = useState([]);
    const [progress, setProgress] = useState(0);
    const scrollRef = useRef(null);
    const chatRef = useRef(null);
    // Use centralized AI instance & model
    const { genAI, modelName } = useGemini();
    const [apiKey] = useState(''); // Deprecated local state, keeping for safety if referenced elsewhere but should be effectively unused

    // Form State
    const [formData, setFormData] = useState({
        subjects: '',
        interests: '',
        strengths: ''
    });

    // Result State
    const [result, setResult] = useState(null);

    const [isSpeechEnabled, setIsSpeechEnabled] = useState(false);

    // TTS Helper
    const speak = (text) => {
        if (!isSpeechEnabled || !window.speechSynthesis) return;
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.1;
        utterance.pitch = 0.9;
        // Try to find a robotic/technical voice
        const voices = window.speechSynthesis.getVoices();
        const techVoice = voices.find(v => v.name.includes('Google US English') || v.name.includes('Microsoft David')) || voices[0];
        if (techVoice) utterance.voice = techVoice;
        window.speechSynthesis.speak(utterance);
    };

    // Chat State
    const [chatHistory, setChatHistory] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    // Initial TTS Voice Load fix
    useEffect(() => {
        window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }, []);



    // Simulation Logic
    useEffect(() => {
        if (step === 'processing') {
            const sequence = [
                { msg: 'Initializing Nexus Core...', time: 500 },
                { msg: `Analyzing Academic Profile: [${formData.subjects}]...`, time: 1000 },
                { msg: 'Connecting to Gemini Neural Network...', time: 1800 },
                { msg: `Correlating Interests: [${formData.interests}]...`, time: 2600 },
                { msg: 'Synthesizing Career Trajectories...', time: 3200 },
            ];

            let timeouts = [];

            sequence.forEach(({ msg, time }) => {
                timeouts.push(setTimeout(() => {
                    setLogs(prev => [...prev, `> ${msg}`]);
                    setProgress(prev => prev + 15);
                }, time));
            });

            // Trigger AI Generation
            timeouts.push(setTimeout(() => {
                generateRealResult();
            }, 3500));

            return () => timeouts.forEach(clearTimeout);
        }
    }, [step]);



    const generateRealResult = async () => {
        if (!genAI) {
            setLogs(prev => [...prev, "> ERROR: NO NEURAL UPLINK (API KEY MISSING)"]);
            setTimeout(() => {
                setStep('input');
            }, 2000);
            return;
        }

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            // ... prompt definition ...
            const prompt = `
                Act as a futuristic Career Architect AI from the year 2150.
                Analyze this profile:
                - Subjects: ${formData.subjects}
                - Interests: ${formData.interests}
                - PROVEN SKILLS (from Arcade Simulations): ${Object.entries(skills).map(([k, v]) => `${k}: ${v}XP`).join(', ') || 'None yet'}
                
                Suggest ONE specific, high-tech career title (futuristic but realistic, e.g. Quantum Physicist, Bio-Architect).
                Provide a JSON response strictly in this format:
                {
                    "title": "Career Title",
                    "desc": "A 1-sentence inspiring description.",
                    "salary": "$XXXk",
                    "growth": "+XX% / yr",
                    "xp": 95,
                    "chartData": [
                         { "subject": "Logic", "A": 90 },
                         { "subject": "Creativity", "A": 80 },
                         { "subject": "Tech", "A": 85 },
                         { "subject": "Lead", "A": 70 },
                         { "subject": "Speed", "A": 75 }
                    ]
                }
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();

            // Clean markdown json
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);

            setResult(data);
            setChatHistory([{ sender: 'agent', text: `Analysis complete. I have calculated a ${data.xp}% probability match for ${data.title}. Initializing dialogue protocol.` }]);
            setStep('result');
            addXp(150);
            play('success');

        } catch (error) {
            console.error("AI Gen Failed", error);

            // FALLBACK SIMULATION (For 429 Rate Limits)
            if (error.message.includes('429') || error.message.includes('Quota')) {
                setLogs(prev => [...prev, "> WARNING: NEURAL NETWORK BUSY (429). ENGAGING OFFLINE SIMULATION..."]);

                setTimeout(() => {
                    const fakeData = {
                        title: "Cybernetic Systems Architect (SIMULATED)",
                        desc: "Designing neural interfaces for the next generation of synthetic humans. (Offline Mode Active)",
                        salary: "$180k",
                        growth: "+450%",
                        xp: 88,
                        chartData: [
                            { subject: "Logic", A: 95 },
                            { subject: "Creativity", A: 70 },
                            { subject: "Tech", A: 99 },
                            { subject: "Lead", A: 60 },
                            { subject: "Speed", A: 85 }
                        ]
                    };
                    setResult(fakeData);
                    setChatHistory([{ sender: 'agent', text: `[OFFLINE BACKUP] Connection unstable. Using local heuristics. Suggested role: ${fakeData.title}.` }]);
                    setStep('result');
                    play('success');
                }, 2000);
                return;
            }

            setLogs(prev => [...prev, `> CRITICAL FAILURE: ${error.message}`]);
            setTimeout(() => setStep('input'), 3000);
        }
    };

    const handleChatSubmit = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !genAI) return;

        const userMsg = chatInput;
        setChatHistory(prev => [...prev, { sender: 'user', text: userMsg }]);
        setChatInput('');
        setIsTyping(true);

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: [
                    {
                        role: "user",
                        parts: [{ text: `You are Nexus AI. We are discussing my potential career as a ${result.title}. Be concise, futuristic, and helpful.` }],
                    },
                    {
                        role: "model",
                        parts: [{ text: "Understood. Accessing database. Ready for query." }],
                    }
                ],
            });

            const resultGen = await chat.sendMessage(userMsg);
            const response = await resultGen.response;
            const text = response.text();

            setChatHistory(prev => [...prev, { sender: 'agent', text: text }]);
            speak(text);

        } catch (err) {
            setChatHistory(prev => [...prev, { sender: 'agent', text: "Connection unstable. Data packet lost." }]);
        } finally {
            setIsTyping(false);
        }
    };

    // Auto-scroll logs & chat
    useEffect(() => {
        if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }, [logs, chatHistory]);

    const handleSubmit = (e) => {
        e.preventDefault();
        setStep('processing');
        setLogs([]);
        setProgress(0);
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            <div className="mb-8 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-neon-purple/20 rounded-2xl text-neon-purple">
                        <Brain className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-headings font-bold dark:text-white">Nexus AI</h1>
                    </div>
                </div>
                <button
                    onClick={() => {
                        const next = !isSpeechEnabled;
                        setIsSpeechEnabled(next);
                        if (next) speak("Voice synthesis online.");
                        else window.speechSynthesis.cancel();
                    }}
                    className={`p-3 rounded-xl border transition-all ${isSpeechEnabled ? 'bg-neon-cyan/20 text-neon-cyan border-neon-cyan/30' : 'bg-white/5 text-gray-400 border-white/10'}`}
                >
                    {isSpeechEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
                </button>
            </div>



            <AnimatePresence mode="wait">
                {step === 'input' && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="grid grid-cols-1 lg:grid-cols-2 gap-8"
                    >
                        <TiltCard className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 md:p-8 backdrop-blur-xl">
                            <h2 className="text-xl font-bold dark:text-white mb-6">Initialize Scan Parameters</h2>
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Academic Core (Subjects)</label>
                                    <input
                                        type="text"
                                        required
                                        placeholder="e.g. Physics, Coding, Math"
                                        className="w-full p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none dark:text-white transition-all placeholder:text-gray-700 dark:placeholder:text-gray-600"
                                        value={formData.subjects}
                                        onChange={e => setFormData({ ...formData, subjects: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Personal Datastream (Interests)</label>
                                    <textarea
                                        required
                                        placeholder="e.g. Robotics, Sci-Fi, Logic Puzzles"
                                        rows="3"
                                        className="w-full p-4 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:border-neon-purple focus:ring-1 focus:ring-neon-purple outline-none dark:text-white transition-all placeholder:text-gray-700 dark:placeholder:text-gray-600"
                                        value={formData.interests}
                                        onChange={e => setFormData({ ...formData, interests: e.target.value })}
                                    ></textarea>
                                </div>
                                <button type="submit" disabled={!genAI} onClick={() => play('click')} className="w-full py-4 bg-gradient-to-r from-neon-purple to-indigo-600 text-white font-bold rounded-xl shadow-lg hover:shadow-neon-purple/25 hover:scale-[1.02] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:grayscale">
                                    <Terminal className="w-5 h-5 group-hover:animate-pulse" />
                                    {genAI ? 'Initiate Neural Handshake' : 'SYSTEM OFFLINE (ADD KEY)'}
                                </button>
                            </form>
                        </TiltCard>

                        <div className="hidden lg:flex flex-col items-center justify-center relative min-h-[400px]">
                            {/* Replaced broken image with Code-based Visual */}
                            <div className="absolute inset-0 bg-neon-purple/10 blur-[120px] rounded-full"></div>
                            <div className="relative z-10 w-64 h-64 border border-neon-cyan/30 rounded-full flex items-center justify-center animate-spin-slow duration-[20s]">
                                <div className="absolute inset-0 border border-t-neon-purple border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                                <Brain className="w-32 h-32 text-neon-cyan animate-pulse" />
                            </div>
                            <p className="mt-8 text-sm font-mono text-neon-cyan/80 tracking-widest text-center">
                                {genAI ? 'SYSTEM READY\nAWAITING INPUT...' : 'SYSTEM LOCKED\n AUTHENTICATION PENDING'}
                            </p>
                        </div>
                    </motion.div>
                )}

                {step === 'processing' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full max-w-3xl mx-auto"
                    >
                        <TiltCard>
                            <div className="bg-black rounded-3xl border border-gray-800 shadow-2xl overflow-hidden font-mono text-sm relative">
                                <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent animate-scan" />

                                <div className="bg-gray-900 px-4 py-3 border-b border-gray-800 flex items-center gap-2">
                                    <div className="nav-dot bg-red-500"></div>
                                    <div className="nav-dot bg-yellow-500"></div>
                                    <div className="nav-dot bg-green-500"></div>
                                    <span className="ml-2 text-gray-500">nexus_core.exe — pid: 8849</span>
                                </div>
                                <div ref={scrollRef} className="p-6 h-96 overflow-y-auto text-green-400 space-y-2 bg-black/90">
                                    {logs.map((log, i) => (
                                        <div key={i} className="animate-fade-in">{log}</div>
                                    ))}
                                    <div className="animate-pulse">_</div>
                                </div>
                                <div className="bg-gray-900 p-4 border-t border-gray-800">
                                    <div className="h-1 bg-gray-800 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-green-500 box-shadow-glow"
                                            initial={{ width: 0 }}
                                            animate={{ width: `${Math.min(progress, 100)}%` }}
                                        ></motion.div>
                                    </div>
                                    <div className="mt-2 text-right text-xs text-gray-400">{Math.min(Math.round(progress), 100)}% PROCESSING</div>
                                </div>
                            </div>
                        </TiltCard>
                    </motion.div>
                )}

                {step === 'result' && result && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
                    >
                        {/* Main Result */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-gradient-to-r from-neon-cyan/5 to-neon-purple/5 border border-neon-cyan/30 rounded-3xl p-8 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-32 bg-neon-cyan/10 blur-[80px] rounded-full group-hover:bg-neon-cyan/20 transition-all"></div>
                                <h2 className="text-3xl font-headings font-bold dark:text-white mb-2">Match Confirmation: {result.title}</h2>
                                <p className="text-gray-500 dark:text-gray-300 mb-6 h-12">
                                    <Typewriter text={result.desc} delay={30} />
                                </p>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                                    <div className="glass-panel p-4 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Match Confidence</p>
                                        <p className="text-2xl font-bold text-green-400">{result.xp}%</p>
                                    </div>
                                    <div className="glass-panel p-4 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Proj. Growth</p>
                                        <p className="text-2xl font-bold text-neon-cyan">{result.growth}</p>
                                    </div>
                                    <div className="glass-panel p-4 rounded-xl text-center">
                                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Est. Compensation</p>
                                        <p className="text-2xl font-bold text-neon-purple">{result.salary}</p>
                                    </div>
                                </div>

                                <div className="mb-8">
                                    <h3 className="font-bold dark:text-white mb-4">Aptitude Visualization</h3>
                                    <div className="glass-panel p-2 rounded-2xl">
                                        <HolographicChart data={result.chartData} />
                                    </div>
                                </div>

                                {/* Chat Interface */}
                                <div className="mt-8 bg-black/40 rounded-2xl border border-white/10 overflow-hidden">
                                    <div className="p-3 border-b border-white/10 bg-white/5 flex items-center gap-2">
                                        <MessageSquare className="w-4 h-4 text-neon-cyan" />
                                        <span className="text-xs font-bold text-gray-300">AGENT UPLINK</span>
                                    </div>
                                    <div ref={chatRef} className="h-64 overflow-y-auto p-4 space-y-3">
                                        {chatHistory.map((msg, i) => (
                                            <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                <div className={`max-w-[80%] p-3 rounded-lg text-sm ${msg.sender === 'user' ? 'bg-neon-date text-white bg-blue-600' : 'bg-gray-800 text-gray-200'}`}>
                                                    {msg.text}
                                                </div>
                                            </div>
                                        ))}
                                        {isTyping && (
                                            <div className="flex justify-start">
                                                <div className="bg-gray-800 text-gray-400 p-2 rounded-lg text-xs animate-pulse">Computing Response...</div>
                                            </div>
                                        )}
                                    </div>
                                    <form onSubmit={handleChatSubmit} className="p-2 border-t border-white/10 flex gap-2">
                                        <input
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                            placeholder="Ask about detailed roadmap, salary, or skills..."
                                            className="flex-1 bg-transparent px-3 py-2 text-sm text-white focus:outline-none"
                                            disabled={isTyping}
                                        />
                                        <button type="submit" disabled={isTyping} className="p-2 bg-neon-cyan/20 rounded-lg text-neon-cyan hover:bg-neon-cyan/40 transition disabled:opacity-50">
                                            <Send className="w-4 h-4" />
                                        </button>
                                    </form>
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <TiltCard className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6">
                                <h3 className="font-bold dark:text-white mb-4">Recommended Trajectory</h3>
                                <div className="space-y-6 relative">
                                    <div className="absolute left-3.5 top-2 bottom-2 w-0.5 bg-gray-200 dark:bg-white/10"></div>
                                    {[
                                        { title: 'Foundational Knowledge', type: 'Phase 1', status: 'Active' },
                                        { title: 'Specialized Certification', type: 'Phase 2', status: 'Locked' },
                                        { title: 'Field Operations (Internship)', type: 'Phase 3', status: 'Locked' },
                                    ].map((item, i) => (
                                        <div key={i} className="flex gap-4 relative">
                                            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 border-4 border-white dark:border-obsidian flex-shrink-0 z-10 flex items-center justify-center">
                                                {i === 0 ? <CheckCircle className="w-4 h-4 text-green-500" /> : <div className="w-2 h-2 rounded-full bg-gray-500" />}
                                            </div>
                                            <div>
                                                <h4 className="font-bold dark:text-white text-sm">{item.title}</h4>
                                                <span className="text-[10px] px-2 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-gray-500">{item.type}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </TiltCard>

                            <button
                                onClick={() => setStep('input')}
                                className="w-full py-3 flex items-center justify-center gap-2 text-gray-400 hover:text-white border border-white/5 rounded-xl hover:bg-white/5 transition"
                            >
                                <Brain className="w-4 h-4" />
                                Run New Simulation
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Nexus;
