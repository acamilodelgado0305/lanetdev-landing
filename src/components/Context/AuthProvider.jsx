import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as loginUserService, getUserById, fetchUserToken } from '../../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

// Función para verificar si el token ha expirado
const isTokenExpired = (token) => {
    if (!token) return true;
    try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000; // Tiempo actual en segundos
        return decoded.exp < currentTime; // Compara la expiración con el tiempo actual
    } catch (error) {
        console.error('Error al decodificar el token:', error);
        return true; // Si hay error, asumimos que el token no es válido
    }
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
    const [userApp, setUserApp] = useState(sessionStorage.getItem('app') || null);
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
                throw new Error('No se encontraron datos de usuario');
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
            logout(); // Forzar logout si falla el login
            throw error;
        } finally {
            setLoading(false);
        }
    };

    // Función para restaurar el token y sesión
    const restoreSession = async () => {
        setRestoringSession(true);
        try {
            const storedUserId = sessionStorage.getItem('userId');
            const storedApp = sessionStorage.getItem('app');

            if (storedUserId) {
                const { token } = await fetchUserToken(storedUserId);
                if (token && !isTokenExpired(token)) {
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
                        throw new Error('No se encontraron datos de usuario');
                    }
                } else {
                    throw new Error('Token inválido o expirado');
                }
            } else {
                throw new Error('No hay ID de usuario almacenado');
            }
        } catch (error) {
            console.error('Error al restaurar la sesión:', error);
            logout(); // Forzar logout si falla la restauración
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

    // Verificación periódica del token y restauración de sesión
    useEffect(() => {
        const checkToken = () => {
            if (authToken && isTokenExpired(authToken)) {
                console.warn('Token expirado, cerrando sesión...');
                logout();
            } else if (!authToken && !user && !restoringSession) {
                restoreSession();
            }
        };

        // Ejecutar inmediatamente al montar el componente
        checkToken();

        // Verificar cada 5 minutos (o el intervalo que prefieras)
        const interval = setInterval(checkToken, 5 * 60 * 1000);

        // Limpiar el intervalo al desmontar
        return () => clearInterval(interval);
    }, [authToken, user, restoringSession]);

    return (
        <AuthContext.Provider value={{ user, userRole, userApp, login, logout, loading, authToken, setUser }}>
            {children}
        </AuthContext.Provider>
    );
};