import React from 'react';
import { Modal, Button } from 'antd';

const NotificationModal = ({ visible, onClose, notifications }) => {
    return (
        <Modal
            title="Notificaciones"
            visible={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose}>
                    Cerrar
                </Button>
            ]}
        >
            {notifications.length > 0 ? (
                <ul>
                    {notifications.map((notification, index) => (
                        <li key={index}>{notification.message}</li>
                    ))}
                </ul>
            ) : (
                <p>No hay nuevas notificaciones.</p>
            )}
        </Modal>
    );
};

export default NotificationModal;
