import React, { createContext, useState, useEffect, useContext } from 'react';
import jwt_decode from 'jwt-decode'; // Asegúrate de instalar jwt-decode si no lo has hecho
import { loginUser as loginUserService, getUserById } from './apiService'; // Ajusta la importación según tu estructura de archivos

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null); // Cambiado de userId a user para almacenar toda la información del usuario

    // Función para iniciar sesión
    const login = async (email, password) => {
        try {
            const { token } = await loginUserService(email, password); // Obtén el token
            localStorage.setItem('authToken', token); // Guarda el token en localStorage

            const decodedToken = jwt_decode(token); // Decodifica el token
            const userId = decodedToken.id; // Obtén el ID del usuario

            // Obtén los datos del usuario
            const userData = await getUserById(userId);
            setUser(userData); // Establece el usuario en el estado
        } catch (error) {
            console.error('Error al iniciar sesión:', error);
            throw error;
        }
    };

    // Función para cerrar sesión
    const logout = () => {
        localStorage.removeItem('authToken'); // Elimina el token de localStorage
        setUser(null); // Limpia el estado del usuario
    };

    useEffect(() => {
        // Verifica si hay un token en el localStorage al cargar la aplicación
        const token = localStorage.getItem('authToken');
        if (token) {
            try {
                const decodedToken = jwt_decode(token);
                const userId = decodedToken.id;
                getUserById(userId).then(userData => {
                    setUser(userData);
                }).catch(error => {
                    console.error('Error al obtener el usuario:', error);
                });
            } catch (error) {
                console.error('Error al decodificar el token:', error);
            }
        }
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};
