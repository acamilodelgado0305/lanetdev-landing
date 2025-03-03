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

export const deleteAccount = async (accountId) => {
    try {
        const response = await moneyApi.delete(`/accounts/${accountId}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la cuenta:', error);
        throw error;
    }
};


export const updateAccount = async (categoryId, updatedData) => {
    try {
        const response = await moneyApi.put(`/categories/${categoryId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
        throw error;
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

export const deleteCategory = async (categorieId) => {
    try {
        const response = await moneyApi.delete(`/categories/${categorieId}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la categoria:', error);
        throw error;
    }
};


export const updateCategory = async (categoryId, updatedData) => {
    try {
        const response = await moneyApi.put(`/categories/${categoryId}`, updatedData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la categoría:', error);
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

export const getPendingTransactions = async () => {
    try {
        const response = await moneyApi.get('/expenses/false');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las transacciones pendientes:', error);
        throw error;
    }
};

export const deleteTransaction = async (id) => {
    try {
        const response = await moneyApi.delete(`/transactions/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la transacciòn:', error);
        throw error;
    }
};


//--------------------------------------TRANSFERS----------------------------------------------------------------------------


export const getTransfers = async () => {
    try {
        const response = await moneyApi.get('/transfers');
        return response.data;
    } catch (error) {
        console.error('Error al obtener las trasferencias:', error);
        throw error;
    }
};

export const deleteTransfer = async (id) => {
    try {
        const response = await moneyApi.delete(`/transfers/${id}`);
        return response.data;
    } catch (error) {
        console.error('Error al eliminar la transacciòn:', error);
        throw error;
    }
};