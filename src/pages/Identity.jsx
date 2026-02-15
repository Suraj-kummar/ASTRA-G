import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Edit2, Save, Shield, Clock, MapPin, Mail, Hash, Camera, X, Activity } from 'lucide-react';
import TiltCard from '../components/ui/TiltCard';
import HolographicChart from '../components/ui/HolographicChart';
import { useGamification } from '../contexts/GamificationContext';

const PRESET_AVATARS = [
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
    'https://api.dicebear.com/7.x/bottts/svg?seed=Astra',
    'https://api.dicebear.com/7.x/notionists/svg?seed=Luna',
    'https://api.dicebear.com/7.x/adventurer/svg?seed=Max',
    'https://api.dicebear.com/7.x/fun-emoji/svg?seed=Cool'
];

const Identity = () => {
    const { currentUser, isMockUser, updateUserProfile } = useAuth();
    const { skills } = useGamification();
    const [isEditing, setIsEditing] = useState(false);
    const [showAvatarModal, setShowAvatarModal] = useState(false);

    // Initial state from Context
    const [profile, setProfile] = useState({
        displayName: currentUser?.displayName || 'Cadet',
        photoURL: currentUser?.photoURL || PRESET_AVATARS[0],
        bio: 'Aspiring STEM specialist exploring the frontiers of science and technology.',
        location: 'Sector 7 (Earth-Prime)',
        role: 'Explorer Class'
    });

    const handleSave = async () => {
        setIsEditing(false);
        try {
            await updateUserProfile({
                displayName: profile.displayName,
                role: profile.role,
                bio: profile.bio,
                location: profile.location
            });
            // In a real app, you might sync role/bio/location to Firestore here as well
        } catch (error) {
            console.error("Failed to update profile", error);
        }
    };

    const handleAvatarSelect = async (url) => {
        setProfile(prev => ({ ...prev, photoURL: url }));
        setShowAvatarModal(false);
        try {
            await updateUserProfile({ photoURL: url });
        } catch (error) {
            console.error("Avatar update failed", error);
        }
    };

    return (
        <div className="max-w-6xl mx-auto relative">
            {/* Avatar Modal */}
            <AnimatePresence>
                {showAvatarModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-gray-900 border border-white/10 p-6 rounded-3xl max-w-md w-full"
                        >
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold text-white">Select Identity Module</h3>
                                <button onClick={() => setShowAvatarModal(false)} className="text-gray-400 hover:text-white"><X className="w-5 h-5" /></button>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                {PRESET_AVATARS.map((url, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleAvatarSelect(url)}
                                        className="relative p-2 rounded-xl border border-white/5 hover:bg-white/5 hover:border-neon-cyan/50 transition-all group"
                                    >
                                        <img src={url} alt="Avatar" className="w-full h-auto rounded-lg" />
                                        {profile.photoURL === url && (
                                            <div className="absolute inset-0 border-2 border-neon-cyan rounded-xl pointer-events-none" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="mb-8 flex items-center gap-4">
                <div className="p-3 bg-blue-500/20 rounded-2xl text-blue-500">
                    <User className="w-8 h-8" />
                </div>
                <div>
                    <h1 className="text-3xl font-headings font-bold dark:text-white">Identity Matrix</h1>
                    <p className="text-gray-500 dark:text-gray-400">Personnel File & Configuration</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Profile Card */}
                <TiltCard className="lg:col-span-1">
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 flex flex-col items-center text-center h-full relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20"></div>

                        <div className="relative z-10 mb-4 group/avatar">
                            <div className="w-32 h-32 rounded-full border-4 border-white dark:border-obsidian p-1 bg-white dark:bg-black/50 overflow-hidden shadow-xl">
                                <img src={profile.photoURL} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                            </div>
                            <button
                                onClick={() => setShowAvatarModal(true)}
                                className="absolute bottom-0 right-0 p-2 bg-neon-cyan text-black rounded-full hover:scale-110 transition shadow-lg"
                                title="Change Avatar"
                            >
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>

                        <h2 className="text-2xl font-bold dark:text-white mb-1">{profile.displayName}</h2>
                        <span className="px-3 py-1 bg-neon-purple/20 text-neon-purple rounded-full text-xs font-bold mb-6">
                            {isMockUser ? 'SIMULATED ENTITY' : 'VERIFIED USER'}
                        </span>

                        <div className="w-full space-y-4 text-left">
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <Mail className="w-5 h-5 text-gray-400" />
                                <div className="overflow-hidden">
                                    <p className="text-xs text-gray-500">Email</p>
                                    <p className="text-sm dark:text-white truncate">{currentUser?.email}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <Hash className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">UID</p>
                                    <p className="text-sm dark:text-white font-mono">{currentUser?.uid?.slice(0, 10)}...</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-black/20 rounded-xl">
                                <Shield className="w-5 h-5 text-gray-400" />
                                <div>
                                    <p className="text-xs text-gray-500">Clearance</p>
                                    <p className="text-sm dark:text-white font-mono">LEVEL_1_ALPHA</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </TiltCard>

                {/* Details & Settings */}
                <div className="lg:col-span-2 space-y-6">
                    <TiltCard>
                        <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-8 relative">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-bold dark:text-white">Profile Details</h3>
                                {!isEditing ? (
                                    <button onClick={() => setIsEditing(true)} className="p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-lg transition">
                                        <Edit2 className="w-5 h-5 text-gray-500" />
                                    </button>
                                ) : (
                                    <button onClick={handleSave} className="flex items-center gap-2 px-4 py-2 bg-neon-cyan text-black font-bold rounded-lg hover:bg-neon-cyan/80 transition">
                                        <Save className="w-4 h-4" />
                                        Save
                                    </button>
                                )}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Display Name</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profile.displayName}
                                                onChange={e => setProfile({ ...profile, displayName: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-neon-cyan outline-none dark:text-white"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl dark:text-white font-medium">
                                                {profile.displayName}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-2">Role / Class</label>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={profile.role}
                                                onChange={e => setProfile({ ...profile, role: e.target.value })}
                                                className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-neon-cyan outline-none dark:text-white"
                                            />
                                        ) : (
                                            <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl dark:text-white font-medium">
                                                {profile.role}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-500 mb-2">Bio / Mission Statement</label>
                                    {isEditing ? (
                                        <textarea
                                            rows="3"
                                            value={profile.bio}
                                            onChange={e => setProfile({ ...profile, bio: e.target.value })}
                                            className="w-full p-3 bg-gray-50 dark:bg-black/20 border border-gray-200 dark:border-white/10 rounded-xl focus:ring-1 focus:ring-neon-cyan outline-none dark:text-white"
                                        />
                                    ) : (
                                        <div className="p-3 bg-gray-50 dark:bg-black/20 rounded-xl dark:text-white text-sm leading-relaxed">
                                            {profile.bio}
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-2 text-xs text-gray-400 pt-4 border-t border-gray-200 dark:border-white/10">
                                    <MapPin className="w-3 h-3" />
                                    {profile.location}
                                </div>
                            </div>
                        </div>
                    </TiltCard>

                    {/* Skills Visualization */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-20 bg-neon-purple/5 blur-3xl rounded-full pointer-events-none"></div>
                        <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-neon-purple" />
                            Neural Skill Matrix
                        </h3>

                        <div className="h-64 flex items-center justify-center">
                            {Object.keys(skills).length > 0 ? (
                                <HolographicChart
                                    data={Object.entries(skills).map(([k, v]) => ({ subject: k, A: Math.min(v, 100) }))}
                                />
                            ) : (
                                <div className="text-center text-gray-500 text-sm">
                                    <p>NO NEURAL DATA FOUND</p>
                                    <p className="text-xs mt-1 opacity-50">Complete Arcade levels to build matrix.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* History Log */}
                    <div className="bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-3xl p-6">
                        <h3 className="font-bold dark:text-white mb-4 flex items-center gap-2">
                            <Clock className="w-5 h-5 text-gray-400" />
                            Recent Activity Log
                        </h3>
                        <div className="space-y-4">
                            {[
                                { action: 'Simulation Completed', detail: 'Nexus AI: Quantum Physicist', time: '2 hours ago', xp: '+120' },
                                { action: 'Quiz Mastered', detail: 'STEM Arcade: Physics 101', time: '5 hours ago', xp: '+80' },
                                { action: 'System Login', detail: 'Biometric verified', time: '1 day ago', xp: '' },
                            ].map((log, i) => (
                                <div key={i} className="flex items-center justify-between p-3 hover:bg-black/5 dark:hover:bg-white/5 rounded-xl transition cursor-default">
                                    <div>
                                        <p className="text-sm font-bold dark:text-white">{log.action}</p>
                                        <p className="text-xs text-gray-400">{log.detail}</p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-neon-cyan font-bold text-sm block">{log.xp}</span>
                                        <span className="text-xs text-gray-500">{log.time}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Identity;
