import axios from 'axios';


const MONEY_URL = import.meta.env.VITE_API_FINANZAS;

// Instancia de axios personalizada
const moneyApi = axios.create({
    baseURL: MONEY_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las solicitudes
moneyApi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Función para obtener todas las cuentas
export const getAccounts = async () => {
    try {
        const response = await moneyApi.get('/accounts');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las cuentas:', error);
        throw error;
    }
};

export const getCategories = async () => {
    try {
        const response = await moneyApi.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        throw error;
    }
};


export const getTransactions = async () => {
    try {
        const response = await moneyApi.get('/transactions');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las transacciones:', error);
        throw error;
    }
};

export const createAccount = async (userData) => {
    try {
        const response = await authApi.post('/register', userData);
        return response.data;
    } catch (error) {
        console.error('Error al crear el usuario:', error);
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

// Función para actualizar la información adicional de un usuario
export const updateUserInfo = async (userId, userInfo) => {
    try {
        const response = await authApi.put(`/update-info/${userId}`, userInfo);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la información del usuario:', error);
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
