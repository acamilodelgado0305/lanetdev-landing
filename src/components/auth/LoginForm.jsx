import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Swal from 'sweetalert2';
import { requestPasswordRecovery } from "../../services/apiService";
import { useAuth } from '../Context/AuthProvider';
import { useNavigate } from 'react-router-dom';
import picture from '../../images/F.png'; // Asegúrate de que la imagen esté correctamente importada

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
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-r from-blue-100 via-blue-200 to-blue-300">
            <div className="bg-white p-8  shadow-xl max-w-md w-full">
                {/* Imagen pequeña en la parte superior */}
                <div className="flex justify-center mb-6">
                    <img src={picture} alt="Logo" className="w-16 h-16 opacity-60" /> {/* Ajustar el tamaño y opacidad de la imagen */}
                </div>

                {isRecoverPassword ? (
                    <>
                        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Recuperar Contraseña</h2>
                        <form onSubmit={handleSubmit(handleRecoverPassword)}>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                                <input
                                    id="email"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    type="email"
                                    {...register('email', { required: 'El correo electrónico es requerido' })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4  shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                            >
                                Recuperar Contraseña
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsRecoverPassword(false)}
                                className="text-blue-600 text-sm font-semibold hover:underline focus:outline-none"
                            >
                                Volver a Iniciar Sesión
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">Iniciar Sesión</h2>
                        <form onSubmit={handleSubmit(handleLogin)}>
                            <div className="mb-6">
                                <label htmlFor="email" className="block text-sm font-semibold text-gray-700">Correo Electrónico</label>
                                <input
                                    id="email"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300  shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    type="email"
                                    {...register('email', { required: 'El correo electrónico es requerido' })}
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-2">{errors.email.message}</p>}
                            </div>
                            <div className="mb-6">
                                <label htmlFor="password" className="block text-sm font-semibold text-gray-700">Contraseña</label>
                                <input
                                    id="password"
                                    className="mt-2 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
                                    type="password"
                                    {...register('password', { required: 'La contraseña es requerida' })}
                                />
                                {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
                            </div>
                            <button
                                type="submit"
                                className="w-full bg-blue-600 text-white py-3 px-4 rounded-xl shadow-lg hover:bg-blue-700 transition duration-300 focus:outline-none focus:ring-4 focus:ring-blue-300"
                            >
                                Iniciar Sesión
                            </button>
                        </form>
                        <div className="mt-6 text-center">
                            <button
                                onClick={() => setIsRecoverPassword(true)}
                                className="text-blue-600 text-sm font-semibold hover:underline focus:outline-none"
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
