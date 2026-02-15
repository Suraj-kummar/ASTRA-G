import React from 'react';

const AstraLogo = ({ className = "w-12 h-12" }) => {
    return (
        <div className={`relative flex items-center justify-center ${className}`}>
            <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Core Reactor */}
                <circle cx="50" cy="50" r="15" className="fill-neon-cyan/20 stroke-neon-cyan stroke-2 animate-pulse" />
                <circle cx="50" cy="50" r="8" className="fill-white animate-ping opacity-20" />

                {/* Orbital Rings - Rotating */}
                <g className="origin-center animate-[spin_10s_linear_infinite]">
                    <ellipse cx="50" cy="50" rx="35" ry="35" className="stroke-neon-purple/60 stroke-[1.5] [stroke-dasharray:10,10]" />
                    <circle cx="50" cy="15" r="3" className="fill-neon-purple shadow-[0_0_10px_#bc13fe]" />
                </g>

                <g className="origin-center animate-[spin_15s_linear_infinite_reverse]">
                    <ellipse cx="50" cy="50" rx="25" ry="25" className="stroke-neon-cyan/60 stroke-[1.5] [stroke-dasharray:5,5]" />
                    <circle cx="50" cy="75" r="2.5" className="fill-neon-cyan shadow-[0_0_10px_#00f3ff]" />
                </g>

                {/* Outer Triangle Frame */}
                <path d="M50 5 L95 90 L5 90 Z" className="stroke-white/10 stroke-[1]" />

                {/* Decorative Tech Marks */}
                <path d="M50 0 V10 M95 95 L88 88 M5 95 L12 88" className="stroke-gray-500 stroke-[2]" />
            </svg>
        </div>
    );
};

export default AstraLogo;
