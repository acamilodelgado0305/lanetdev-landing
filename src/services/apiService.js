import axios from 'axios';

const AUTH_URL = 'https://server-auth.app.la-net.co/api';

// Instancia de axios personalizada
const authApi = axios.create({
    baseURL: AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Función para obtener todos los usuarios
export const getUsers = async () => {
    try {
        const response = await authApi.get('/users');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
};

// Función para obtener un usuario por ID
export const getUserById = async (id) => {
    try {
        const response = await authApi.get(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error;
    }
};

// Función para crear un nuevo usuario
export const createUser = async (userData) => {
    try {
        const response = await authApi.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    }
};

// Función para iniciar sesión
export const loginUser = async (email, password) => {
    try {
        const response = await authApi.post('/login', { email, password });
        const { token } = response.data;

        if (token) {
            localStorage.setItem('token', token); // Guarda el token en localStorage
        }

        return response.data;
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Función para actualizar un usuario
export const updateUser = async (id, userData) => {
    try {
        const response = await authApi.put(`/users/${id}`, userData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
};

// Función para eliminar un usuario
export const deleteUser = async (id) => {
    try {
        const response = await authApi.delete(`/users/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
    }
};
