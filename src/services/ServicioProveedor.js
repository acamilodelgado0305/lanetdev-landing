import axios from 'axios';


const CAJERO_URL = import.meta.env.VITE_API_FINANZAS;

// Instancia de axios personalizada
const proveedorapi = axios.create({
    baseURL: CAJERO_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor para agregar el token a las solicitudes
proveedorapi.interceptors.request.use(
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
export const getProveedores = async () => {
    try {
        const response = await proveedorapi.get('/providers');
        return response.data;
    } catch (error) {
        console.error('Error al obtener los proveedores:', error);
        throw error;
    }
};



