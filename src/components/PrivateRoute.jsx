import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { useAuth } from './Context/AuthProvider';

const PrivateRoute = ({ children, allowedRoles }) => {
    const { userRole, authToken, restoringSession } = useAuth();
    const [loadingDelay, setLoadingDelay] = useState(true);
    const [isValidUser, setIsValidUser] = useState(true);

    useEffect(() => {
        const storedUserId = sessionStorage.getItem('userId');
        if (!storedUserId) {
            setIsValidUser(false);
        }
        const timer = setTimeout(() => {
            setLoadingDelay(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

    if (loadingDelay || restoringSession) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip="Cargando..." />
            </div>
        );
    }

    if (!authToken || !isValidUser) {
        return <Navigate to="/login" />;
    }

    if (allowedRoles && !allowedRoles.includes(userRole)) {
        return <Navigate to="/access-denied" />;
    }
    return children;
};

export default PrivateRoute;
