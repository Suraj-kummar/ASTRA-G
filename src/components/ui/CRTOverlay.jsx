import React from 'react';

const CRTOverlay = () => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Scanlines */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] z-10 bg-[length:100%_2px,3px_100%] pointer-events-none" />

            {/* Flicker & Noise */}
            <div className="absolute inset-0 bg-white opacity-[0.02] animate-flicker pointer-events-none" />

            {/* Vignette */}
            <div className="absolute inset-0 bg-[radial-gradient(circle,rgba(0,0,0,0)_60%,rgba(0,0,0,0.4)_100%)] z-20 pointer-events-none" />

            {/* Border Curve (Optional, keeps it cleaner without actual curve for now) */}
        </div>
    );
};

export default CRTOverlay;
