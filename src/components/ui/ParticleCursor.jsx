import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const ParticleCursor = () => {
    const cursorRef = useRef(null);
    const ringRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const cursor = cursorRef.current;
        const ring = ringRef.current;

        let mouseX = -100;
        let mouseY = -100;
        let ringX = -100;
        let ringY = -100;

        const onMouseMove = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Direct hardware cursor update for zero lag
            if (cursor) cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;

            // Check for clickable elements
            const target = e.target;
            const isClickable = window.getComputedStyle(target).cursor === 'pointer' || target.tagName === 'A' || target.tagName === 'BUTTON';
            setIsHovering(isClickable);
        };

        const animateRing = () => {
            // Smooth lerp for the ring
            ringX += (mouseX - ringX) * 0.15;
            ringY += (mouseY - ringY) * 0.15;

            if (ring) {
                ring.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
            }
            requestAnimationFrame(animateRing);
        };

        window.addEventListener('mousemove', onMouseMove);
        const animFrame = requestAnimationFrame(animateRing);

        return () => {
            window.removeEventListener('mousemove', onMouseMove);
            cancelAnimationFrame(animFrame);
        };
    }, []);

    return (
        <>
            {/* Core Reticle (Instant) */}
            <div
                ref={cursorRef}
                className={`fixed top-0 left-0 pointer-events-none z-[9999] mix-blend-screen transition-[width,height,background] duration-200
                    ${isHovering ? 'w-2 h-2 bg-neon-purple' : 'w-1 h-1 bg-white'}
                `}
                style={{ borderRadius: '50%' }}
            />

            {/* Trailing HUD Ring (Lagged) */}
            <div
                ref={ringRef}
                className={`fixed top-0 left-0 pointer-events-none z-[9998] border border-neon-cyan/50 rounded-full transition-[width,height,opacity] duration-300 ease-out flex items-center justify-center
                    ${isHovering ? 'w-12 h-12 opacity-100 border-neon-purple scale-110' : 'w-8 h-8 opacity-40 scale-100'}
                `}
            >
                {/* Decorative Crosshairs */}
                <div className={`absolute w-full h-[1px] bg-neon-cyan/30 transition-all duration-300 ${isHovering ? 'rotate-90 scale-50' : 'scale-100'}`} />
                <div className={`absolute h-full w-[1px] bg-neon-cyan/30 transition-all duration-300 ${isHovering ? 'rotate-90 scale-50' : 'scale-100'}`} />
            </div>
        </>
    );
};

export default ParticleCursor;
