import React, { useState, useEffect } from "react";
import { TagOutlined, DeleteOutlined, EditOutlined } from "@ant-design/icons";
import { Layout, Typography, Card, Button, Table, Tag, message, Modal } from "antd";
import {
  getCategories,
  deleteCategory,
} from "../../../services/moneymanager/moneyService";
import AddCategoriesModal from "./addCategories";
import { PlusCircle } from "lucide-react";

const { Content } = Layout;
const { Title, Text } = Typography;

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

  const columns = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div className="flex items-center gap-2">
          <TagOutlined className={record.type === "income" ? "text-green-600" : "text-red-500"} />
          <span>{text}</span>
        </div>
      ),
    },
    {
      title: 'Tipo',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color={type === "income" ? "success" : "error"}>
          {type === "income" ? "Ingreso" : "Gasto"}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="flex justify-center space-x-2">
          <Button
            type="text"
            icon={<EditOutlined className="text-blue-600" />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            icon={<DeleteOutlined className="text-red-600" />}
            onClick={() => handleDeleteCategory(record.id, record.name)}
          />
        </div>
      ),
    },
  ];

  const ingresos = categories.filter(cat => cat.type === "income");
  const gastos = categories.filter(cat => cat.type === "expense");

  return (
    <div >
      <Card className="border-0 shadow-sm">
        {/* Header con título y botón de agregar */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <Title level={4} className="m-0">Gestion de Categorías</Title>
            <Text type="secondary">Gestiona las categorías de ingresos y gastos</Text>
          </div>
          <Button
            type="primary"
            icon={<PlusCircle className="w-4 h-4" />}
            onClick={openModal}
            className="bg-blue-600"
          >
            Agregar Nueva Categoría
          </Button>
        </div>

        {/* Cards de resumen */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="bg-green-50">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Categorías de Ingresos</Text>
                <Title level={4} className="m-0 text-green-600">
                  {ingresos.length} categorías
                </Title>
              </div>
              <TagOutlined className="text-2xl text-green-600" />
            </div>
          </Card>
          <Card className="bg-red-50">
            <div className="flex items-center justify-between">
              <div>
                <Text type="secondary">Categorías de Gastos</Text>
                <Title level={4} className="m-0 text-red-600">
                  {gastos.length} categorías
                </Title>
              </div>
              <TagOutlined className="text-2xl text-red-600" />
            </div>
          </Card>
        </div>

        {/* Tabla de categorías */}
        <Table
          columns={columns}
          dataSource={categories}
          rowKey="id"
          pagination={false}
          className="border rounded-lg"
        />

        <AddCategoriesModal
          isOpen={isModalOpen}
          onClose={closeModal}
          onCategorieAdded={handleCategorieAdded}
          categoryToEdit={editCategory}
        />
      </Card>
    </div>
  );
};

export default Categories;