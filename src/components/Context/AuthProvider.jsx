import React, { createContext, useState, useEffect, useContext } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser as loginUserService, getUserById, fetchUserToken } from '../../services/apiService';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userRole, setUserRole] = useState(null);
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

            // Guardar el id en sessionStorage para persistencia
            sessionStorage.setItem('userId', id);

            // Hacer la llamada a getUserById para obtener los datos completos del usuario
            const userData = await getUserById(id, token);
            if (userData) {
                setUser({ id: id, ...userData });
                setUserRole(decodedToken.role);
            } else {
                console.error('No se encontraron datos de usuario');
                setUser(null);
                setUserRole(null);
            }
        } catch (error) {
            console.error('Error al iniciar sesión:', error.message);
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

            if (storedUserId) {
                const { token } = await fetchUserToken(storedUserId);
                if (token) {
                    setAuthToken(token);

                    const decodedToken = jwtDecode(token);
                    const userData = await getUserById(storedUserId, token);

                    if (userData) {
                        setUser({ id: storedUserId, ...userData });
                        setUserRole(decodedToken.role);
                    } else {
                        setUser(null);
                        setUserRole(null);
                    }
                }
            }
        } catch (error) {
            console.error('Error al restaurar la sesión:', error);
        } finally {
            setRestoringSession(false);
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        setAuthToken(null);
        setUser(null);
        setUserRole(null);
        sessionStorage.removeItem('userId');
    };

    // useEffect para restaurar la sesión al recargar la página
    useEffect(() => {
        if (!authToken && !user && !restoringSession) {
            restoreSession();
        }
    }, [authToken, user, restoringSession]);

    return (
        <AuthContext.Provider value={{ user, userRole, login, logout, loading, authToken }}>
            {children}
        </AuthContext.Provider>
    );
};
