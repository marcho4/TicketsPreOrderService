"use client"

import { createContext, useContext, useState, useEffect } from 'react';


const AuthContext = createContext({
    user: undefined,
    isLoading: true,
    userRole: undefined,
    setUserRole: () => {},
    setUser: () => {},
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    // Проверяем юзера на каждой загрузке страницы
    useEffect(() => {
        checkAuth();
    }, [])

    // Функция для установки юзера и его роли по данным API
    const checkAuth = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/auth/session',
                {
                    method: 'GET',
                    credentials: 'include',
                });
            const json = await response.json();
            if (json.data) {
                setUserRole(json.data.role);
                setUser(json.data.user_id);
            }
        } catch (error) {
            console.error('Auth check failed:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const value = {
        isLoading,
        userRole,
        setUserRole,
        user,
        setUser,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};