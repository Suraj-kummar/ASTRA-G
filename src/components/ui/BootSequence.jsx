import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const BootSequence = ({ onComplete }) => {
    const [lines, setLines] = useState([]);
    const [phase, setPhase] = useState('bios'); // bios, logo, complete

    const bootLines = [
        "BIOS DATE 01/25/2026 16:55:01 VER 1.0.9",
        "CPU: QUANTUM NEURAL CORE @ 99.9GHZ",
        "DETECTING NEURAL UPLINK... OK",
        "CHECKING MEMORY INTEGRITY... 128TB OK",
        "LOADING KERNEL... ASTRA_OS.SYS",
        "INITIALIZING GRAPHICS SUBSYSTEM...",
        "AUTHENTICATING USER BIOMETRICS...",
        "SYSTEM PREPARED. LAUNCHING INTERFACE..."
    ];

    useEffect(() => {
        let delay = 0;
        bootLines.forEach((line, i) => {
            delay += Math.random() * 300 + 100;
            setTimeout(() => {
                setLines(prev => [...prev, line]);
                // Scroll to bottom logic if needed, but fixed height helps
            }, delay);
        });

        setTimeout(() => {
            setPhase('logo');
        }, delay + 800);

        setTimeout(() => {
            onComplete();
        }, delay + 2500); // Wait for logo animation
    }, []);

    return (
        <div className="fixed inset-0 bg-black z-[99999] flex items-center justify-center overflow-hidden font-mono cursor-none">

            {phase === 'bios' && (
                <div className="w-full max-w-3xl p-8 text-neon-cyan text-sm md:text-base leading-relaxed h-full flex flex-col justify-end pb-20">
                    {lines.map((line, i) => (
                        <div key={i} className="animate-fade-in-up">
                            <span className="text-gray-500 mr-4">[{new Date().toLocaleTimeString()}]</span>
                            {line}
                        </div>
                    ))}
                    <div className="animate-pulse">_</div>
                </div>
            )}

            {phase === 'logo' && (
                <motion.div
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 1.5, opacity: 0 }}
                    className="flex flex-col items-center"
                >
                    <div className="w-32 h-32 border-4 border-neon-cyan rounded-full flex items-center justify-center relative shadow-[0_0_50px_#00f3ff]">
                        <div className="absolute inset-0 border-t-4 border-neon-purple rounded-full animate-spin"></div>
                        <div className="text-4xl font-bold text-white tracking-widest">ASTRA</div>
                    </div>
                    <p className="mt-8 text-neon-cyan/50 tracking-[0.5em] text-sm animate-pulse">SYSTEM ONLINE</p>
                </motion.div>
            )}
        </div>
    );
};

export default BootSequence;
