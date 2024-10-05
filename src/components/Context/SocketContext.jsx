import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        const newSocket = io(import.meta.env.VITE_APP_SOCKET_URL, {
            withCredentials: true,
        });
        setSocket(newSocket);

        newSocket.on('userRegistered', (data) => {
            setNotifications((prev) => [...prev, { username: data.username, message: 'Nuevo usuario registrado' }]);
            console.log('Nuevo usuario registrado:', data.username);
        });

        newSocket.on('notification', (data) => {
            console.log('Notificación recibida:', data);
            if (data && (data.message || data.username)) { // Verifica si hay algún mensaje o nombre
                const message = data.message || `${data.username} se ha registrado.`; // Fallback si no hay mensaje
                setNotifications((prev) => [...prev, { message }]);
            } else {
                console.error('El mensaje de la notificación está indefinido:', data);
            }
        });

        return () => {
            newSocket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, notifications }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    return useContext(SocketContext);
};
