import React, { createContext, useContext, useRef, useEffect, useState } from 'react';

const SoundContext = createContext();

export const useSound = () => useContext(SoundContext);

export const SoundProvider = ({ children }) => {
    const audioCtxRef = useRef(null);
    const [isMuted, setIsMuted] = useState(false);

    useEffect(() => {
        // Initialize Audio Context on user interaction if needed
        const initAudio = () => {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
            }
        };
        window.addEventListener('click', initAudio, { once: true });
        return () => window.removeEventListener('click', initAudio);
    }, []);

    const playTone = (freq, type, duration, vol = 0.1) => {
        if (isMuted || !audioCtxRef.current) return;

        // Resume context if suspended
        if (audioCtxRef.current.state === 'suspended') {
            audioCtxRef.current.resume();
        }

        const osc = audioCtxRef.current.createOscillator();
        const gain = audioCtxRef.current.createGain();

        osc.type = type;
        osc.frequency.setValueAtTime(freq, audioCtxRef.current.currentTime);

        gain.gain.setValueAtTime(vol, audioCtxRef.current.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtxRef.current.currentTime + duration);

        osc.connect(gain);
        gain.connect(audioCtxRef.current.destination);

        osc.start();
        osc.stop(audioCtxRef.current.currentTime + duration);
    };

    const play = (soundType) => {
        if (isMuted) return;

        switch (soundType) {
            case 'hover':
                // High tech chirp
                playTone(800, 'sine', 0.05, 0.05);
                setTimeout(() => playTone(1200, 'sine', 0.05, 0.02), 50);
                break;
            case 'click':
                // Mechanical click
                playTone(300, 'square', 0.05, 0.05);
                break;
            case 'success':
                // Ascending triad
                playTone(440, 'sine', 0.2, 0.1);
                setTimeout(() => playTone(554, 'sine', 0.2, 0.1), 100);
                setTimeout(() => playTone(659, 'sine', 0.4, 0.1), 200);
                break;
            case 'error':
                // Low buzz
                playTone(150, 'sawtooth', 0.3, 0.1);
                setTimeout(() => playTone(100, 'sawtooth', 0.3, 0.1), 150);
                break;
            case 'scan':
                // Rapid oscillation
                for (let i = 0; i < 5; i++) {
                    setTimeout(() => playTone(2000 + (i * 200), 'sine', 0.05, 0.03), i * 50);
                }
                break;
            default:
                break;
        }
    };

    const toggleMute = () => setIsMuted(prev => !prev);

    return (
        <SoundContext.Provider value={{ play, isMuted, toggleMute }}>
            {children}
        </SoundContext.Provider>
    );
};
