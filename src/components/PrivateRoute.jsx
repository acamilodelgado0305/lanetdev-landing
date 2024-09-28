import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './Context/AuthProvider';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { userRole, authToken, restoringSession } = useAuth();
    const [loadingDelay, setLoadingDelay] = useState(true);

    useEffect(() => {
        // Establecer un retraso de 1 segundo antes de que desaparezca el indicador de carga
        const timer = setTimeout(() => {
            setLoadingDelay(false);
        }, 1000);

        // Limpiar el temporizador si el componente se desmonta antes
        return () => clearTimeout(timer);
    }, []);

    if (loadingDelay || restoringSession) {
        // Mostrar el spinner de "antd" mientras se carga la sesión
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Cargando..." />
            </div>
        );
    }

    if (!authToken) {
        // Redirigir al login si no hay token
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {

        return <Navigate to="/access-denied" />;
    }

    // Si todo está correcto, renderizar el componente hijo
    return children;
};

export default PrivateRoute;
