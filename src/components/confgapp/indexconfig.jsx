import React, { useState, useEffect } from "react";
import {
  Layout,
  Menu,
  Table,
  Tag,
  Space,
  Button,
  message,
  Typography,
  Modal,
  Card,
  Avatar,
} from "antd";
import {
  UserOutlined,
  SettingOutlined,
  TeamOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ProfileOutlined,
} from "@ant-design/icons";
import {
  getUsers,
  updateUser,
  deleteUser,
} from "../../services/apiService";
import { Link } from "react-router-dom";
import SignUpModal from "../auth/SignUpForm";
import { useAuth } from '../../components/Context/AuthProvider';

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const IndexConfig = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authToken } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [selectedMenuKey, setSelectedMenuKey] = useState("collaborators"); // Controla el menú activo
  const { user, userRole } = useAuth(); // Obtén los datos del usuario
  const defaultProfilePictureUrl =
    "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";

  useEffect(() => {
    if (selectedMenuKey === "collaborators") {
      fetchUsers();
    }
  }, [selectedMenuKey]);

  const openModal = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers(1, 10, '', authToken);
      setCollaborators(data);
    } catch (err) {
      message.error("Error al cargar los colaboradores");
      console.error("Error fetching users:", err.response ? err.response.data : err.message);
    } finally {
      setLoading(false);
    }
  };
  const handleDeleteCollaborator = (id) => {
    // Mostrar modal de confirmación antes de eliminar
    Modal.confirm({
      title: '¿Desea eliminar el colaborador?',
      content: 'Esta acción no se puede deshacer.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
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
        const color = role.toLowerCase() === "admin" ? "geekblue" : "green";
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
    <Layout style={{ minHeight: "100vh" }}>
      <Sider width={200} theme="light">
        <Menu
          mode="inline"
          defaultSelectedKeys={["collaborators"]}
          style={{ height: "100%", borderRight: 0 }}
          onClick={(e) => setSelectedMenuKey(e.key)} // Cambia la sección activa
        >
          <Menu.Item key="settings" icon={<SettingOutlined />}>
            Configuraciones
          </Menu.Item>
          <Menu.Item key="collaborators" icon={<TeamOutlined />}>
            Colaboradores
          </Menu.Item>
          <Menu.Item key="profile" icon={<ProfileOutlined />}>
            Perfil
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout style={{ padding: "0 24px 24px" }}>
        <Header style={{ background: "#fff", padding: 0 }}>
          <Title level={2} style={{ margin: "16px 0" }}>
            Configuración
          </Title>
        </Header>
        <Content
          style={{
            padding: 24,
            margin: 0,
            minHeight: 280,
            background: "#fff",
          }}
        >
          {selectedMenuKey === "collaborators" && (
            <>
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
            </>
          )}
          {selectedMenuKey === "profile" && (
            <Card
              style={{
                maxWidth: "400px",
                margin: "0 auto",
                textAlign: "center",
                padding: "20px",
              }}
            >
              <Avatar
                size={100}
                src={user?.profilepictureurl || defaultProfilePictureUrl}
                style={{ marginBottom: "16px" }}
              />
              <Title level={4}>{user?.username || "Usuario"}</Title>
              <p>Email: {user?.email || "No disponible"}</p>
              <p>Rol: {userRole || "No asignado"}</p>
              <p>Dirección: {user?.address || "No disponible"}</p>
              <p>Teléfono: {user?.phone || "No disponible"}</p>
            </Card>
          )}
        </Content>
      </Layout>
    </Layout>
  );
};

export default IndexConfig;
