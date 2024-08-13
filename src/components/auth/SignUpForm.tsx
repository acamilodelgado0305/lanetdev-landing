import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import './index.css';

interface SignUpFormInputs {
    email: string;
    password: string;
}

const SignUpForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<SignUpFormInputs>();
    const navigate = useNavigate();

    const handleSignUp: SubmitHandler<SignUpFormInputs> = async (data) => {
        const { email, password } = data;
        // Simular registro
        Swal.fire('¡Usuario registrado!', 'Se ha registrado correctamente.', 'success').then(() => {
            navigate('/');
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6 text-center">Regístrate</h2>
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
                        Registrarse
                    </button>
                    <div className="mt-4 text-center">
                        <button type="button" className="text-indigo-600 hover:text-indigo-500" onClick={() => navigate('/')}>Iniciar Sesión</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SignUpForm;
