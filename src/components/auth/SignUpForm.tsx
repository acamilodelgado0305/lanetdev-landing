import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Modal, Form, Input, Button, message, Select } from 'antd';
import { EyeInvisibleOutlined, EyeTwoTone } from '@ant-design/icons';
import { createUser } from '../../services/apiService';

interface SignUpFormInputs {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
    role: 'superadmin' | 'cajero' | 'usuario' | 'tecnico';
}

interface SignUpModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose }) => {
    const { control, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormInputs>();
    const navigate = useNavigate();

    const onSubmit = async (userData: SignUpFormInputs) => {
        try {
            const { username, email, password, role } = userData;
            await createUser({ username, email, password, role });
            message.success('Usuario registrado correctamente');
            onClose();
            navigate('/login');
        } catch (error) {
            message.error('Hubo un problema al registrarse. Por favor, intenta nuevamente.');
            console.error('Error durante el registro:', error);
        }
    };

    return (
        <Modal
            title="Regístrate"
            open={isOpen}
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
                    label="Rol"
                    validateStatus={errors.role ? 'error' : ''}
                    help={errors.role?.message}
                >
                    <Controller
                        name="role"
                        control={control}
                        rules={{ required: 'El rol es requerido' }}
                        render={({ field }) => (
                            <Select {...field} placeholder="Selecciona un rol">
                                <Select.Option value="superadmin">Superadmin</Select.Option>
                                <Select.Option value="admin">Admin</Select.Option>
                                <Select.Option value="user">User</Select.Option>
                            </Select>
                        )}
                    />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Registrarse
                    </Button>
                </Form.Item>
            </Form>
            <div>
                <Button type="link" onClick={() => { onClose(); navigate('/login'); }}>
                    Iniciar Sesión
                </Button>
            </div>
        </Modal>
    );
};

export default SignUpModal;