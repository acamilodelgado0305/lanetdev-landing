import React, { useState, useEffect } from "react";
import { PlusCircle, Tag, Trash2 } from "lucide-react";
import AddCategoriesModal from "./addCategories";
import { getCategories, deleteCategory } from "../../../services/moneymanager/moneyService";
import Swal from 'sweetalert2';

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al cargar las categorías',
      });
      console.error("Error fetching categories:", err);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorieAdded = () => {
    fetchCategories(); 
  };

  const handleDeleteCategory = async (id, name) => {
    try {
      const result = await Swal.fire({
        title: '¿Estás seguro?',
        text: `¿Quieres eliminar la categoría "${name}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Sí, eliminar',
        cancelButtonText: 'Cancelar'
      });

      if (result.isConfirmed) {
        await deleteCategory(id);
        await fetchCategories();
        Swal.fire(
          '¡Eliminada!',
          'La categoría ha sido eliminada.',
          'success'
        );
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Error al eliminar la categoría',
      });
      console.error("Error deleting category:", err);
    }
  };

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {});

  return (
    <div className="bg-gray-100 min-h-screen w-full p-4">
      <main className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6 relative">
          <h1 className="text-3xl font-bold mb-6 text-green-600">
            Dashboard de Categorías
          </h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.keys(groupedCategories).map((type) => (
              <div key={type} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className={`${type === "income" ? "bg-green-500" : "bg-red-500"} text-white p-4`}>
                  <h2 className="text-xl font-bold">
                    {type === "income" ? "Ingresos" : type === "expense" ? "Gastos" : type}
                  </h2>
                </div>
                <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
                  {groupedCategories[type].map((category) => (
                    <div
                      key={category.id}
                      className="p-4 hover:bg-gray-50 transition duration-300 flex items-center justify-between"
                    >
                      <div className="flex items-center">
                        <Tag className={`mr-3 ${type === "income" ? "text-green-500" : "text-red-500"}`} size={20} />
                        <h3 className="text-lg font-semibold text-gray-800">
                          {category.name}
                        </h3>
                      </div>
                      <button
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        className="text-red-500 hover:text-red-700 transition-colors duration-300"
                        aria-label="Eliminar categoría"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          
          <button
            onClick={openModal}
            className="fixed bottom-8 right-8 bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-colors duration-300"
            aria-label="Añadir categoría"
          >
            <PlusCircle size={24} />
          </button>
          <AddCategoriesModal isOpen={isModalOpen} onClose={closeModal} onCategorieAdded={handleCategorieAdded}/>
        </div>
      </main>
    </div>
  );
};

export default Categories;