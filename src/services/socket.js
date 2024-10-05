import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_APP_SOCKET_URL;

const socket = io(SOCKET_URL, {
    withCredentials: true, // Esto permite enviar cookies y credenciales
});

// Escucha el evento de conexión
socket.on('connect', () => {
    console.log('Conectado a Socket.io');
});

// Exporta el socket para usarlo en otros componentes
export default socket;
