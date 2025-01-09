import React, { useState, useEffect } from "react";
import { TagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Layout, Typography, Card, Button, List, Modal, message } from "antd";
import {
  getCategories,
  deleteCategory,
} from "../../../services/moneymanager/moneyService";
import AddCategoriesModal from "./addCategories";
import {
  PlusCircle,
} from "lucide-react";

const { Content } = Layout;
const { Title } = Typography;

const Categories = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categories, setCategories] = useState([]);
  const [editCategory, setEditCategory] = useState(null);

  const openModal = () => {
    setEditCategory(null);
    setIsModalOpen(true);
  };
  const closeModal = () => setIsModalOpen(false);

  const fetchCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      message.error("Error al cargar las categorías");
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
      Modal.confirm({
        title: "¿Estás seguro?",
        content: `¿Quieres eliminar la categoría "${name}"?`,
        okText: "Sí, eliminar",
        okType: "danger",
        cancelText: "Cancelar",
        onOk: async () => {
          await deleteCategory(id);
          await fetchCategories();
          message.success("La categoría ha sido eliminada.");
        },
      });
    } catch (err) {
      message.error("Error al eliminar la categoría");
      console.error("Error deleting category:", err);
    }
  };

  const openEditModal = (category) => {
    setEditCategory(category);
    setIsModalOpen(true);
  };

  const groupedCategories = categories.reduce((acc, category) => {
    if (!acc[category.type]) {
      acc[category.type] = [];
    }
    acc[category.type].push(category);
    return acc;
  }, {});

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Object.entries(groupedCategories).map(([type, categoryList]) => (
            <Card
              key={type}
              title={type === "income" ? "Ingresos" : "Gastos"}
              extra={<TagOutlined className={type === "income" ? "text-green-700" : "text-red-500"} />}
              className="w-full"
            >
              <List
                dataSource={categoryList}
                renderItem={(category) => (
                  <List.Item
                    actions={[
                      <Button
                        icon={<EditOutlined />}
                        onClick={() => openEditModal(category)}
                        type="link"
                      />,
                      <Button
                        icon={<DeleteOutlined />}
                        onClick={() => handleDeleteCategory(category.id, category.name)}
                        type="link"
                        danger
                      />,
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <TagOutlined className={type === "income" ? "text-green-700" : "text-red-500"} />
                      }
                      title={category.name}
                    />
                  </List.Item>
                )}
              />
            </Card>
          ))}
        </div>
        <button
            onClick={openModal}
            className="fixed bottom-11 right-11 bg-[#FE6256] hover:bg-[#FFA38E] text-white rounded-full p-3 shadow-lg transition-colors duration-300"
            aria-label="Añadir entrada"
          >
            <PlusCircle size={30} />
          </button>
        <AddCategoriesModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCategorieAdded={handleCategorieAdded}
          categoryToEdit={editCategory}
        />
      </Content>
    </Layout>
  );
};

export default Categories;