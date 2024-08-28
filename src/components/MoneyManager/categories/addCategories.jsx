import React, { useState } from "react";
import { IoClose } from "react-icons/io5";
import Swal from 'sweetalert2';

const AddCategoriesModal = ({ isOpen, onClose, onCategorieAdded }) => {
  const apiUrl = import.meta.env.VITE_API_FINANZAS;

  const [name, setName] = useState("");
  const [type, setType] = useState("expense");

  const handleSave = async () => {
    if (!name.trim()) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'El nombre de la categoría es requerido.',
      });
      return;
    }

    const categoryData = {
      name: name.trim(),
      type: type
    };

    try {
      const response = await fetch(`${apiUrl}/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(categoryData),
      });

      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: '¡Éxito!',
          text: 'Categoría creada con éxito',
        });
        onClose();
        onCategorieAdded();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Error al crear la categoría',
        });
      }
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: `Error al conectar con la API: ${error.message}`,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Nueva Categoría
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <IoClose size={24} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <label
              htmlFor="type"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Tipo de Categoría
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
            >
              <option value="expense">Gasto</option>
              <option value="income">Ingreso</option>
            </select>
          </div>
          <div>
            <label
              htmlFor="name"
              className="block mb-1 text-sm font-medium text-gray-700"
            >
              Nombre de la Categoría
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-2 bg-gray-100 rounded border border-gray-300"
              placeholder="Ej: Alimentación"
            />
          </div>
        </div>

        <div className="flex p-4 border-t border-gray-200">
          <button
            className="flex-1 py-2 bg-blue-500 text-white rounded-lg mr-2 hover:bg-blue-600"
            onClick={handleSave}
          >
            Guardar
          </button>
          <button
            className="flex-1 py-2 bg-gray-300 text-gray-800 rounded-lg ml-2 hover:bg-gray-400"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCategoriesModal;