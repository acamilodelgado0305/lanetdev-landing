import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as loginUserService, getUserById, fetchUserToken } from '../../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userApp, setUserApp] = useState(sessionStorage.getItem('app') || null); // Inicializar desde sessionStorage
    const [authToken, setAuthToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [restoringSession, setRestoringSession] = useState(false);

    // Función de inicio de sesión
    const login = async (email, password) => {
        setLoading(true);
        try {
            const { token } = await loginUserService(email, password);
            setAuthToken(token);

            const decodedToken = jwtDecode(token);
            const id = decodedToken.id;

            // Guardar el id en sessionStorage
            sessionStorage.setItem('userId', id);

            const userData = await getUserById(id, token);
            if (userData) {
                const appFromUserData = userData.app || decodedToken.app;
                setUser({ id, ...userData });
                setUserRole(decodedToken.role);
                setUserApp(appFromUserData);

                if (appFromUserData) {
                    sessionStorage.setItem('app', appFromUserData);
                } else {
                    sessionStorage.removeItem('app');
                    console.warn('El campo app no está presente en los datos del usuario');
                }
            } else {
                console.error('No se encontraron datos de usuario');
                setUser(null);
                setUserRole(null);
                setUserApp(null);
                sessionStorage.removeItem('app');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
            setUser(null);
            setUserRole(null);
            setUserApp(null);
            sessionStorage.removeItem('app');
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Función para restaurar el token y sesión usando la ruta /users/:id/token
    const restoreSession = async () => {
        setRestoringSession(true);
        try {
            const storedUserId = sessionStorage.getItem('userId');
            const storedApp = sessionStorage.getItem('app');

            if (storedUserId) {
                const { token } = await fetchUserToken(storedUserId);
                if (token) {
                    setAuthToken(token);

                    const decodedToken = jwtDecode(token);
                    const userData = await getUserById(storedUserId, token);

                    if (userData) {
                        const appFromUserData = userData.app || decodedToken.app || storedApp;
                        setUser({ id: storedUserId, ...userData });
                        setUserRole(decodedToken.role);
                        setUserApp(appFromUserData);

                        if (appFromUserData) {
                            sessionStorage.setItem('app', appFromUserData);
                        } else {
                            sessionStorage.removeItem('app');
                            console.warn('El campo app no está presente en los datos restaurados');
                        }
                    } else {
                        setUser(null);
                        setUserRole(null);
                        setUserApp(null);
                        sessionStorage.removeItem('app');
                    }
                }
            }
        } catch (error) {
            console.error('Error al restaurar la sesión:', error);
            setUser(null);
            setUserRole(null);
            setUserApp(null);
            sessionStorage.removeItem('app');
        } finally {
            setRestoringSession(false);
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        setAuthToken(null);
        setUser(null);
        setUserRole(null);
        setUserApp(null);
        sessionStorage.removeItem('userId');
        sessionStorage.removeItem('app');
    };

    // useEffect para restaurar la sesión al recargar la página
    useEffect(() => {
        if (!authToken && !user && !restoringSession) {
            restoreSession();
        }
    }, [authToken, user, restoringSession]);

    return (
        <AuthContext.Provider value={{ user, userRole, userApp, login, logout, loading, authToken, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};