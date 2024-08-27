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

//----------------------------------------------ACCOUNTS------------------------------------------------------------------
export const getAccounts = async () => {
    try {
        const response = await moneyApi.get('/accounts');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las cuentas:', error);
        throw error;
    }
};

export const createAccount = async (userData) => {
    try {
        const response = await authApi.post('/accounts', userData); // Envía una solicitud POST al endpoint '/accounts'
        return response.data; // Devuelve los datos de la respuesta
    } catch (error) {
        console.error('Error al crear el usuario:', error); // Registra el error en la consola
        throw error; // Lanza el error nuevamente para que pueda ser manejado por el llamador
    }
};



//--------------------------------------CATEGORIES--------------------------------------------------------------

export const getCategories = async () => {
    try {
        const response = await moneyApi.get('/categories');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las categorias:', error);
        throw error;
    }
};

//-------------------------------TRANSACTIONS-----------------------------------------------------------------


export const getTransactions = async () => {
    try {
        const response = await moneyApi.get('/transactions');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las transacciones:', error);
        throw error;
    }
};
