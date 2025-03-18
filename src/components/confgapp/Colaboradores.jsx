import React, { useState, useEffect } from "react";
import { Table, Tag, Space, Button, message, Modal } from "antd";
import { EditOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { getUsers, updateUser, deleteUser } from "../../services/apiService";
import { Link } from "react-router-dom";
import SignUpModal from "../auth/SignUpForm";
import { useAuth } from "../../components/Context/AuthProvider";

const Colaboradores = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authToken } = useAuth();
  const [editingUser, setEditingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const openModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(1, 10, "", authToken);
      setCollaborators(data);
    } catch (err) {
      message.error("Error al cargar los colaboradores");
      console.error("Error fetching users:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCollaborator = (id) => {
    Modal.confirm({
      title: "¿Desea eliminar el colaborador?",
      content: "Esta acción no se puede deshacer.",
      okText: "Eliminar",
      okType: "danger",
      cancelText: "Cancelar",
      onOk: async () => {
        try {
          await deleteUser(id, authToken);
          message.success("Colaborador eliminado con éxito");
          fetchUsers();
        } catch (error) {
          message.error("Error al eliminar colaborador");
          console.error("Error deleting collaborator:", error.response ? error.response.data : error.message);
        }
      },
    });
  };

  const handleEditCollaborator = (record) => {
    setEditingUser(record);
    setIsModalOpen(true);
  };

  const columns = [
    {
      title: "Nombre",
      dataIndex: "username",
      key: "name",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
    },
    {
      title: "Rol",
      key: "role",
      dataIndex: "role",
      render: (role) => {
        if (!role) return <Tag color="default">No asignado</Tag>;
        const color = role.toLowerCase() === "cajero" ? "geekblue" : "green";
        return <Tag color={color}>{role.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Acciones",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button icon={<EditOutlined />} onClick={() => handleEditCollaborator(record)}>
            Editar
          </Button>
          <Button
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteCollaborator(record.id)}
            danger
          >
            Eliminar
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Link>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={openModal}
          style={{ marginBottom: 16 }}
        >
          Agregar Colaborador
        </Button>
      </Link>
      <Table
        columns={columns}
        dataSource={collaborators}
        rowKey="id"
        loading={loading}
      />
      <SignUpModal
        isOpen={isModalOpen}
        onClose={closeModal}
        user={editingUser}
        onSave={async (updatedUserData) => {
          await updateUser(editingUser.id, updatedUserData, authToken);
          fetchUsers();
          closeModal();
        }}
      />
    </div>
  );
};

export default Colaboradores;