import axios from 'axios';

// Definir la URL base de la API
const AUTH_URL = import.meta.env.VITE_API_AUTH;

// Instancia de axios personalizada
const authApi = axios.create({
    baseURL: AUTH_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las solicitudes (sin hooks)
authApi.interceptors.request.use(
    (config) => {
        // En lugar de usar un hook, debes pasar el token desde donde sea llamado el interceptor
        const token = config.token;  // El token se pasará directamente en el config desde tu componente o lógica de React
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Función para obtener todos los usuarios
export const getUsers = async (page = 1, limit = 10, search = '', token) => {
    try {
        const response = await authApi.get(`/users`, {
            params: {
                page,
                limit,
                search,
            },
            headers: { Authorization: `Bearer ${token}` }  // Pasar el token directamente
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener los usuarios:', error);
        throw error;
    }
};

// Función para obtener un usuario por ID
export const getUserById = async (id, token) => {
    try {
        const response = await authApi.get(`/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }  // Pasar el token directamente
        });
        return response.data;
    } catch (error) {
        console.error('Error al obtener el usuario:', error);
        throw error;
    }
};

// Función para registrar un nuevo usuario
export const createUser = async (userData) => {
    try {
        const response = await authApi.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
        throw error;
    }
};

// Función para actualizar la información adicional de un usuario
export const updateUserInfo = async (userId, userInfo, token) => {
    try {
        const response = await authApi.put(`/update-info/${userId}`, userInfo, {
            headers: { Authorization: `Bearer ${token}` }  // Pasar el token directamente
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la información del usuario:', error);
        throw error;
    }
};

// Función para iniciar sesión y obtener el token
export const loginUser = async (email, password) => {
    try {
        const response = await authApi.post('/login', { email, password });
        const { token } = response.data;

        if (!token) {
            throw new Error('No se obtuvo el token en el inicio de sesión');
        }

        return { token };  // Devolvemos solo el token
    } catch (error) {
        console.error('Error durante el inicio de sesión:', error.message);
        throw error;
    }
};

// Función para obtener el token del usuario
export const fetchUserToken = async (id) => {
    try {
        const response = await authApi.get(`/users/${id}/token`);
        return response.data;  // Devuelve el token del backend
    } catch (error) {
        console.error('Error al obtener el token del usuario:', error.response ? error.response.data : error.message);
        throw error;
    }
};

// Función para actualizar un usuario
export const updateUser = async (id, userData, token) => {
    try {
        const response = await authApi.put(`/users/${id}`, userData, {
            headers: { Authorization: `Bearer ${token}` }  // Pasar el token directamente
        });
        return response.data;
    } catch (error) {
        console.error('Error al actualizar el usuario:', error);
        throw error;
    }
};

// Función para eliminar un usuario
export const deleteUser = async (id, token) => {
    try {
        const response = await authApi.delete(`/users/${id}`, {
            headers: { Authorization: `Bearer ${token}` }  // Pasar el token directamente
        });
        return response.data;
    } catch (error) {
        console.error('Error al eliminar el usuario:', error);
        throw error;
    }
};

// Función para subir una imagen (en caso de que tengas esta funcionalidad)
export const uploadImage = async (file, token) => {
    const formData = new FormData();
    formData.append('image', file);

    try {
        const response = await authApi.post('/upload-image', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
                Authorization: `Bearer ${token}`  // Pasar el token directamente
            },
        });
        return response.data.url;
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        throw error;
    }
};
export const updateProfilePicture = async (userId, profilePictureUrl, authToken) => {
    try {
        const response = await authApi.put(
            `/${userId}/profile-picture`,
            { profilepictureurl: profilePictureUrl },
            {
                headers: {
                    Authorization: `Bearer ${authToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la imagen de perfil:', error);
        throw error;
    }
};
export const changePassword = async (userId, currentPassword, newPassword, token) => {
    try {
        const response = await authApi.put(
            `/users/${userId}/change-password`,
            { currentPassword, newPassword },
            {
                headers: {
                    Authorization: `Bearer ${token}`, // Pasar el token directamente
                },
            }
        );
        return response.data; // Respuesta del backend
    } catch (error) {
        console.error('Error al cambiar la contraseña:', error.response ? error.response.data : error.message);
        throw error;
    }
};