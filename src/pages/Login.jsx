import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, ShieldCheck, Mail, Lock, Activity, User, Hexagon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Background3D from '../components/ui/Background3D';
import GlitchText from '../components/ui/GlitchText';
import AstraLogo from '../components/ui/AstraLogo';
import { useSound } from '../contexts/SoundContext';

const Login = () => {
    const { enterSimulationMode, login, signup } = useAuth();
    const navigate = useNavigate();
    const { play } = useSound();
    const [mode, setMode] = useState('login'); // login | signup
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Ambient Rotation State
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setRotation(prev => (prev + 0.1) % 360);
        }, 50);
        return () => clearInterval(interval);
    }, []);

    const handleEmailAuth = async (e) => {
        e.preventDefault();

        // Strict Manual Validation
        if (!email.trim() || !password.trim()) {
            setError("Credentials Missing");
            play('error');
            return;
        }
        if (mode === 'signup' && !name.trim()) {
            setError("Operative Name Required");
            play('error');
            return;
        }

        setLoading(true);
        setError('');
        play('click');
        try {
            if (mode === 'signup') {
                await signup(email, password, name);
            } else {
                await login(email, password);
            }
            play('success');
            navigate('/');
        } catch (err) {
            setError("Identity Verification Failed");
            play('error');
            setLoading(false);
        }
    };

    const handleSimulation = () => {
        play('click');
        enterSimulationMode();
        navigate('/');
    };

    return (
        <div className="relative min-h-screen flex items-center justify-center font-body overflow-hidden bg-black selection:bg-neon-cyan selection:text-black">
            <Background3D variant="particles" />

            {/* Ambient Background Glows */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-neon-purple/5 blur-[100px] rounded-full pointer-events-none animate-pulse-slow"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neon-cyan/5 blur-[80px] rounded-full pointer-events-none"></div>

            {/* Orbiting Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
                <div
                    className="w-[700px] h-[700px] border border-white/5 rounded-full"
                    style={{ transform: `rotate(${rotation}deg)` }}
                >
                    <div className="absolute top-0 left-1/2 w-2 h-2 bg-neon-cyan/50 rounded-full shadow-[0_0_10px_#00f3ff]"></div>
                </div>
                <div
                    className="w-[500px] h-[500px] border border-white/5 rounded-full border-dashed"
                    style={{ transform: `rotate(-${rotation * 1.5}deg)` }}
                ></div>
            </div>

            {/* THE MONOLITH */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10 w-full max-w-[420px] mx-4"
            >
                {/* Holographic Panel */}
                <div className="backdrop-blur-xl bg-black/40 border border-white/10 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-hidden relative group">

                    {/* Top Accent */}
                    <div className="h-1 w-full bg-gradient-to-r from-transparent via-neon-cyan to-transparent opacity-50"></div>

                    <div className="p-8 md:p-10 relative z-10">

                        {/* Header */}
                        <div className="text-center mb-10">
                            <motion.div
                                animate={{ y: [0, -5, 0] }}
                                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                                className="inline-block relative mb-4"
                            >
                                <div className="absolute inset-0 bg-neon-cyan/20 blur-xl rounded-full"></div>
                                <AstraLogo className="w-16 h-16 relative z-10" />
                            </motion.div>
                            <h1 className="text-4xl font-headings font-bold text-white mb-2 tracking-tight">
                                <GlitchText text="ASTRA" />
                            </h1>
                            <div className="flex items-center justify-center gap-2 text-[10px] font-mono text-neon-cyan/60 tracking-[0.3em] uppercase">
                                <Hexagon className="w-3 h-3" />
                                Secure Uplink V.3.0
                            </div>
                        </div>

                        {/* Error Display */}
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="mb-6 p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-start gap-3 text-red-400 font-mono text-xs"
                                >
                                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                    <span>{error}</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Auth Form */}
                        <form onSubmit={handleEmailAuth} className="space-y-5">
                            <AnimatePresence mode="wait">
                                {mode === 'signup' && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <div className="group relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                                <User className="w-5 h-5 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                                            </div>
                                            <input
                                                type="text"
                                                placeholder="OPERATIVE DESIGNATION"
                                                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-mono outline-none focus:border-neon-cyan focus:bg-white/10 transition-all placeholder:text-gray-600 focus:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                                                value={name}
                                                onChange={e => setName(e.target.value)}
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <div className="group relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-gray-500 group-focus-within:text-neon-cyan transition-colors" />
                                </div>
                                <input
                                    type="email"
                                    placeholder="IDENTITY ID"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-mono outline-none focus:border-neon-cyan focus:bg-white/10 transition-all placeholder:text-gray-600 focus:shadow-[0_0_15px_rgba(0,243,255,0.1)]"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="group relative">
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center">
                                    <Lock className="w-5 h-5 text-gray-500 group-focus-within:text-neon-purple transition-colors" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="SECURITY KEY"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white text-sm font-mono outline-none focus:border-neon-purple focus:bg-white/10 transition-all placeholder:text-gray-600 focus:shadow-[0_0_15px_rgba(188,19,254,0.1)]"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 mt-2 bg-white text-black font-bold rounded-xl hover:bg-neon-cyan transition-colors flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(0,243,255,0.4)] relative overflow-hidden group/btn"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    {loading ? <Activity className="animate-spin w-5 h-5" /> : (mode === 'login' ? 'INITIALIZE LINK' : 'REGISTER IDENTITY')}
                                    {!loading && <ArrowRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />}
                                </span>
                            </button>
                        </form>

                        {/* Footer Actions */}
                        <div className="mt-8 flex flex-col items-center gap-4 text-xs font-mono">
                            <button
                                onClick={() => {
                                    play('click');
                                    setMode(mode === 'login' ? 'signup' : 'login');
                                }}
                                className="text-gray-500 hover:text-white transition-colors uppercase tracking-wider"
                            >
                                {mode === 'login' ? '[ REQUEST NEW IDENTITY ]' : '[ RETURN TO LOGIN ]'}
                            </button>

                            <button
                                onClick={handleSimulation}
                                className="flex items-center gap-2 text-neon-purple/50 hover:text-neon-purple transition-colors hover:shadow-neon-purple/20 opacity-60 hover:opacity-100"
                            >
                                <Zap className="w-3 h-3" />
                                <span>DEMO MODE (NO SAVE)</span>
                            </button>
                        </div>
                    </div>

                    {/* Scanlight Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full group-hover:translate-y-full transition-transform duration-1000 ease-in-out pointer-events-none"></div>
                </div>
            </motion.div>
        </div>
    );
};

export default Login;
