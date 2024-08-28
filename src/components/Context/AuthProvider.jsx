import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as loginUserService, getUserById } from '../../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email, password) => {
        try {
            const { token } = await loginUserService(email, password);
            localStorage.setItem('authToken', token);

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;

            const userData = await getUserById(userId);
            console.log("User data from API:", userData);

            // Verifica si userData tiene datos y establece el estado
            if (Array.isArray(userData) && userData.length > 0) {
                setUser(userData[0]);
            } else {
                console.error('No user data found');
                setUser(null);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;

                getUserById(userId).then(userData => {
                    console.log("User data from API on load:", userData);

                    // Verifica si userData tiene datos y establece el estado
                    if (Array.isArray(userData) && userData.length > 0) {
                        setUser(userData[0]);
                    } else {
                        console.error('No user data found');
                        setUser(null);
                    }
                }).catch(error => {
                    console.error('Error al obtener el usuario:', error);
                    setUser(null);
                });
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                setUser(null);
            }
        }
    }, []);

    // Agrega un console.log para el estado `user` cada vez que cambie
    useEffect(() => {
        console.log("Current user state:", user);
    }, [user]);

    return (
        <AuthContext.Provider value={{ user, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
