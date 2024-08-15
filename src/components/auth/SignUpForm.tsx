import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { createUser } from '../../services/apiService';

interface SignUpFormInputs {
    email: string;
    password: string;
    confirmPassword: string;
}

const SignUpForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<SignUpFormInputs>();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSignUp: SubmitHandler<SignUpFormInputs> = async (data) => {
        const { email, password } = data;

        try {
            // Llama a la función createUser para registrar el nuevo usuario
            const userData = { email, password };
            await createUser(userData);

            Swal.fire('¡Usuario registrado!', 'Se ha registrado correctamente.', 'success').then(() => {
                navigate('/login');
            });
        } catch (error) {
            Swal.fire('Error', 'Hubo un problema al registrarse. Por favor, intenta nuevamente.', 'error');
            console.error('Error durante el registro:', error);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="ml-[10%] md:ml-[40%] flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-7 text-center">Regístrate</h2>
                <form onSubmit={handleSubmit(handleSignUp)}>
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

                    <div className="mb-4 relative">
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                        <div className="relative">
                            <input
                                id="password"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                type={showPassword ? "text" : "password"}
                                {...register('password', { required: 'La contraseña es requerida' })}
                            />
                            <span
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={togglePasswordVisibility}
                            >
                                {showPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.password && <p className="text-red-500 text-xs mt-2">{errors.password.message}</p>}
                    </div>

                    <div className="mb-4 relative">
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                type={showConfirmPassword ? "text" : "password"}
                                {...register('confirmPassword', {
                                    required: 'Por favor, confirma tu contraseña',
                                    validate: value => value === watch('password') || 'Las contraseñas no coinciden',
                                })}
                            />
                            <span
                                className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                                onClick={toggleConfirmPasswordVisibility}
                            >
                                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                            </span>
                        </div>
                        {errors.confirmPassword && <p className="text-red-500 text-xs mt-2">{errors.confirmPassword.message}</p>}
                    </div>

                    <button type="submit" className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md shadow hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        Registrarse
                    </button>
                    <div className="mt-4 text-center">
                        <button type="button" className="text-indigo-600 hover:text-indigo-500" onClick={() => navigate('/login')}>Iniciar Sesión</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;
