/* eslint-disable */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gamepad2, Timer, Award, Check, X, Play, Loader, Zap } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useSound } from '../contexts/SoundContext';
import { useGemini } from '../contexts/GeminiContext';
import { useGamification } from '../contexts/GamificationContext';

const Arcade = () => {
    const { play } = useSound();
    const { genAI, modelName } = useGemini();
    const { addSkillXp } = useGamification();
    const [gameState, setGameState] = useState('menu'); // menu, loading, playing, playing_breach, finished
    const [questions, setQuestions] = useState([]);
    const [currentQ, setCurrentQ] = useState(0);
    const [score, setScore] = useState(0);
    const [streak, setStreak] = useState(0);
    const [timeLeft, setTimeLeft] = useState(15);
    const [feedback, setFeedback] = useState(null); // 'correct', 'wrong'
    const [error, setError] = useState(null);
    const [topic, setTopic] = useState('Science & Tech');

    useEffect(() => {
        let timer;
        if (gameState === 'playing' && timeLeft > 0 && !feedback) {
            timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
        } else if (timeLeft === 0 && !feedback) {
            handleAnswer(-1); // Time out
        }
        return () => clearInterval(timer);
    }, [gameState, timeLeft, feedback]);

    const generateQuestions = async () => {
        if (!genAI) {
            setError("ARCADE OFFLINE: Key Required");
            play('error');
            return;
        }

        setGameState('loading');
        setError(null);
        play('click');

        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const prompt = `
                Generate 5 difficult, rapid-fire trivia questions about ${topic}.
                Return ONLY valid JSON array with this structure:
                [
                    {
                        "id": 1,
                        "question": "Question text?",
                        "options": ["Op1", "Op2", "Op3", "Op4"],
                        "answer": 0 // index of correct option
                    }
                ]
            `;

            const result = await model.generateContent(prompt);
            const response = await result.response;
            const text = response.text();
            const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const data = JSON.parse(cleaned);

            setQuestions(data);
            setGameState('playing');
            setCurrentQ(0);
            setScore(0);
            setStreak(0);
            setTimeLeft(15);
            play('success');

        } catch (err) {
            console.error("Arcade Gen Failed", err);

            // FALLBACK SIMULATION (For 429 Rate Limits)
            if (err.message.includes('429') || err.message.includes('Quota')) {
                setError(null);

                // Simulated Questions to keep the game alive
                const simQuestions = [
                    {
                        id: 1,
                        question: "[SIMULATION] What is the primary function of a Neural Network?",
                        options: ["Pattern Recognition", "Making Coffee", "Storage", "Rendering"],
                        answer: 0
                    },
                    {
                        id: 2,
                        question: "[SIMULATION] Which element is commonly used in semi-conductors?",
                        options: ["Gold", "Silicon", "Iron", "Oxygen"],
                        answer: 1
                    },
                    {
                        id: 3,
                        question: "[SIMULATION] What does CPU stand for?",
                        options: ["Cool Processing Unit", "Central Processing Unit", "Computer Power Unit", "Core Port"],
                        answer: 1
                    },
                    {
                        id: 4,
                        question: "[SIMULATION] The speed of light is approx?",
                        options: ["300,000 km/s", "100 km/h", "Sound Speed", "Infinite"],
                        answer: 0
                    },
                    {
                        id: 5,
                        question: "[SIMULATION] Which planet is known as the Red Planet?",
                        options: ["Venus", "Mars", "Jupiter", "Saturn"],
                        answer: 1
                    }
                ];

                setTimeout(() => {
                    setQuestions(simQuestions);
                    setGameState('playing');
                    setCurrentQ(0);
                    setScore(0);
                    setStreak(0);
                    setTimeLeft(15);
                    play('success');
                }, 1500);
                return;
            }

            setError("GENERATION FAILED: " + err.message);
            setGameState('menu');
            play('error');
        }
    };

    const handleAnswer = (index) => {
        if (feedback) return;

        const correct = questions[currentQ].answer;

        if (index === correct) {
            setFeedback('correct');
            const streakBonus = streak * 50;
            const timeBonus = timeLeft * 10;
            const totalPoints = 100 + streakBonus + timeBonus;

            setScore(prev => prev + totalPoints);
            setStreak(prev => prev + 1);

            // Report to Nexus Bridge
            addSkillXp(topic, totalPoints);

            play('success');

            if (streak > 2) triggerConfetti(0.3);
        } else {
            setFeedback('wrong');
            setStreak(0);
            play('error');
        }

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setTimeLeft(15);
                setFeedback(null);
            } else {
                finishGame();
            }
        }, 1500);
    };

    const finishGame = () => {
        setGameState('finished');
        triggerConfetti(1.0);
        play('success');
    };

    const triggerConfetti = (intensity) => {
        confetti({
            particleCount: 100 * intensity,
            spread: 70,
            origin: { y: 0.6 }
        });
    };

    return (
        <div className="max-w-4xl mx-auto min-h-[500px] flex items-center justify-center">
            <AnimatePresence mode="wait">
                {gameState === 'menu' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="text-center w-full max-w-lg bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-6 md:p-12 rounded-3xl backdrop-blur-xl shadow-2xl relative overflow-hidden"
                    >
                        {/* Background Deco */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500"></div>

                        <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-pink-500/20 rotate-3 transition-transform hover:rotate-6">
                            <Gamepad2 className="w-12 h-12 text-white" />
                        </div>

                        <h1 className="text-5xl font-headings font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-500 mb-4">ARCADE // AI</h1>
                        <p className="text-gray-500 dark:text-gray-400 mb-8 text-lg">
                            Infinite trivia generated by Gemini Core.
                            <br />
                            <span className="text-xs uppercase tracking-widest opacity-60">Streak Multipliers Active</span>
                        </p>

                        {error && (
                            <div className="mb-6 p-3 bg-red-500/10 text-red-500 rounded-lg text-sm border border-red-500/20">
                                {error}
                            </div>
                        )}

                        <div className="flex flex-col gap-4 max-w-xs mx-auto">
                            <button
                                onClick={() => generateQuestions()}
                                className="w-full px-8 py-4 bg-white dark:bg-white text-black font-bold rounded-2xl text-lg hover:scale-105 transition shadow-xl shadow-white/10 flex items-center justify-center gap-3"
                            >
                                <Play className="w-6 h-6 fill-black" />
                                START RUN
                            </button>

                            <div className="flex gap-2 justify-center mt-4">
                                {['Science', 'History', 'Code', 'Space'].map(t => (
                                    <button
                                        key={t}
                                        onClick={() => setTopic(t)}
                                        className={`px-3 py-1 rounded-full text-xs font-bold border transition ${topic === t ? 'bg-pink-500 text-white border-pink-500' : 'border-gray-600 text-gray-500 hover:border-pink-500'}`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {gameState === 'loading' && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center"
                    >
                        <Loader className="w-12 h-12 text-pink-500 animate-spin mx-auto mb-4" />
                        <h2 className="text-xl font-bold dark:text-white animate-pulse">GENERATING LEVEL...</h2>
                        <p className="text-gray-500 text-sm mt-2">Connecting to Neural Core</p>
                    </motion.div>
                )}

                {gameState === 'playing' && questions.length > 0 && (
                    <motion.div
                        key={currentQ}
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -100, opacity: 0 }}
                        className="w-full max-w-2xl"
                    >
                        {/* HUD */}
                        <div className="flex justify-between items-center mb-8 bg-black/40 p-6 rounded-3xl backdrop-blur border border-white/5">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Score</span>
                                <div className="flex items-center gap-2 text-white font-black text-3xl">
                                    <Award className="w-6 h-6 text-yellow-500" />
                                    {score}
                                </div>
                            </div>

                            <div className="flex flex-col items-center">
                                <div className={`text-4xl font-black font-mono ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
                                    {timeLeft}
                                </div>
                            </div>

                            <div className="flex flex-col items-end">
                                <span className="text-[10px] text-gray-400 uppercase tracking-widest">Streak</span>
                                <div className="flex items-center gap-1">
                                    <Zap className={`w-5 h-5 ${streak > 2 ? 'text-yellow-400 fill-yellow-400 animate-bounce' : 'text-gray-600'}`} />
                                    <span className="text-2xl font-bold text-white">x{streak}</span>
                                </div>
                            </div>
                        </div>

                        {/* Question Card */}
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 rounded-[2rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-pink-500"></div>

                            {feedback && (
                                <div className={`absolute inset-0 z-20 flex items-center justify-center bg-black/80 backdrop-blur-sm transition-opacity`}>
                                    {feedback === 'correct' ? (
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1.2 }}
                                            className="text-green-400 flex flex-col items-center"
                                        >
                                            <Check className="w-24 h-24" />
                                            <span className="text-4xl font-black uppercase tracking-tighter">Correct!</span>
                                            <span className="text-sm font-mono mt-2 text-green-200">+POINTS EARNED</span>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            initial={{ scale: 0.5 }}
                                            animate={{ scale: 1 }}
                                            className="text-red-500 flex flex-col items-center"
                                        >
                                            <X className="w-24 h-24" />
                                            <span className="text-4xl font-black uppercase tracking-tighter">Wrong</span>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            <div className="mb-8">
                                <span className="inline-block px-3 py-1 bg-pink-500/20 text-pink-500 rounded-lg text-xs font-bold mb-4 border border-pink-500/20">
                                    Q.{currentQ + 1} // {topic.toUpperCase()}
                                </span>
                                <h2 className="text-3xl font-bold dark:text-white leading-tight">{questions[currentQ].question}</h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {questions[currentQ].options.map((opt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAnswer(i)}
                                        disabled={feedback !== null}
                                        className="group p-6 text-left rounded-2xl bg-gray-50 dark:bg-white/5 border border-transparent hover:border-pink-500/50 hover:bg-pink-500/10 transition-all font-medium dark:text-gray-200 flex items-center justify-between"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-lg bg-gray-200 dark:bg-white/10 flex items-center justify-center text-sm font-bold group-hover:bg-pink-500 group-hover:text-white transition-colors">
                                                {['A', 'B', 'C', 'D'][i]}
                                            </span>
                                            <span className="text-lg">{opt}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                )}

                {gameState === 'finished' && (
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 p-12 rounded-[2.5rem] shadow-2xl max-w-lg w-full relative overflow-hidden block"
                    >
                        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-pulse"></div>

                        <Award className="w-20 h-20 text-yellow-400 mx-auto mb-6 drop-shadow-glow animate-bounce" />
                        <h2 className="text-4xl font-black dark:text-white mb-2 uppercase italic">Run Complete</h2>
                        <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 mb-2 tracking-tighter">
                            {score}
                        </div>
                        <p className="text-gray-400 mb-8 uppercase tracking-widest text-sm">Total Score</p>

                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="bg-black/20 p-4 rounded-2xl">
                                <p className="text-xs text-gray-400 uppercase">Max Streak</p>
                                <p className="text-2xl font-bold text-white">{streak}</p>
                            </div>
                            <div className="bg-black/20 p-4 rounded-2xl">
                                <p className="text-xs text-gray-400 uppercase">Questions</p>
                                <p className="text-2xl font-bold text-neon-cyan">{questions.length}</p>
                            </div>
                        </div>

                        <div className="flex gap-4 justify-center">
                            <button onClick={generateQuestions} className="flex-1 px-6 py-4 bg-white text-black rounded-xl font-bold hover:scale-105 transition shadow-lg">
                                AGAIN
                            </button>
                            <button onClick={() => setGameState('menu')} className="flex-1 px-6 py-4 bg-gray-800 text-white rounded-xl font-bold hover:bg-gray-700 transition">
                                EXIT
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Arcade;
