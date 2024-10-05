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
            console.log('Nuevo usuario registrado:', data);
            if (data && data.message) {
                setNotifications((prev) => [...prev, { message: data.message }]);
            } else {
                console.error('El mensaje de la notificación de usuario registrado está indefinido:', data);
            }
        });
        newSocket.on('notification', (data) => {
            /*  console.log('Notificación recibida:', data);
             // Asegúrate de que data tenga una propiedad message */
            if (data && data.message) {
                setNotifications((prev) => [...prev, { message: data.message }]);
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
