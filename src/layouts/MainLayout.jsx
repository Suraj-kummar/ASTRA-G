import React from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LogOut } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Background3D from '../components/ui/Background3D';
import CRTOverlay from '../components/ui/CRTOverlay';
import ParticleCursor from '../components/ui/ParticleCursor';
import AstraLogo from '../components/ui/AstraLogo';
import CommandPalette from '../components/ui/CommandPalette';

const MainLayout = () => {
    const { toggleTheme, isDark } = useTheme();
    const { currentUser, logout } = useAuth();
    const location = useLocation();

    return (
        <div className="relative min-h-screen bg-ceramic dark:bg-obsidian transition-colors duration-500 font-body overflow-hidden selection:bg-neon-cyan selection:text-black">
            {/* Ambient Background */}
            <Background3D />
            <CRTOverlay />
            <ParticleCursor />
            <CommandPalette />

            <Sidebar />

            <main className="lg:ml-24 min-h-screen p-6 lg:p-10 relative z-10 transition-all duration-500">
                {/* Glass Header */}
                <header className="sticky top-4 z-50 flex justify-between items-center mb-10 px-6 py-4 rounded-2xl glass-panel">
                    <div className="flex items-center gap-4">
                        <AstraLogo className="w-12 h-12" />
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-headings font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                ASTRA <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple animate-pulse">OS</span>
                            </h1>
                            <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400 font-mono">
                                OPERATOR: {currentUser?.displayName?.toUpperCase() || 'UNKNOWN'}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">


                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <img
                                    src={currentUser?.photoURL || 'https://api.dicebear.com/7.x/bottts/svg?seed=Astra'}
                                    alt="Avatar"
                                    className="w-10 h-10 rounded-lg border border-white/10 p-0.5 object-cover bg-black/50"
                                />
                                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-black" />
                            </div>

                            <button
                                onClick={logout}
                                className="hidden lg:flex items-center gap-2 text-sm text-gray-400 hover:text-red-400 font-medium transition-colors p-2 rounded-lg hover:bg-red-500/10"
                            >
                                <LogOut className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Outlet with Cinematic Transition */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, x: -10, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, x: 10, filter: 'blur(10px)' }}
                        transition={{
                            duration: 0.3,
                            ease: "anticipate"
                        }}
                        className="relative z-10"
                    >
                        <Outlet />
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default MainLayout;
