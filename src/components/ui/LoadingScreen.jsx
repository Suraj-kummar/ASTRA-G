import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingScreen = () => {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-obsidian text-white">
            <div className="relative">
                {/* Outer Ring */}
                <div className="absolute inset-0 rounded-full border-4 border-white/10 w-24 h-24" />

                {/* Spinning Gradients */}
                <div className="w-24 h-24 rounded-full border-4 border-t-neon-cyan border-r-transparent border-b-neon-purple border-l-transparent animate-spin" />

                {/* Inner Icon */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full animate-pulse shadow-[0_0_10px_white]" />
                </div>
            </div>

            <div className="mt-8 text-center space-y-2">
                <h2 className="text-xl font-bold tracking-[0.2em] animate-pulse text-transparent bg-clip-text bg-gradient-to-r from-neon-cyan to-neon-purple">
                    INITIALIZING
                </h2>
                <div className="flex justify-center gap-1">
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-0" />
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-100" />
                    <span className="w-1 h-1 bg-gray-500 rounded-full animate-bounce delay-200" />
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
