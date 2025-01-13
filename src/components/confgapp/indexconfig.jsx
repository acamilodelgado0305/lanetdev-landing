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
  Form,
  Input,
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
  updateUserInfo,
  getUserById
} from "../../services/apiService";
import { Link } from "react-router-dom";
import SignUpModal from "../auth/SignUpForm";
import { useAuth } from '../../components/Context/AuthProvider';
import ImageUploader from "../../components/user/ImageUpload"
const { Header, Content, Sider } = Layout;
const { Title } = Typography;
const IndexConfig = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [collaborators, setCollaborators] = useState([]);
  const [loading, setLoading] = useState(false);
  const { authToken, setUser } = useAuth();
  const [editingUser, setEditingUser] = useState(null);
  const [selectedMenuKey, setSelectedMenuKey] = useState("collaborators");
  const { user, userRole } = useAuth();
  const [isEditProfileModalOpen, setIsEditProfileModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [profilePictureUrl, setProfilePictureUrl] = useState(user?.profilepictureurl || defaultProfilePictureUrl);
  const [form] = Form.useForm();

  const defaultProfilePictureUrl = "https://i.pinimg.com/736x/0d/64/98/0d64989794b1a4c9d89bff571d3d5842.jpg";

  useEffect(() => {
    setProfilePictureUrl(user?.profilepictureurl || defaultProfilePictureUrl);
  }, [user]);

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

  const fetchUser = async () => {
    try {
      const updatedUser = await getUserById(user.id, authToken); // Llama a la API para obtener los datos actualizados.
      setUser(updatedUser); // Actualiza los datos del usuario en el contexto.
    } catch (error) {
      console.error("Error al obtener los datos del usuario:", error);
      message.error("Error al actualizar los datos del usuario");
    }
  };

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


  const handleEditProfile = async (values) => {
    try {
      await updateUserInfo(user.id, values, authToken);
      await fetchUser();
      message.success("Datos personales actualizados correctamente");
      setIsEditProfileModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar los datos:", error);
      message.error("Error al actualizar los datos personales");
    }
  };

  const handleChangePassword = async (values) => {
    try {
      console.log("Nueva contraseña:", values.password);
      message.success("Contraseña cambiada con éxito");
      setIsChangePasswordModalOpen(false);
    } catch (error) {
      message.error("Error al cambiar la contraseña");
    }
  };

  const handleUploadSuccess = (uploadedUrl) => {
    setProfilePictureUrl(uploadedUrl);
    message.success("Imagen de perfil actualizada correctamente");
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
          onClick={(e) => setSelectedMenuKey(e.key)}
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
                maxWidth: "600px",
                margin: "20px auto",
                textAlign: "center",
                padding: "30px",
                boxShadow: "0px 8px 20px rgba(0, 0, 0, 0.1)",
                borderRadius: "15px",
                backgroundColor: "#ffffff",
                border: "1px solid #eaeaea",
              }}
            >
              {/* Sección para mostrar y actualizar la imagen */}
              <div
                style={{
                  textAlign: "center",
                  marginBottom: "20px",
                  padding: "20px",
                  backgroundColor: "#f0f2f5",
                  borderRadius: "10px",
                }}
              >
                <Avatar
                  size={100}
                  src={profilePictureUrl}
                  style={{
                    marginBottom: "16px",
                    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.15)",
                    border: "3px solid #1890ff",
                  }}
                />
                <ImageUploader
                  userId={user?.id}
                  authToken={authToken}
                  onUploadSuccess={handleUploadSuccess}
                />
              </div>
              <Title level={3} style={{ marginBottom: "20px", color: "#1890ff" }}>
                {user?.username || "Usuario"}
              </Title>

              <p style={{ fontSize: "18px", color: "#555", marginBottom: "15px" }}>
                <strong>Email:</strong> {user?.email || "No disponible"}
              </p>
              <p style={{ fontSize: "18px", color: "#555", marginBottom: "15px" }}>
                <strong>Rol:</strong> {userRole || "No asignado"}
              </p>
              <p style={{ fontSize: "18px", color: "#555", marginBottom: "15px" }}>
                <strong>Dirección:</strong> {user?.address || "No disponible"}
              </p>
              <p style={{ fontSize: "18px", color: "#555", marginBottom: "15px" }}>
                <strong>Teléfono:</strong> {user?.phone || "No disponible"}
              </p>
              <Button
                type="primary"
                onClick={() => setIsEditProfileModalOpen(true)}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Editar Perfil
              </Button>
              <Button
                danger
                onClick={() => setIsChangePasswordModalOpen(true)}
                style={{
                  padding: "12px 24px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  fontWeight: "bold",
                }}
              >
                Cambiar Contraseña
              </Button>
            </Card>
          )}
        </Content>
      </Layout>
      <Modal
        title="Editar Perfil"
        visible={isEditProfileModalOpen}
        onCancel={() => setIsEditProfileModalOpen(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleEditProfile}
          initialValues={{
            username: user?.username,
            address: user?.address,
            phone: user?.phone,
          }}
        >
          <Form.Item
            label="Nombre"
            name="username"
            rules={[{ required: true, message: "Por favor ingresa tu nombre" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Dirección"
            name="address"
            rules={[{ required: true, message: "Por favor ingresa tu dirección" }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            label="Teléfono"
            name="phone"
            rules={[{ required: true, message: "Por favor ingresa tu teléfono" }]}
          >
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Guardar Cambios
          </Button>
        </Form>
      </Modal>


      {/* Modal para cambiar contraseña */}
      <Modal
        title="Cambiar Contraseña"
        visible={isChangePasswordModalOpen}
        onCancel={() => setIsChangePasswordModalOpen(false)}
        footer={null}
      >
        <Form layout="vertical" onFinish={handleChangePassword}>
          <Form.Item
            label="Nueva Contraseña"
            name="password"
            rules={[
              { required: true, message: "Por favor ingresa una contraseña" },
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Form.Item
            label="Confirmar Contraseña"
            name="confirmPassword"
            dependencies={["password"]}
            rules={[
              {
                required: true,
                message: "Por favor confirma tu contraseña",
              },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject("Las contraseñas no coinciden");
                },
              }),
            ]}
          >
            <Input.Password />
          </Form.Item>
          <Button type="primary" htmlType="submit">
            Cambiar Contraseña
          </Button>
        </Form>
      </Modal>
    </Layout>
  );
};

export default IndexConfig;
