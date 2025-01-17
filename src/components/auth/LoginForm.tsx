import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { requestPasswordRecovery } from "../../services/apiService"
import { useAuth } from '../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
const LoginForm = () => {
    const [isRecoverPassword, setIsRecoverPassword] = useState(false); // Estado para alternar entre login y recuperación
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (data) => {
        try {
            await login(data.email, data.password); // Usa la función login del AuthProvider
            navigate('/index'); // Redirige al usuario al dashboard o página principal
        } catch (error) {
            Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
        }
    };

    const handleRecoverPassword = async (data) => {
        try {
            // Llamar al servicio para solicitar la recuperación de contraseña
            await requestPasswordRecovery(data.email);

            // Mostrar mensaje de éxito al usuario
            Swal.fire(
                'Éxito',
                'Se ha enviado un correo para recuperar la contraseña. Por favor, revisa tu bandeja de entrada.',
                'success'
            );

            // Volver al formulario de login
            setIsRecoverPassword(false);

            // Resetear el formulario
            reset();
        } catch (error) {
            // Manejar errores y mostrar mensaje al usuario
            console.error('Error al recuperar la contraseña:', error);

            Swal.fire(
                'Error',
                error.response?.data?.message || 'No se pudo procesar la solicitud. Por favor, inténtalo más tarde.',
                'error'
            );
        }
    };

    return (
        <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                {isRecoverPassword ? (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Recuperar Contraseña</h2>
                        <form onSubmit={handleSubmit(handleRecoverPassword)}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input
                                    id="email"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="email"
                                    {...register('email', { required: 'El correo electrónico es requerido' })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Recuperar Contraseña
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsRecoverPassword(false)}
                                className="text-indigo-600 hover:underline text-sm focus:outline-none"
                            >
                                Volver a Iniciar Sesión
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-2xl font-bold mb-6 text-center">Iniciar Sesión</h2>
                        <form onSubmit={handleSubmit(handleLogin)}>
                            <div className="mb-4">
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
                                <input
                                    id="email"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="email"
                                    {...register('email', { required: 'El correo electrónico es requerido' })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                            </div>
                            <div className="mb-4">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                                <input
                                    id="password"
                                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    type="password"
                                    {...register('password', { required: 'La contraseña es requerida' })}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
                            </div>
                            <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                Iniciar Sesión
                            </button>
                        </form>
                        <div className="mt-4 text-center">
                            <button
                                onClick={() => setIsRecoverPassword(true)}
                                className="text-indigo-600 hover:underline text-sm focus:outline-none"
                            >
                                ¿Olvidaste tu contraseña?
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default LoginForm;
