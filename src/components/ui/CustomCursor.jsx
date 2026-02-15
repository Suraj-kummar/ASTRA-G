/* eslint-disable */
import { useEffect, useRef, useState } from 'react';

// V2 Rewrite for absolute stability
const CustomCursor = () => {
    const cursorRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);
    const [isClicking, setIsClicking] = useState(false);

    useEffect(() => {
        const move = (e) => {
            if (cursorRef.current) {
                cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
            }
            const t = e.target;
            // Enhanced hover detection for all interactive elements
            const hover =
                window.getComputedStyle(t).cursor === 'pointer' ||
                t.tagName === 'BUTTON' ||
                t.tagName === 'A' ||
                t.tagName === 'INPUT' ||
                t.closest('a') ||
                t.closest('button');

            setIsHovering(hover);
        };
        const down = () => setIsClicking(true);
        const up = () => setIsClicking(false);

        window.addEventListener('mousemove', move);
        window.addEventListener('mousedown', down);
        window.addEventListener('mouseup', up);
        return () => {
            window.removeEventListener('mousemove', move);
            window.removeEventListener('mousedown', down);
            window.removeEventListener('mouseup', up);
        };
    }, []);

    return (
        <div ref={cursorRef} className="fixed top-0 left-0 z-[9999] pointer-events-none will-change-transform hidden md:block" style={{ marginTop: -12, marginLeft: -12 }}>
            <div className={`relative flex items-center justify-center w-6 h-6 transition-all duration-300 ${isHovering ? 'scale-[1.5]' : 'scale-100'} ${isClicking ? 'scale-[0.8]' : ''}`}>
                <div className={`absolute w-full h-full border border-neon-cyan rounded-full animate-spin-slow transition-colors duration-200 ${isClicking ? 'border-neon-purple' : ''} ${isHovering ? 'bg-neon-cyan/10' : ''}`}></div>
                <div className="w-1 h-1 bg-white rounded-full"></div>
                {isHovering && <div className="absolute w-10 h-10 border border-dotted border-white/20 rounded-full animate-pulse"></div>}
            </div>
        </div>
    );
};

export default CustomCursor;
