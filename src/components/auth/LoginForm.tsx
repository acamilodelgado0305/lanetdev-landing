import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { loginUser } from '../../services/apiService'; // Importa el servicio

const LoginForm = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const handleLogin = async (data) => {
        try {
            await loginUser(data.email, data.password);
            navigate('/index'); // Redirige al usuario al dashboard o página principal
        } catch (error) {
            Swal.fire('Error', 'Usuario o contraseña incorrectos', 'error');
        }
    };

    return (
        <div className=" ml-[10%] md:ml-[40%] flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
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
                    <div className="mt-4 text-center">
                        <button type="button" className="text-indigo-600 hover:text-indigo-500" onClick={() => navigate('/signup')}>Regístrate</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;