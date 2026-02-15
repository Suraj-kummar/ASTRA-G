import React, { createContext, useContext, useState, useEffect } from 'react';

const GamificationContext = createContext();

export const useGamification = () => useContext(GamificationContext);

export const GamificationProvider = ({ children }) => {
    const [xp, setXp] = useState(() => parseInt(localStorage.getItem('astra_xp') || '0'));
    const [skills, setSkills] = useState(() => JSON.parse(localStorage.getItem('astra_skills') || '{}'));
    const [notifications, setNotifications] = useState([]);

    // Level calculation: Level 1 = 0-99XP, Level 2 = 100-199XP, etc.
    const level = Math.floor(xp / 100) + 1;
    const nextLevelXp = level * 100;
    const progress = ((xp % 100) / 100) * 100;

    useEffect(() => {
        localStorage.setItem('astra_xp', xp.toString());
    }, [xp]);

    useEffect(() => {
        localStorage.setItem('astra_skills', JSON.stringify(skills));
    }, [skills]);

    const addXp = (amount, reason) => {
        setXp(prev => {
            const newXp = prev + amount;
            const newLevel = Math.floor(newXp / 100) + 1;
            const currentLevel = Math.floor(prev / 100) + 1;

            if (newLevel > currentLevel) {
                notify(`LEVEL UP! REACHED LEVEL ${newLevel}`, 'levelup');
            } else {
                notify(`+${amount} XP: ${reason}`, 'xp');
            }
            return newXp;
        });
    };

    const addSkillXp = (topic, amount) => {
        setSkills(prev => {
            const current = prev[topic] || 0;
            return { ...prev, [topic]: current + amount };
        });
        // Also add to global XP
        addXp(amount, `${topic} Proficiency`);
    };

    const notify = (msg, type) => {
        const id = Date.now();
        setNotifications(prev => [...prev, { id, msg, type }]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id));
        }, 3000);
    };

    return (
        <GamificationContext.Provider value={{ xp, level, nextLevelXp, progress, addXp, skills, addSkillXp, notifications }}>
            {children}
        </GamificationContext.Provider>
    );
};
