import React, { useState, useEffect } from "react";
import { PlusCircle, Tag } from "lucide-react";
import AddCategoriesModal from "./addCategories";
import { getCategories } from "../../../services/moneymanager/moneyService";

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCategories();
        setCategories(data);
      } catch (err) {
        setError("Error al cargar las categorias");
        console.error("Error fetching categories:", err);
      }
    };

    fetchCategories();
  }, []);

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {});

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

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
                      className="p-4 hover:bg-gray-50 transition duration-300 flex items-center"
                    >
                      <Tag className={`mr-3 ${type === "income" ? "text-green-500" : "text-red-500"}`} size={20} />
                      <h3 className="text-lg font-semibold text-gray-800">
                        {category.name}
                      </h3>
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
          <AddCategoriesModal isOpen={isModalOpen} onClose={closeModal} />
        </div>
      </main>
    </div>
  );
};

export default Categories;