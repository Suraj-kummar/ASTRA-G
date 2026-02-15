import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Monitor, Terminal, Gamepad2, Brain, ScanLine, UserCircle, LogOut, Sun, Moon, Command } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useSound } from '../../contexts/SoundContext';

const CommandPalette = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);

    const navigate = useNavigate();
    const { logout } = useAuth();
    const { toggleTheme } = useTheme();
    const { play } = useSound();

    const actions = [
        { id: 'dashboard', label: 'Command Center', icon: Monitor, action: () => navigate('/') },
        { id: 'nexus', label: 'Nexus AI', icon: Brain, action: () => navigate('/nexus') },
        { id: 'arcade', label: 'STEM Arcade', icon: Gamepad2, action: () => navigate('/arcade') },
        { id: 'scan', label: 'Neuro-Scan', icon: ScanLine, action: () => navigate('/scan') },
        { id: 'identity', label: 'Identity Matrix', icon: UserCircle, action: () => navigate('/identity') },
        { id: 'theme', label: 'Toggle Visual Mode', icon: Sun, action: () => toggleTheme() },
        { id: 'logout', label: 'Disengage Link', icon: LogOut, action: () => logout() }
    ];

    const filteredActions = actions.filter(a =>
        a.label.toLowerCase().includes(query.toLowerCase())
    );

    // Keyboard Shortcuts
    useEffect(() => {
        const onKeydown = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(prev => !prev);
                play('hover'); // Sound feedback
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };
        window.addEventListener('keydown', onKeydown);
        return () => window.removeEventListener('keydown', onKeydown);
    }, []);

    // Navigation
    useEffect(() => {
        const onKeyNav = (e) => {
            if (!isOpen) return;

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedIndex(prev => (prev + 1) % filteredActions.length);
                play('hover');
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedIndex(prev => (prev - 1 + filteredActions.length) % filteredActions.length);
                play('hover');
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const action = filteredActions[selectedIndex];
                if (action) {
                    play('click');
                    action.action();
                    setIsOpen(false);
                }
            }
        };
        window.addEventListener('keydown', onKeyNav);
        return () => window.removeEventListener('keydown', onKeyNav);
    }, [isOpen, filteredActions, selectedIndex]);


    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] px-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={() => setIsOpen(false)}
                    />

                    <motion.div
                        initial={{ scale: 0.95, opacity: 0, y: -20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: -20 }}
                        transition={{ type: "spring", bounce: 0.3 }}
                        className="relative w-full max-w-2xl bg-black/90 border border-neon-cyan/50 shadow-[#00f3ff40] shadow-2xl rounded-2xl overflow-hidden backdrop-blur-xl"
                    >
                        {/* Search Bar */}
                        <div className="flex items-center gap-4 px-6 py-4 border-b border-white/10">
                            <Search className="w-5 h-5 text-neon-cyan" />
                            <input
                                type="text"
                                placeholder="Type a command..."
                                className="flex-1 bg-transparent text-lg text-white placeholder:text-gray-500 outline-none font-mono"
                                autoFocus
                                value={query}
                                onChange={e => {
                                    setQuery(e.target.value);
                                    setSelectedIndex(0);
                                }}
                            />
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] bg-white/10 px-2 py-1 rounded text-gray-400 font-mono">ESC</span>
                            </div>
                        </div>

                        {/* List */}
                        <div className="max-h-[300px] overflow-y-auto p-2">
                            {filteredActions.length > 0 ? (
                                filteredActions.map((action, i) => (
                                    <button
                                        key={action.id}
                                        onClick={() => {
                                            play('click');
                                            action.action();
                                            setIsOpen(false);
                                        }}
                                        onMouseEnter={() => setSelectedIndex(i)}
                                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-left group
                                            ${i === selectedIndex ? 'bg-neon-cyan/20 text-white' : 'text-gray-400 hover:text-white'}
                                        `}
                                    >
                                        <action.icon className={`w-5 h-5 ${i === selectedIndex ? 'text-neon-cyan' : 'text-gray-500 group-hover:text-white'}`} />
                                        <span className="flex-1 font-medium">{action.label}</span>
                                        {i === selectedIndex && (
                                            <span className="text-neon-cyan">
                                                <Terminal className="w-4 h-4" />
                                            </span>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-8 text-center text-gray-500">
                                    No commands found
                                </div>
                            )}
                        </div>

                        <div className="bg-white/5 px-4 py-2 text-[10px] text-gray-500 flex justify-between">
                            <span>ASTRA_CMD_v1.0</span>
                            <div className="flex gap-4">
                                <span>Navigate <span className="text-white">↑↓</span></span>
                                <span>Select <span className="text-white">↵</span></span>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default CommandPalette;
