import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isMockUser, setIsMockUser] = useState(false);

    // Mock User Data
    const mockUser = {
        uid: 'mock-user-123',
        displayName: 'Cadet Astro',
        email: 'cadet@astra.sim',
        photoURL: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix',
        stats: {
            xp: 1250,
            rank: 'Explorer',
        }
    };

    useEffect(() => {
        // Check local storage for mock mode
        const storedMock = localStorage.getItem('astra_mock_mode');
        if (storedMock === 'true') {
            setCurrentUser(mockUser);
            setIsMockUser(true);
            setLoading(false);
            return;
        }

        // If Auth is not initialized (missing config), stop loading
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setIsMockUser(false);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const loginWithGoogle = async () => {
        if (!auth) {
            console.warn("Firebase config missing. Defaulting to Simulation Mode.");
            // Optional: Auto-fallback to simulation or throw specific error
            throw new Error("Firebase configuration not found.");
        }
        try {
            const result = await signInWithPopup(auth, googleProvider);
            return result;
        } catch (error) {
            console.error("Google Auth Error:", error.code, error.message);
            throw error; // Propagate to component for UI feedback
        }
    };

    const signup = async (email, password, displayName) => {
        if (!auth) {
            // Mock Signup fallback
            const newMockUser = { ...mockUser, email, displayName: displayName || 'Cadet Recruit' };
            localStorage.setItem('astra_mock_mode', 'true');
            localStorage.setItem('astra_mock_user', JSON.stringify(newMockUser));
            setCurrentUser(newMockUser);
            setIsMockUser(true);
            return;
        }

        try {
            const { createUserWithEmailAndPassword, updateProfile } = await import('firebase/auth');
            const result = await createUserWithEmailAndPassword(auth, email, password);
            await updateProfile(result.user, { displayName: displayName || 'Cadet' });
            // Reload user to get updated profile
            await result.user.reload();
            setCurrentUser(auth.currentUser);
            return result;
        } catch (error) {
            console.error("Signup Error:", error.code, error.message);
            throw error;
        }
    };

    const updateUserProfile = async (updates) => {
        if (isMockUser) {
            const updatedUser = { ...currentUser, ...updates };
            localStorage.setItem('astra_mock_user', JSON.stringify(updatedUser));
            setCurrentUser(updatedUser);
            return;
        }

        if (auth && auth.currentUser) {
            const { updateProfile } = await import('firebase/auth');
            await updateProfile(auth.currentUser, updates);
            // Force refresh logic if needed, or manually merge
            setCurrentUser({ ...auth.currentUser, ...updates });
        }
    };

    const login = async (email, password) => {
        if (!auth) {
            // Mock Login
            localStorage.setItem('astra_mock_mode', 'true');
            setCurrentUser(mockUser);
            setIsMockUser(true);
            return;
        }

        try {
            const { signInWithEmailAndPassword } = await import('firebase/auth');
            return await signInWithEmailAndPassword(auth, email, password);
        } catch (error) {
            console.error("Login Error:", error.code, error.message);
            throw error;
        }
    };

    const logout = async () => {
        try {
            if (isMockUser) {
                localStorage.removeItem('astra_mock_mode');
                localStorage.removeItem('astra_mock_user');
                setIsMockUser(false);
                setCurrentUser(null);
            } else if (auth) {
                await signOut(auth);
            }
        } catch (error) {
            console.error("Logout Error:", error);
        }
    };

    const enterSimulationMode = () => {
        localStorage.setItem('astra_mock_mode', 'true');
        setCurrentUser(mockUser);
        setIsMockUser(true);
    };

    const value = {
        currentUser,
        isMockUser,
        loginWithGoogle,
        signup,
        login,
        logout,
        enterSimulationMode,
        updateUserProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
