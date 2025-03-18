import axios from 'axios';


const CAJERO_URL = import.meta.env.VITE_API_FINANZAS;

// Instancia de axios personalizada
const cajeroapi = axios.create({
    baseURL: CAJERO_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las solicitudes
cajeroapi.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('authToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

//----------------------------------------------ACCOUNTS------------------------------------------------------------------
export const getCajeros = async () => {
    try {
        const response = await cajeroapi.get('/cajeros');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las cuentas:', error);
        throw error;
    }
};



