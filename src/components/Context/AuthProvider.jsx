import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as loginUserService, getUserById } from '../../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);

    const login = async (email, password) => {
        try {
            const { token } = await loginUserService(email, password);
            localStorage.setItem('authToken', token);

            const decodedToken = jwtDecode(token);
            const userId = decodedToken.id;
            const role = decodedToken.role;

            const userData = await getUserById(userId);
            console.log("User data from API:", userData);

            if (Array.isArray(userData) && userData.length > 0) {
                setUser(userData[0]);
                setUserRole(role);
            } else {
                console.error('No user data found');
                setUser(null);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setUser(null);
        setUserRole(null);
    };

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwtDecode(token);
                const userId = decodedToken.id;
                const role = decodedToken.role;

                getUserById(userId).then(userData => {
                    if (Array.isArray(userData) && userData.length > 0) {
                        setUser(userData[0]);
                        setUserRole(role);
                    } else {
                        console.error('No user data found');
                        setUser(null);
                        setUserRole(null);
                    }
                }).catch(error => {
                    console.error('Error al obtener el usuario:', error);
                    setUser(null);
                    setUserRole(null);
                });
            } catch (error) {
                console.error('Error al decodificar el token:', error);
                setUser(null);
                setUserRole(null);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, userRole, login, logout, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};
