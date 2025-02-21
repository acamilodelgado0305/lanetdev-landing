import { useRouteError, useNavigate } from "react-router-dom";
import { useEffect } from "react";

export default function ErrorPage() {
    const error = useRouteError();
    const navigate = useNavigate();

    // Función para volver atrás
    const goBack = () => {
        navigate("/index"); // Navegar a la página anterior
    };

    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-100 text-center">
            <div className="bg-white shadow-md p-8 max-w-md">
                <h1 className="text-4xl font-bold text-red-600 mb-4">Error...!</h1>
                <p className="text-gray-700 mb-6">
                    Lo siento, un error inesperado ha ocurrido.
                </p>
                <p className="text-gray-500 italic mb-6">
                    {error.statusText || error.message}
                </p>
                <button
                    onClick={goBack}
                    className="px-4 py-2 bg-blue-500 text-white  hover:bg-blue-600 transition"
                >
                    Volver atrás
                </button>
            </div>
        </div>
    );
}
