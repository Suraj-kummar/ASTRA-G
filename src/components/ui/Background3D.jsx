import React, { memo } from 'react';
import StarfieldScene from '../3d/StarfieldScene';

const Background3D = memo(() => {
    return (
        <div className="fixed inset-0 z-0 pointer-events-none">
            {/* 3D Particle System */}
            <div className="absolute inset-0 z-0 opacity-60 dark:opacity-100">
                <StarfieldScene />
            </div>

            {/* Gradient Overlays for Readability */}
            <div className="absolute inset-0 z-10 bg-gradient-to-b from-ceramic/90 via-transparent to-ceramic/90 dark:from-obsidian/90 dark:via-transparent dark:to-obsidian/90 pointer-events-none" />
            <div className="absolute inset-0 z-10 bg-radial-gradient from-transparent via-transparent to-ceramic dark:to-obsidian opacity-80 pointer-events-none" />
        </div>
    );
});

export default Background3D;
