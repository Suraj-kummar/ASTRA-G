import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const PrivateRoute = ({ children }) => {
    const { currentUser, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-obsidian text-neon-cyan animate-pulse">Initializing ASTRA Protocol...</div>;
    }

    return currentUser ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
