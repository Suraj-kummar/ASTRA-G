import React, { useState, useEffect } from 'react';

const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?';

const GlitchText = ({ text, className = "" }) => {
    const [display, setDisplay] = useState('');

    useEffect(() => {
        let iterations = 0;
        const interval = setInterval(() => {
            setDisplay(
                text
                    .split('')
                    .map((char, index) => {
                        if (index < iterations) {
                            return text[index];
                        }
                        return characters[Math.floor(Math.random() * characters.length)];
                    })
                    .join('')
            );

            if (iterations >= text.length) {
                clearInterval(interval);
            }

            iterations += 1 / 3; // Speed of decoding
        }, 30);

        return () => clearInterval(interval);
    }, [text]);

    return (
        <span className={`font-mono ${className}`}>
            {display}
        </span>
    );
};

export default GlitchText;
