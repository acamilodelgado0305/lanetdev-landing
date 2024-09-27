import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, message } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { createUser } from '../../services/apiService';

interface SignUpFormInputs {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose }) => {
    const { control, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormInputs>();
    const navigate = useNavigate();

    const onSubmit = async (data: SignUpFormInputs) => {
        try {
            const { username, email, password } = data;
            await createUser({ username, email, password });
            message.success('Usuario registrado correctamente');
            onClose();  // Cerrar el modal
            navigate('/login');
        } catch (error) {
            message.error('Hubo un problema al registrarse. Por favor, intenta nuevamente.');
            console.error('Error durante el registro:', error);
        }
    };

    return (
        <Modal
            title="Regístrate"
            visible={isOpen}
            onCancel={onClose}
            footer={null}
        >
            <Form layout="vertical" onFinish={handleSubmit(onSubmit)}>
                <Form.Item
                    label="Nombre de Usuario"
                    validateStatus={errors.username ? 'error' : ''}
                    help={errors.username?.message}
                >
                    <Controller
                        name="username"
                        control={control}
                        rules={{ required: 'El nombre de usuario es requerido' }}
                        render={({ field }) => <Input {...field} />}
                    />
                </Form.Item>

                <Form.Item
                    label="Correo Electrónico"
                    validateStatus={errors.email ? 'error' : ''}
                    help={errors.email?.message}
                >
                    <Controller
                        name="email"
                        control={control}
                        rules={{ 
                            required: 'El correo electrónico es requerido',
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: 'Dirección de correo inválida'
                            }
                        }}
                        render={({ field }) => <Input {...field} />}
                    />
                </Form.Item>

                <Form.Item
                    label="Contraseña"
                    validateStatus={errors.password ? 'error' : ''}
                    help={errors.password?.message}
                >
                    <Controller
                        name="password"
                        control={control}
                        rules={{ required: 'La contraseña es requerida' }}
                        render={({ field }) => (
                            <Input.Password
                                {...field}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item
                    label="Confirmar Contraseña"
                    validateStatus={errors.confirmPassword ? 'error' : ''}
                    help={errors.confirmPassword?.message}
                >
                    <Controller
                        name="confirmPassword"
                        control={control}
                        rules={{
                            required: 'Por favor, confirma tu contraseña',
                            validate: (value) => value === watch('password') || 'Las contraseñas no coinciden'
                        }}
                        render={({ field }) => (
                            <Input.Password
                                {...field}
                                iconRender={(visible) => (visible ? <EyeTwoTone /> : <EyeInvisibleOutlined />)}
                            />
                        )}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Registrarse
                    </Button>
                </Form.Item>
            </Form>
            <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={() => { onClose(); navigate('/login'); }}>
                    Iniciar Sesión
                </Button>
            </div>
        </Modal>
    );
};

export default SignUpModal;
