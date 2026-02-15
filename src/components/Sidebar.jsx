
import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Gamepad2, ScanLine, UserCircle, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import AstraLogo from './ui/AstraLogo';
import { useSound } from '../contexts/SoundContext';

const Sidebar = () => {
    const [isCollapsed, setIsCollapsed] = useState(true);
    const { play } = useSound();

    const navItems = [
        { to: '/', icon: LayoutDashboard, label: 'Command Center' },
        { to: '/nexus', icon: BrainCircuit, label: 'Nexus AI' },
        { to: '/arcade', icon: Gamepad2, label: 'STEM Arcade' },
        { to: '/scan', icon: ScanLine, label: 'Neuro-Scan' },
        { to: '/identity', icon: UserCircle, label: 'Identity Matrix' },
    ];

    return (
        <>
            {/* Mobile Toggle */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="lg:hidden fixed top-6 left-6 z-50 p-2 bg-black/50 border border-white/10 rounded-lg text-white backdrop-blur-md"
            >
                <Menu className="w-6 h-6" />
            </button>

            <aside
                className={`fixed left-0 top-0 h-screen bg-black/80 backdrop-blur-xl border-r border-white/5 transition-all duration-500 z-40 ease-out
                ${isCollapsed ? 'w-0 lg:w-24 -translate-x-full lg:translate-x-0' : 'w-72 translate-x-0'}
                flex flex-col shadow-[10px_0_30px_rgba(0,0,0,0.5)]`}
                onMouseEnter={() => setIsCollapsed(false)}
                onMouseLeave={() => setIsCollapsed(true)}
            >
                {/* Header */}
                <div className={`h-24 flex items-center ${isCollapsed ? 'justify-center' : 'justify-between px-6'} transition-all duration-300 relative border-b border-white/5`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-10 h-10 flex-shrink-0">
                            <AstraLogo className="w-full h-full" />
                        </div>
                        <span className={`font-headings font-bold text-xl text-white tracking-widest transition-opacity duration-300 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>
                            ASTRA
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-8 px-3 space-y-2 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            onClick={() => {
                                play('click');
                                if (window.innerWidth < 1024) setIsCollapsed(true);
                            }}
                            onMouseEnter={() => play('hover')}
                            className={({ isActive }) =>
                                `group relative flex items-center p-3 rounded-xl transition-all duration-300 overflow-hidden
                                ${isActive
                                    ? 'bg-gradient-to-r from-neon-cyan/20 to-transparent text-white border-l-2 border-neon-cyan'
                                    : 'text-gray-500 hover:text-white hover:bg-white/5 border-l-2 border-transparent'
                                }`
                            }
                        >
                            <div className={`relative z-10 w-10 h-10 flex items-center justify-center transition-colors px-1 ${isCollapsed ? 'mx-auto' : ''}`}>
                                <item.icon className="w-6 h-6" />
                            </div>

                            <span className={`ml-3 font-medium text-sm tracking-wide whitespace-nowrap transition-all duration-500 ${isCollapsed ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
                                {item.label}
                            </span>

                            {/* Hover Effect */}
                            <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </NavLink>
                    ))}
                </nav>

                {/* Footer Toggle */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="p-4 border-t border-white/5 text-gray-500 hover:text-white flex items-center justify-center transition-colors"
                >
                    {isCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                </button>
            </aside>
        </>
    );
};

export default Sidebar;
