import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function FormClients() {
  const { _id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState({
    nombre: "",
    apellido: "",
    direccion: "",
    telefono: "",
    correo: "",
  });
  const [error, setError] = useState("");

  const handleInputChange = (e) => {
    setClient({
      ...client,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const updatedClient = { ...client };

    try {
      if (_id) {
        await axios.put(`http://localhost:7000/clients/${_id}`, updatedClient);
      } else {
        await axios.post('http://localhost:7000/clients', updatedClient);
      }
      navigate(-1);
      setClient({
        nombre: "",
        apellido: "",
        direccion: "",
        telefono: "",
        correo: "",
      });
      setError("");
    } catch (error) {
      setError("Error al guardar el cliente. Inténtelo de nuevo.");
    }
  };

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await axios.get(`http://localhost:7000/clients/${_id}`);
        setClient(response.data);
      } catch (error) {
        setError("Error al cargar los datos del cliente.");
      }
    };

    if (_id) {
      fetchClient();
    }
  }, [_id]);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{_id ? 'Editar Cliente' : 'Agregar Cliente'}</h2>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <form onSubmit={handleSubmit}>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold">Datos del cliente</legend>
          <div className="flex flex-col">
            <label htmlFor="nombre" className="mb-1 font-medium">Nombre:</label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              value={client.nombre}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="apellido" className="mb-1 font-medium">Apellido:</label>
            <input
              type="text"
              id="apellido"
              name="apellido"
              value={client.apellido}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="direccion" className="mb-1 font-medium">Dirección:</label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              value={client.direccion}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="telefono" className="mb-1 font-medium">Teléfono:</label>
            <input
              type="text"
              id="telefono"
              name="telefono"
              value={client.telefono}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex flex-col">
            <label htmlFor="correo" className="mb-1 font-medium">Correo:</label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={client.correo}
              onChange={handleInputChange}
              className="p-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <button
            type="submit"
            className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600"
          >
            {_id ? 'Actualizar' : 'Guardar'}
          </button>
        </fieldset>
      </form>
    </div>
  );
}
