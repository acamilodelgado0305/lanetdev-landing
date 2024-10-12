import { useSearchParams, Link } from 'react-router-dom';
import React, { useEffect, useState } from 'react';

const SearchResults = () => {
    const [searchParams] = useSearchParams();
    const [results, setResults] = useState([]);
    const query = searchParams.get('query'); // Obtén el parámetro 'query' de la URL

    useEffect(() => {
        if (query) {
            // Simulación de búsqueda - en un caso real, podrías hacer una llamada a una API aquí
            const mockData = [
                { id: 1, name: 'Factura 123' },
                { id: 2, name: 'Factura 456' },
                { id: 3, name: 'Factura 789' },
            ];

            const filteredResults = mockData.filter(item =>
                item.name.toLowerCase().includes(query.toLowerCase())
            );
            setResults(filteredResults);
        }
    }, [query]);

    return (
        <div className="container mx-auto p-4 mt-8 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-semibold mb-4 text-gray-700">
                Resultados de búsqueda para: <span className="font-bold text-blue-600">{query}</span>
            </h2>
            {results.length > 0 ? (
                <ul className="space-y-4">
                    {results.map(result => (
                        <li
                            key={result.id}
                            className="border p-4 rounded-lg hover:bg-blue-100 transition duration-300 ease-in-out"
                        >
                            <span className="text-lg text-gray-800">{result.name}</span>
                        </li>
                    ))}
                </ul>
            ) : (
                <div className="text-center">
                    <p className="text-gray-500 font-medium">
                        No se encontraron resultados para <span className="font-bold">{query}</span>
                    </p>
                    <p className="mt-4 text-lg text-gray-700">Quizás te puedan interesar:</p>
                    <ul className="mt-4 space-y-2">
                        <li>
                            <Link to="/index/moneymanager" className="text-blue-500 hover:underline">
                                Gestión de dinero
                            </Link>
                        </li>
                        <li>
                            <Link to="/index/communication/emails" className="text-blue-500 hover:underline">
                                Gestión de correos electrónicos
                            </Link>
                        </li>
                        <li>
                            <Link to="/index/clientes" className="text-blue-500 hover:underline">
                                Gestión de clientes
                            </Link>
                        </li>
                        <li>
                            <Link to="/index/config" className="text-blue-500 hover:underline">
                                Configuración de la aplicación
                            </Link>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
};

export default SearchResults;
